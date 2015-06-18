/*
 * preprocess
 * https://github.com/onehealth/preprocess
 *
 * Copyright (c) 2012 OneHealth Solutions, Inc.
 * Written by Jarrod Overson - http://jarrodoverson.com/
 * Licensed under the Apache 2.0 license.
 */

'use strict';

exports.preprocess         = preprocess;
exports.preprocessFile     = preprocessFile;
exports.preprocessFileSync = preprocessFileSync;
exports.resetIncluded      = resetIncluded;

var path  = require('path'),
    fs    = require('fs'),
    os    = require('os'),
    delim = require('./regexrules'),
    XRegExp = require('xregexp').XRegExp;

function preprocessFile(src, dest, context, callback) {
  context.src = src;
  context.srcDir = path.dirname(src);

  fs.readFile(src,function(err,data){
    if (err) return callback(err,data);
    var parsed = preprocess(data, context, getExtension(src));
    fs.writeFile(dest,parsed,callback);
  });
}

function preprocessFileSync(src, dest, context) {
  context.src = src;
  context.srcDir = path.dirname(src);

  var data = fs.readFileSync(src);
  var parsed = preprocess(data, context, getExtension(src));
  return fs.writeFileSync(dest,parsed);
}


function getExtension(filename) {
  var ext = path.extname(filename||'').split('.');
  return ext[ext.length - 1];
}

var includedSources = [];
function resetIncluded(){
	includedSources = [];
}

function preprocess(src,context,type,noRestoreEol,once) {
  src = src.toString();

  var srcEol = getEolType(src);
  src = normalizeEol(src);

  context = context || process.env;
  context = getFlattedContext(context);

  if (type == null || typeof delim[type] === 'undefined'){
    type = 'html';
  }

  var rv = src;

  rv = runAllRegex(rv, getRegex(type,'include'),processIncludeDirective.bind(null,false,context,type, false));
  rv = runAllRegex(rv, getRegex(type,'once'),processIncludeDirective.bind(null,false,context,type, true));

  if (delim[type].extend) {
    rv = replaceRecursive(rv, type, 'extend', function(startMatches, endMatches, include, recurse) {
      var file = (startMatches[1] || '').trim();
      var extendedContext = shallowCopy(context);
      extendedContext.src = path.join(context.srcDir, file);
      extendedContext.srcDir = path.dirname(extendedContext.src);
      if (!fs.existsSync(extendedContext.src)) {
        return extendedContext.src + ' not found';
      }
      var extendedSource = fs.readFileSync(extendedContext.src);
      extendedSource = preprocess(extendedSource, extendedContext, type, true).trim();
      if (extendedSource) {
        include = include.replace(/^\n?|\n?$/g, '');
        return extendedSource.replace(getRegex(type, 'extendable'), recurse(include));
      } else {
        return '';
      }
    });
  }

  if (delim[type].foreach) {
    rv = replaceRecursive(rv, type, 'foreach', function(startMatches, endMatches, include, recurse) {
      var variable = (startMatches[1] || '').trim();
      var forParams = variable.split(' ');
      if (forParams.length === 3) {
        var contextVar = forParams[2];
        var arrString = context[contextVar];
        var eachArr;
        if (arrString.match(/\{(.*)\}/)) {
          eachArr = JSON.parse(arrString);
        } else if (arrString.match(/\[(.*)\]/)) {
          eachArr = arrString.slice(1, -1);
          eachArr = eachArr.split(',');
          eachArr = eachArr.map(function(arrEntry){
            return arrEntry.replace(/\s*(['"])(.*)\1\s*/, '$2');
          });
        } else {
          eachArr = arrString.split(',');
        }

        var replaceToken = new RegExp(XRegExp.escape(forParams[0]), 'g');
        var recursedInclude = recurse(include);

        return Object.keys(eachArr).reduce(function(stringBuilder, arrKey){
          var arrEntry = eachArr[arrKey];
          return stringBuilder + recursedInclude.replace(replaceToken, arrEntry);
        }, '');
      } else {
        return '';
      }
    });
  }

  if (delim[type].exclude) {
    rv = replaceRecursive(rv, type, 'exclude', function(startMatches, endMatches, include, recurse){
      var test = (startMatches[1] || '').trim();
      return testPasses(test,context) ? '' : recurse(include);
    });
  }

  if (delim[type].if) {
    rv = replaceRecursive(rv, type, 'if', function (startMatches, endMatches, include, recurse) {
      var type = startMatches[1];
      var test = (startMatches[2] || '').trim();
      switch(type) {
        case 'if':
          return testPasses(test,context) ? recurse(include) : '';
        case 'ifdef':
          return typeof context[test] !== 'undefined' ? recurse(include) : '';
        case 'ifndef':
          return typeof context[test] === 'undefined' ? recurse(include) : '';
        default:
          throw new Error('Unknown if type ' + type + '.');
      }
    });
  }

  rv = runAllRegex(rv, getRegex(type,'echo'),function(match,variable) {
    variable = (variable || '').trim();
    // if we are surrounded by quotes, echo as a string
    var stringMatch = variable.match(/^(['"])(.*)\1$/);
    if (stringMatch) return stringMatch[2];

    return context[(variable || '').trim()];
  });

  rv = runAllRegex(rv, getRegex(type,'exec'),function(match,name,value) {
    name = (name || '').trim();
    value = value || '';

    var params = value.split(',');
    var stringRegex = /^['"](.*)['"]$/;

    params = params.map(function(param){
      param = param.trim();
      if (stringRegex.test(param)) { // handle string parameter
        return param.replace(stringRegex, '$1');
      } else { // handle variable parameter
        return context[param];
      }
    });

    if (!context[name] || typeof context[name] !== 'function') return '';

    return context[name].apply(context, params);
  });

  rv = runAllRegex(rv, getRegex(type,'include-static'),processIncludeDirective.bind(null,true,context,type, false));

  if (!noRestoreEol) {
    rv = restoreEol(rv, srcEol);
  }

  return rv;
}

function getEolType(source) {
  var eol;
  var foundEolTypeCnt = 0;

  if (source.indexOf('\r\n') >= 0) {
    eol = '\r\n';
    foundEolTypeCnt++;
  }
  if (/\r[^\n]/.test(source)) {
    eol = '\r';
    foundEolTypeCnt++;
  }
  if (/[^\r]\n/.test(source)) {
    eol = '\n';
    foundEolTypeCnt++;
  }

  if (eol == null || foundEolTypeCnt > 1) {
    eol = os.EOL;
  }

  return eol;
}

function normalizeEol(source, indent) {
  // only process any kind of EOL if indentation has to be added, otherwise replace only non \n EOLs
  if (indent) {
    source = source.replace(/(?:\r?\n)|\r/g, '\n' + indent);
  } else {
    source = source.replace(/(?:\r\n)|\r/g, '\n');
  }

  return source;
}

function restoreEol(normalizedSource, originalEol) {
  if (originalEol !== '\n') {
    normalizedSource = normalizedSource.replace(/\n/g, originalEol);
  }

  return normalizedSource;
}

function runAllRegex(rv, ruleRegex, processor) {
  if (!Array.isArray(ruleRegex)) {
    ruleRegex = [ruleRegex];
  }

  ruleRegex.forEach(function(rule){
    rv = rv.replace(rule, processor);
  });

  return rv;
}

function getRegex(type, def) {
  var rule = delim[type][def];

  var isRegex = typeof rule === 'string' || rule instanceof RegExp;
  var isArray = Array.isArray(rule);

  if (isRegex) {
    rule = new RegExp(rule,'gmi');
  } else if (isArray) {
    rule = rule.map(function(subRule){
      return new RegExp(subRule,'gmi');
    });
  } else {
    rule = new RegExp(rule.start + '((?:.|\n)*?)' + rule.end,'gmi');
  }

  return rule;
}

function replaceRecursive(rv, type, def, processor) {
  var rule = delim[type][def];

  if(!rule.start || !rule.end) {
    throw new Error('Recursive rule must have start and end.');
  }

  var startRegex = new RegExp(rule.start, 'mi');
  var endRegex = new RegExp(rule.end, 'mi');

  function matchReplacePass(content) {
    var matches = XRegExp.matchRecursive(content, rule.start, rule.end, 'gmi', {
      valueNames: ['between', 'left', 'match', 'right']
    });

    var matchGroup = {
      left: null,
      match: null,
      right: null
    };

    return matches.reduce(function (builder, match) {
      // seems to be a bug in XRegExp, contents of 'value' and 'name' entries are swapped
      switch(match.value) {
        case 'between':
          builder += match.name;
          break;
        case 'left':
          matchGroup.left = startRegex.exec(match.name);
          break;
        case 'match':
          matchGroup.match = match.name;
          break;
        case 'right':
          matchGroup.right = endRegex.exec(match.name);
          builder += processor(matchGroup.left, matchGroup.right, matchGroup.match, matchReplacePass);
          break;
      }
      return builder;
    }, '');
  }

  return matchReplacePass(rv);
}


function processIncludeDirective(isStatic,context,type, once, match,linePrefix,file){
  file = (file || '').trim();
  var indent = linePrefix.replace(/\S/g, ' ');
  var includedContext = shallowCopy(context);
  includedContext.src = path.join(context.srcDir,file);
  includedContext.srcDir = path.dirname(includedContext.src);
  if (!fs.existsSync(includedContext.src)) {
    return includedContext.src + ' not found';
  }
  if (once){
  	console.log(includedSources);
  	console.log(includedContext.src);
  	if (includedSources.indexOf(includedContext.src)>-1){
	  return "";
	}
    includedSources.push(includedContext.src);
  }
  var includedSource = fs.readFileSync(includedContext.src);
  if (isStatic) {
    includedSource = includedSource.toString();
  } else {
    includedSource = preprocess(includedSource, includedContext, type, true);
  }
  includedSource = normalizeEol(includedSource, indent);
  if (includedSource) {
    return linePrefix + includedSource;
  } else {
    return "";
  }
}

function getTestTemplate(test) {
  /*jshint evil:true*/
  test = test || 'true';
  test = test.trim();

  // force single equals replacement
  test = test.replace(/([^=!])=([^=])/g, '$1==$2');

  return new Function("context", "with (context||{}){ return ( " + test + " ); }");
}

function testPasses(test,context) {
  var testFn = getTestTemplate(test);
  return testFn(context);
}

function getFlattedContext(context) {
  return Object.keys(context).reduce(function (flattedCtx, key) {
    var ctxValue = context[key];
    flattedCtx[key] = ctxValue;

    if (typeof ctxValue === 'object') {
      var flatObject = getFlattedContext(ctxValue);

      Object.keys(flatObject).forEach(function (flatObjKey) {
        flattedCtx[key + '.' + flatObjKey] = flatObject[flatObjKey];
      });
    }

    return flattedCtx;
  }, {});
}

function shallowCopy(obj) {
  return Object.keys(obj).reduce(function (copyObj, objKey) {
    copyObj[objKey] = obj[objKey];
    return copyObj;
  }, {});
}

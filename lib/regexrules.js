
module.exports = {
  simple : {
    echo : "^@echo[ \t]*(.*)[ \t]*$",
    exec : "^@exec[ \t]*([^\n]*)[ \t]*\\(([^\n]*)\\)[ \t]*$",
    include          : "^(.*)@include(?!-)[ \t]*([^\n]*)[ \t]*$", // allow prefix characters to specify the indent level of included file
    once          : "^(.*)@once(?!-)[ \t]*([^\n]*)[ \t]*$", // allow prefix characters to specify the indent level of included file
    'include-static' : "^(.*)@include-static[ \t]*([^\n]*)[ \t]*$"
  },
  html : {
    echo : "<!--[ \t]*@echo[ \t]*([^\n]*?)[ \t]*-->",
    exec : "<!--[ \t]*@exec[ \t]*([^\n]*)[ \t]*\\(([^\n]*)\\)[ \t]*-->",
    include          : "(.*)<!--[ \t]*@include(?!-)[ \t]*([^\n]*)[ \t]*-->",
    once          : "(.*)<!--[ \t]*@once(?!-)[ \t]*([^\n]*)[ \t]*-->",
    'include-static' : "(.*)<!--[ \t]*@include-static[ \t]*([^\n]*)[ \t]*-->",
    exclude : {
      start : "(?:[ \t]*)?<!--[ \t]*@exclude[ \t]*([^\n]*?)[ \t]*-->(?:[ \t]*[\n]+)?",
      end   : "(?:[ \t]*)?<!--[ \t]*@endexclude[ \t]*-->(?:[ \t]*[\n])?"
    },
    extend : {
      start : "(?:[ \t]*)?<!--[ \t]*@extend(?!able)[ \t]*([^\n]*?)[ \t]*-->(?:[ \t]*[\n]+)?",
      end   : "(?:[ \t]*)?<!--[ \t]*@endextend[ \t]*-->(?:[ \t]*[\n])?"
    },
    extendable : "<!--[ \t]*@extendable[ \t]*-->",
    if : {
      start : "(?:[ \t]*)?<!--[ \t]*@(ifndef|ifdef|if)[ \t]*(.*?)(?:(?!-->|!>))[ \t]*(?:-->|!>)(?:[ \t]*[\n]+)?",
      end   : "(?:[ \t]*)?<!(?:--)?[ \t]*@endif[ \t]*-->(?:[ \t]*[\n])?"
    },
    foreach : {
      start : "(?:[ \t]*)?<!--[ \t]*@foreach[ \t]*(.*?)(?:(?!-->|!>))[ \t]*(?:-->|!>)(?:[ \t]*[\n]+)?",
      end   : "(?:[ \t]*)?<!(?:--)?[ \t]*@endfor[ \t]*-->(?:[ \t]*[\n])?"
    }
  },
  js : {
    echo : [
      "(?:/\\*)[ \t]*@echo[ \t]*([^\n]*?)[ \t]*(?:\\*(?:\\*|/))",
      "(?://)[ \t]*@echo[ \t]*([^\n]*)[ \t]*"
    ],
    exec : "(?://|/\\*)[ \t]*@exec[ \t]*([^\n]*)[ \t]*\\(([^\n]*)\\)[ \t]*(?:\\*(?:\\*|/))?",
    include : [
      "(.*)(?:/\\*)[ \t]*@include(?!-)[ \t]*([^\n]*?)[ \t]*(?:\\*(?:\\*|/))",
      "(.*)(?://)[ \t]*@include(?!-)[ \t]*([^\n]*)[ \t]*"
    ],
    once : [
      "(.*)(?:/\\*)[ \t]*@once(?!-)[ \t]*([^\n]*?)[ \t]*(?:\\*(?:\\*|/))",
      "(.*)(?://)[ \t]*@once(?!-)[ \t]*([^\n]*)[ \t]*"
    ],
    'include-static': [
      "(.*)(?:/\\*)[ \t]*@include-static[ \t]*([^\n]*?)[ \t]*(?:\\*(?:\\*|/))",
      "(.*)(?://)[ \t]*@include-static[ \t]*([^\n]*)[ \t]*"
    ],
    exclude : {
      start : "(?:[ \t]*)?(?://|/\\*)[ \t]*@exclude[ \t]*([^\n*]*)[ \t]*(?:\\*(?:\\*|/))?(?:[ \t]*[\n]+)?",
      end   : "(?:[ \t]*)?(?://|/\\*)[ \t]*@endexclude[ \t]*(?:\\*(?:\\*|/))?(?:[ \t]*[\n])?"
    },
    extend : {
      start : "(?:[ \t]*)?(?://|/\\*)[ \t]*@extend(?!able)[ \t]*([^\n*]*)[ \t]*(?:\\*(?:\\*|/))?(?:[ \t]*[\n]+)?",
      end   : "(?:[ \t]*)?(?://|/\\*)[ \t]*@endextend[ \t]*(?:\\*(?:\\*|/))?(?:[ \t]*[\n])?"
    },
    extendable : "(?:[ \t]*)(?://|/\\*)[ \t]*@extendable[ \t]*([^\n*]*)[ \t]*(?:\\*/)?",
    if : {
      start : "(?:[ \t]*)?(?://|/\\*)[ \t]*@(ifndef|ifdef|if)[ \t]*([^\n*]*)[ \t]*(?:\\*(?:\\*|/))?(?:[ \t]*[\n]+)?",
      end   : "(?:[ \t]*)?(?://|/\\*)[ \t]*@endif[ \t]*(?:\\*(?:\\*|/))?(?:[ \t]*[\n])?"
    },
    foreach : {
      start : "(?:[ \t]*)?(?://|/\\*)[ \t]*@foreach[ \t]*([^\n*]*)[ \t]*(?:\\*(?:\\*|/))?(?:[ \t]*[\n]+)?",
      end   : "(?:[ \t]*)?(?://|/\\*)[ \t]*@endfor[ \t]*(?:\\*(?:\\*|/))?(?:[ \t]*[\n])?"
    }
  },
  coffee : {
    echo : "(?:[ \t]*)(?:#+)[ \t]*@echo[ \t]*([^\n]*)[ \t]*",
    exec : "(?:[ \t]*)(?:#+)[ \t]*@exec[ \t]*([^\n]*)[ \t]*\\(([^\n]*)\\)[ \t]*",
    include          : "(.*?)(?:#+)[ \t]*@include(?!-)[ \t]*([^\n]*)[ \t]*",
    once          : "(.*?)(?:#+)[ \t]*@once(?!-)[ \t]*([^\n]*)[ \t]*",
    'include-static' : "(.*?)(?:#+)[ \t]*@include-static[ \t]*([^\n]*)[ \t]*",
    exclude : {
      start : "(?:[ \t]*)(?:#+)[ \t]*@exclude[ \t]*([^\n*]*)[ \t]*(?:[ \t]*[\n]+)?",
      end   : "(?:[ \t]*)(?:#+)[ \t]*@endexclude[ \t]*(?:[ \t]*[\n])?"
    },
    extend : {
      start : "(?:[ \t]*)(?:#+)[ \t]*@extend(?!able)[ \t]*([^\n*]*)[ \t]*(?:[ \t]*[\n]+)?",
      end   : "(?:[ \t]*)(?:#+)[ \t]*@endextend[ \t]*(?:[ \t]*[\n])?"
    },
    extendable : "(?:[ \t]*)(?:#+)[ \t]*@extendable[ \t]*([^\n*]*)[ \t]*",
    if : {
      start : "(?:[ \t]*)(?:#+)[ \t]*@(ifndef|ifdef|if)[ \t]*([^\n*]*)[ \t]*(?:[ \t]*[\n]+)?",
      end   : "(?:[ \t]*)(?:#+)[ \t]*@endif[ \t]*(?:[ \t]*[\n])?"
    },
    foreach : {
      start : "(?:[ \t]*)(?:#+)[ \t]*@foreach[ \t]*([^\n*]*)[ \t]*(?:[ \t]*[\n]+)?",
      end   : "(?:[ \t]*)(?:#+)[ \t]*@endfor[ \t]*(?:[ \t]*[\n])?"
    }
  }
};

module.exports.xml        = module.exports.html;

module.exports.javascript = module.exports.js;
module.exports.c          = module.exports.js;
module.exports.cc         = module.exports.js;
module.exports.cpp        = module.exports.js;
module.exports.cs         = module.exports.js;
module.exports.csharp     = module.exports.js;
module.exports.java       = module.exports.js;
module.exports.less       = module.exports.js;
module.exports.sass       = module.exports.js;
module.exports.scss       = module.exports.js;
module.exports.css        = module.exports.js;
module.exports.php        = module.exports.js;
module.exports.ts         = module.exports.js;
module.exports.peg        = module.exports.js;
module.exports.pegjs      = module.exports.js;
module.exports.jade       = module.exports.js;
module.exports.styl       = module.exports.js;

module.exports.coffee     = module.exports.coffee;
module.exports.bash       = module.exports.coffee;
module.exports.shell      = module.exports.coffee;
module.exports.sh         = module.exports.coffee;

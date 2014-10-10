(function() {
  // Double scope: we want this code to execute in a non-strict environment where this points to the global
  var global = this;


  return function() {
    "use strict";


    /*
     * A collection of internal utilities. Not exported to consumers.
     *
     */


    var makeModule = function(require, exports) {
      /*
       * valueStringifier: Returns a string representation of the given value.
       *
       */

      var valueStringifier = function(v) {
        switch (typeof(v)) {
          case 'number':
          case 'boolean':
          case 'undefined':
            return '' + v;
          case 'string':
            return '\'' + v + '\'';
          case 'function':
            return v.toString();
          case 'object':
            if (v === null)
              return 'null';
            if (Array.isArray(v))
              return '[' + v.join(', ') + ']';
            return '{' + v.toString() + '}';
          default:
            return v.toString();
        }
      };


      /* checkIntegral: Takes a value and an optional error message. Throws a TypeError, with the given error
       *                if specified, when the value cannot be coerced to an integer, and returns the coerced
       *                integer in all other cases.
       *
       */

      var checkIntegral = function(n, message) {
        message = message || 'Value is not an integer';
        n = n - 0;

        if (isNaN(n) || !isFinite(n))
          throw new TypeError(message);

        if (n !== Math.floor(n) || n !== Math.ceil(n))
          throw new TypeError(message);

        return n;
      };


      /* checkPositiveIntegral: Takes a value and an optional error message. Throws a TypeError, with the given error
       *                        if specified, when the value cannot be coerced to a positive integer, and returns the
       *                        coerced integer in all other cases.
       *
       */

      var checkPositiveIntegral = function(n, message) {
        message = message || 'Value is not a positive integer';
        n = checkIntegral(n, message);

        if (n < 0)
          throw new TypeError(message);

        return n;
      };


      /*
       * isObjectLike: returns true if the given value is a string, array, function, or object,
       *               and false otherwise.
       *
       */

      var isObjectLike = function(v, options) {
        options = options || {};
        var strict = options.strict || false;
        var allowNull = options.allowNull || false;

        var acceptable = strict ? ['object'] : ['string', 'function', 'object'];
        if (strict && Array.isArray(v))
          return false;

        return (v === null && allowNull) || (v !== null && acceptable.indexOf(typeof(v)) !== -1);
      };


      /* checkObjectLike: takes a value and throws if it is not object-like, otherwise return a copy.
       *
       */

      var checkObjectLike = function(v, options) {
        options = options || {};
        var message = options.message || 'Value is not an object';
        var allowNull = options.allowNull || false;

        if (!isObjectLike(v, options))
          throw new TypeError(message);

        return v;
      };


      /*
       * isArrayLike: returns true if the given value is a string, array, or 'array-like', and false otherwise.
       *              Takes an optional 'noStrings' argument: strings will not be considered 'array-like' when
       *              this is true.
       *
       */

      var isArrayLike = function(v, noStrings) {
        noStrings = noStrings || false;

        if (typeof(v) === 'string')
          return !noStrings;

        if (typeof(v) !== 'object' || v === null)
          return false;

        if (Array.isArray(v))
          return true;

        if (!v.hasOwnProperty('length'))
          return false;

        var l = v.length;

        return l === 0 || (v.hasOwnProperty('0') && v.hasOwnProperty('' + (l - 1)));
      };


      /* checkArrayLike: takes a value and throws if it is not array-like, otherwise
       *                 return a copy.
       *
       */

      var checkArrayLike = function(v, options) {
        options = options || {};
        var message = options.message || 'Value is not a string or array';

        if (!isArrayLike(v, options.noStrings))
          throw new TypeError(message);

        // We allow an optional 'dontSlice' option for arrays and arraylikes. For example,
        // when implementing length, there is no need to copy the object, we can just read
        // the property
        if (typeof(v) === 'string' || ('dontSlice' in options && options.dontSlice))
          return v;

        return [].slice.call(v);
      };


      // The helpCache allows defineValue and help to provide help text. It is an array of 2-element arrays,
      // where the first value is a function, and the second the data for providing help text. Note that we can't
      // use an object to store these values, as we would be unable to use the defined values as keys: for example
      // every function would coerce to the string key "function" making them indistinguishable.
      var helpCache = [];


      // Utility for testing defineValue and help
      var resetHelpCache = function() {
        helpCache = [];
      };


      var registerHelp = function(fn, name, signature, classification, plugin, text) {
        // For moment, we ignore classification/plugin

        // Transform the text: strip whitespace and newlines, and insert empty lines where appropriate
        // necessary
        var newText = [];
        var lastLineWasEmpty = false;
        var inCodeBlock = false;

        text.forEach(function(lines, i) {
          lines = lines.split('\n');
          lines.forEach(function(line) {
            if (!inCodeBlock) {
              var trimmed = line.trim();

              if (i === 0 && trimmed !== '') {
                newText.push('');
                lastLineWasEmpty = true;
              }

              if (lastLineWasEmpty && trimmed === '')
                return;

              lastLineWasEmpty = trimmed === '';
              inCodeBlock = trimmed === '--';
              newText.push(trimmed);
            } else {
              // Don't alter code lines
              newText.push(line);
            }
          });
        });

        helpCache.push([fn, {name: name, signature: signature, text: newText}]);
      };


      // Locate any help text that has been provided for the given function.
      var lookupHelpFor = function(fn) {
        var text = null;

        // Abuse any for early exit semantics (we can't use indexOf, as helpCache contains arrays)
        helpCache.some(function(arr) {
          if (arr[0] === fn) {
            var fnData = arr[1];
            var name = fnData.name;
            var sig = typeof(fn) === 'function' ? '(' + fnData.signature + ')' : '';
            text = [name + sig].concat(fnData.text);
            return true;
          }

          return false;
        });

        return text;
      };


      // Returns true if val has a type that defineValue accepts.
      var isDefinable = function(val) {
        var t = typeof(val);
        return t === 'function' || (t === 'object' && val !== null && !Array.isArray(val));
      };


      // defineValue is the hook into the help system. It is essentially a side-effecting id function, as it takes
      // a function or string, and returns it. However the value being defined can be preceded by any number of strings
      // which may have meaning to the help system. Any calls to help will output text based on those strings.
      //
      // The value being defined must always be the last argument to defineValue. (This makes my source-code pretty!)
      //
      // When called with one or more strings, certain strings with special meaning must be supplied:
      //  - There must be exactly one string starting with "name:" which supplies the name of the value being defined
      //
      //  - For functions of arity > 1, there must be exactly one string starting with "signature", detailing the
      //    function's signature. This value is ignored for objects, and functions of arity 0
      //
      //  - Exactly one of the following:
      //     - a string starting with "classification:" defining the class of function being defined
      //       (this option should only be used by core funkierJS code)
      //     - a string starting with "plugin:" detailing the funkierJS plugin supplying this function
      //
      // There can be zero or more lines of explanatory text. Note the following:
      //
      //  - Lines starting with "-" will be indented in console output.
      //
      //  - Text between {{ and }} characters will be italicised in any generated HTML
      //
      //  - Text between pairs of __ characters will be strong emphasised in any generated HTML
      //
      //  - Text between [[ and ]] pairs are assumed to refer to refer to some other funkierJS value known to the
      //    help system. They will be linked appropriately in any generated HTML output.
      //
      //  - All text following a line consisting only of '--' characters is assumed to be an extended code example,
      //    and will be printed appropriately in the given environment.
      var defineValue = function() {
        var args = [].slice.call(arguments);

        if (args.length === 0)
          throw new TypeError('defineValue called without a value');

        var errorMessage = '';
        var name = '';
        var signature = '';
        var classification = '';
        var plugin = '';
        var fn = null;
        var text = [];

        // We abuse every to ensure an early exit if things go awry
        var valsOK = args.every(function(val, i) {
          var type = typeof(val);

          // The last argument must be a function or object
          if (i === args.length - 1) {
            if (!isDefinable(val)) {
               errorMessage = 'defineValue must be called with a function or object';
              return false;
            }

            fn = val;
            return true;
          } else {
            if (isDefinable(val)) {
              errorMessage = 'value being defined must be last argument to defineValue ';
              return false;
            }
          }

          if (type !== 'string') {
            errorMessage = 'defineValue can only be called with strings followed by an object or function';
            return false;
          }

          var specialRE = /^\s*((?:name)|(?:signature)|(?:classification)|(?:plugin))\s*:\s*(.*)$/i;
          var match = specialRE.exec(val);

          if (match === null) {
            // Not a special string, just regular explanatory text
            text.push(val);
            return true;
          }

          var lineType = match[1].trim().toLowerCase();
          var remaining = match[2].trim();

          switch (lineType) {
            case 'name':
              if (name !== '') {
                errorMessage = 'defineValue called with two \'name\' lines';
                return false;
              }

              name = remaining;
              break;

            case 'signature':
              if (signature !== '') {
                errorMessage = 'defineValue called with two \'signature\' lines';
                return false;
              }

              signature = remaining;
              break;

            case 'classification':
              if (classification !== '') {
                errorMessage = 'defineValue called with two \'classification\' lines';
                return false;
              } else if (plugin !== '') {
                errorMessage = 'defineValue called with both \'classification\'  and \'plugin\' lines';
                return false;
              }

              classification = remaining;
              break;

            case 'plugin':
              if (plugin !== '') {
                errorMessage = 'defineValue called with two \'plugin\' lines';
                return false;
              } else if (classification !== '') {
                errorMessage = 'defineValue called with both \'classification\'  and \'plugin\' lines';
                return false;
              }

              plugin = remaining;
              break;

            default:
              // Assume explanatory text with a colon
              text.push(val);
          }

          return true;
        });

        if (args.length > 1 && errorMessage === '') {
          if (name === '')
            errorMessage = 'defineValue called with no name for value';
          else if (signature === '' && typeof(fn) === 'function' && fn.length > 0)
            errorMessage = 'defineValue called with no signature for function';
          else if (signature !== '' && typeof(fn) === 'object')
            errorMessage = 'defineValue called with signature for non-function';
          else if (classification === '' && plugin === '')
            errorMessage = 'defineValue called with no classification/plugin for function';
        }

        if (errorMessage !== '')
          throw new TypeError(errorMessage);

        registerHelp(fn, name, signature, classification, plugin, text);
        return fn;
      };


      // The help text is used both for generation of documentation, and online help. For online help, we need to
      // strip any special formatting characters, and replace double dashes with 'For example:'
      var formatForConsole = function(text, inCodeBlock) {
        text = text.replace(/\[\[([^\]]+)\]\]/g, '$1');
        text = text.replace(/\{\{([^}]+)\}\}/g, '$1');
        text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
        text = text.replace(/__([^_]+)__/g, '$1');

        if (text === '--')
          text = 'For example:';

        if (text.indexOf('- ') === 0 || inCodeBlock && text.slice(0, 2) !== '  ')
          text = '  ' + text;

        return text;
      };


      var help = defineValue(
        'name: help',
        'signature: fn: function',
        'classification: base',
        '',
        'Outputs help (if available) for the given function fn to the console.',
        function(fn) {
          // Calculate the best function for this environment
          var writerFn;
          if (global.window === undefined && global.print !== undefined)
            writerFn = global.print;
          else
            writerFn = console.log.bind(console);

          var helpText = lookupHelpFor(fn);
          if (helpText === null)
            helpText = ['No help available for this function'];

          var inCodeBlock = false;
          helpText.forEach(function(text) {
            var newText = formatForConsole(text, inCodeBlock);
            inCodeBlock = inCodeBlock || text === '--';
            writerFn(newText);
          });
        }
      );


      var exported = {
        checkArrayLike: checkArrayLike,
        checkIntegral: checkIntegral,
        checkObjectLike: checkObjectLike,
        checkPositiveIntegral: checkPositiveIntegral,
        defineValue: defineValue,
        help: help,
        isArrayLike: isArrayLike,
        isObjectLike: isObjectLike,
        resetHelpCache: resetHelpCache,
        valueStringifier: valueStringifier
      };


      module.exports = exported;
    };


    // AMD/CommonJS foo
    if (typeof(define) === "function") {
      define(function(require, exports, module) {
        makeModule(require, exports, module);
      });
    } else {
      makeModule(require, exports, module);
    }
    }();
})();

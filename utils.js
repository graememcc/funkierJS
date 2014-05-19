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
        var options = options || {};
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
        var options = options || {};
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
        var options = options || {};
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


      // The helpCache allows defineFunction and help to provide help text. It is an array of 2-element arrays,
      // where the first value is a function, and the second the data for providing help text. Note that we can't
      // use an object: using the functions as keys won't work (they will all coerce to the string 'function',
      // making them indistinguishable

      var helpCache = [];


      // Utility for testing defineFunction and help
      var resetHelpCache = function() {
        helpCache = [];
      };


      var registerHelp = function(fn, name, signature, classification, plugin, text) {
        // For moment, we ignore classification/plugin

        // Transform the text: strip whitespace and newlines, and insert empty lines where appropriate
        // necessary
        var newText = [];
        var lastLineWasEmpty = false;
        text.forEach(function(lines, i) {
          lines = lines.split('\n');
          lines.forEach(function(line) {
            line = line.trim();

            if (i === 0 && line !== '') {
              newText.push('');
              lastLineWasEmpty = true;
            }

            if (lastLineWasEmpty && line === '')
              return;

            lastLineWasEmpty = line === '';
            newText.push(line);
          });
        });

        helpCache.push([fn, {name: name, signature: signature, text: newText}]);
      };


      var lookupHelpFor = function(fn) {
        var text = null;

        // Abuse any for early exit semantics (we can't use indexOf)
        helpCache.some(function(arr) {
          if (arr[0] === fn) {
            var fnData = arr[1];
            var name = fnData.name;
            var sig = fnData.signature;
            text = [name + '(' + sig + ')'].concat(fnData.text);
            return true;
          }

          return false;
        });

        return text;
      };


      // defineFunction returns the function, and optionally takes several strings to be returned
      // as help text, and to be used in documentation generation. If you call it with strings, then
      // the following must be present:
      //  - a string starting with "name: " defining the function name
      //  - a string starting with "signature: " defining the type signature of the function
      //  - either of:
      //     - a string starting with "classification: " defining the class of functionality of the function
      //         (this should only be used by funkierJS core)
      //     - a string starting with "plugin: " defining the plugin this function came from
      // These can then be followed by lines of explanatory text, detailing the functionality of the function
      var defineFunction = function() {
        var args = [].slice.call(arguments);

        if (args.length === 0)
          throw new TypeError('defineFunction called with no function');

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

          // The last argument must be a function
          if (i === args.length - 1) {
            if (type !== 'function') {
              errorMessage = 'defineFunction must be called with a function';
              return false;
            }
            fn = val;
            return true;
          } else {
            if (type === 'function') {
              errorMessage = 'function must be last argument to defineFunction';
              return false;
            }
          }

          if (type !== 'string') {
            errorMessage = 'defineFunction can only be called with strings and a function';
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
                errorMessage = 'defineFunction called with two \'name\' lines';
                return false;
              }

              name = remaining;
              break;

            case 'signature':
              if (signature !== '') {
                errorMessage = 'defineFunction called with two \'signature\' lines';
                return false;
              }

              signature = remaining;
              break;

            case 'classification':
              if (classification !== '') {
                errorMessage = 'defineFunction called with two \'classification\' lines';
                return false;
              } else if (plugin !== '') {
                errorMessage = 'defineFunction called with both \'classification\'  and \'plugin\' lines';
                return false;
              }

              classification = remaining;
              break;

            case 'plugin':
              if (plugin !== '') {
                errorMessage = 'defineFunction called with two \'plugin\' lines';
                return false;
              } else if (classification !== '') {
                errorMessage = 'defineFunction called with both \'classification\'  and \'plugin\' lines';
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
            errorMessage = 'defineFunction called with no name for function';
          else if (signature === '' && fn.length > 0)
            errorMessage = 'defineFunction called with no signature for function';
          else if (classification === '' && plugin === '')
            errorMessage = 'defineFunction called with no classification/plugin for function';
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

        if (text.indexOf('- ') === 0 || inCodeBlock)
          text = '  ' + text;

        return text;
      };


      var help = defineFunction(
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
        defineFunction: defineFunction,
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

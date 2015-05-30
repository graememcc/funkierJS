module.exports = (function() {
  "use strict";

  /*
   * A collection of internal utilities. Not exported to consumers.
   *
   * These utilities are deliberately split out from those in utils.js. Some functions here
   * depend on arityOf from curry.js, and we want curry.js to be able to use the functions
   * in utils.
   *
   */


  var curryModule = require('./components/curry');
  var arityOf = curryModule.arityOf;


  /*
   * Takes a value. Throws a TypeError if the value is not a function, and possibly return the
   * function otherwise, after any optional checks.
   *
   * This function takes an optional options object. The following properties are recognised:
   *   - message: the message the TypeError should contain if it proves necessary to throw
   *   - arity: in isolation, will restrict to accepting functions of this arity
   *   - minimum: when true, changes the meaning of arity to be the minimum accepted
   *
   */

  var checkFunction = function(f, options) {
    options = options || {};
    var message = options.message || 'Value is not a function';
    var arity = 'arity' in options ? options.arity : null;
    var minimum = options.minimum || false;

    if (minimum && !options.message)
      message = 'Value is not a function of arity ≥ ' + arity;

    var maximum = options.maximum || false;
    if (maximum && !options.message)
      message = 'Value is not a function of arity ≤ ' + arity;

    if (typeof(f) !== 'function')
      throw new TypeError(message);

    if (arity !== null) {
      var fArity = arityOf(f);

      if ((minimum && fArity < arity) || (maximum && fArity > arity) || (!minimum && !maximum && fArity !== arity))
        throw new TypeError(message);
    }

    return f;
  };


  return {
    checkFunction: checkFunction
  };
})();

// XXX Do we intend to allow these tests to be run in the browser
(function (root, factory) {
  var dependencies = [];

  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.

    define(['exports'].concat(dependencies), factory);
  } else if (typeof exports === 'object') {
    // CommonJS

    factory.apply(null, [exports].concat(dependencies.map(function(dep) { return require(dep); })));
  } else {
    // Browser globals

    root.commonJsStrict = root.commonJsStrict || {};
    factory.apply(null, [root].concat(dependencies.map(function(dep) {
      if (dep.slice(0, 2) == './') dep = dep.slice(2);
      if (dep.slice(0, 3) == '../') dep = dep.slice(3);
      return root[dep] || root.commonJsStrict[dep];
    })));
  }
}(this, function(exports) {
  "use strict";


  /*
   * Caution: over-engineering at work.
   *
   * The comment processor needs to test various combinations of input with different fields present or not present.
   * The array manipulation gradually became harder and harder to read, making it difficult to understand the intent
   * of the test. Hence, it was time to introduce some abstraction and add an interface for manipulating the test
   * input.
   *
   */

  // All the recognised properties. Many of this file's tests assume that they appear in ascending order in the test datagT
  var testDataProps = ['name', 'category', 'synonyms', 'parameters', 'returns', 'summary', 'details', 'examples'];


  var normalizePropName = function(name) {
    name = name.toLowerCase();
    if (name === 'return type' || name === 'returntype') name = 'returns';
    if (name === 'parameter') name = 'parameters';
    return name;
  };


  var getOffsetProperty = function(options) {
    return function(prop) {
      prop = normalizePropName(prop);
      var propIndex = this[prop];
      if (propIndex === undefined) throw new Error(options.name + ': Test data array does not have ' + prop);

      var indices = testDataProps.map(function(name) {
        return {name: name, index: this[name]};
      }, this).filter(function(obj, i, arr) { return obj.index !== undefined && options.compare(obj.index, propIndex); });
      indices.sort(function(a, b) { return options.sort(a.index, b.index); });

      return indices.length > 0 ? indices[0].name : undefined;
    };
  };


  var getNextProperty = getOffsetProperty({name: 'getNextProperty', compare: function(a, b) { return a > b; },
                                           sort: function(a, b) { return a - b; }});
  var getPreviousProperty = getOffsetProperty({name: 'getPreviousProperty', compare: function(a, b) { return a < b; },
                                           sort: function(a, b) { return b - a; }});


  var getPropertyLength = function(prop) {
    prop = normalizePropName(prop);
    var propIndex = this[prop];
    if (propIndex === undefined) throw new Error('getPropertyLength: Test data array does not have ' + prop);

    var nextProp = this.getNextProperty(prop);
    return (nextProp !== undefined ? this[nextProp] : this.length) - propIndex;
  };


  var removeProperty = function(prop) {
    prop = normalizePropName(prop);
    var propIndex = this[prop];
    if (propIndex === undefined) throw new Error('removeProperty: Test data array does not have ' + prop);

    var nextProp = this.getNextProperty(prop);
    var result = this.slice(0, propIndex).concat(this.slice(nextProp === undefined ? this.length : this[nextProp]));

    // We must only read diff if the property in question lies beyond the property removed. In particular, we shouldn't
    // read it if the last field is removed
    var diff;
    if (nextProp !== undefined) {
      diff = this[nextProp] - propIndex;
    }

    testDataProps.forEach(function(p) {
      var current = this[p];
      if (current === undefined || p === prop) return;
      result[p] = current < propIndex ? current : current - diff;
    }, this);

    return decorate(result, this.tag);
  };


  var moveBefore = function(propToMove, whereTo) {
    propToMove = normalizePropName(propToMove);
    var propToMoveIndex = this[propToMove];
    if (propToMoveIndex === undefined) throw new Error('moveBefore: Test data array does not have ' + propToMove);
    var propLength = this.getPropertyLength(propToMove);

    whereTo = normalizePropName(whereTo);
    var whereToIndex = this[whereTo];
    if (whereToIndex === undefined) throw new Error('moveBefore: Test data array does not have ' + whereTo);
    var whereToLength = this.getPropertyLength(whereTo);

    var movedPropDelta = whereToIndex < propToMoveIndex ? 0 : -propLength;
    var result = this.slice(0, propToMoveIndex).concat(this.slice(propToMoveIndex + propLength));
    result.splice.apply(result, [whereToIndex + movedPropDelta, 0].concat(this.slice(propToMoveIndex, propToMoveIndex + propLength)));

    var first = whereToIndex < propToMoveIndex ? whereToIndex : propToMoveIndex;
    var second = whereToIndex < propToMoveIndex ? propToMoveIndex + propLength : whereToIndex + whereToLength;

    var delta = (whereToIndex < propToMoveIndex ? 1 : -1) * propLength;
    var newLocationDelta = whereToIndex < propToMoveIndex ? propLength : 0;

    testDataProps.forEach(function(p) {
      var current = this[p];
      if (current === undefined) return;

      if (current < first || current >= second) {
        result[p] = current;
        return;
      }

      if (p === propToMove)
        result[p] = whereToIndex + movedPropDelta;
      else if (p === whereTo)
        result[p] = whereToIndex + newLocationDelta;
      else
        result[p] = this[p] + delta;
    }, this);

    return decorate(result, this.tag);
  };


  var moveAfter = function(propToMove, whereTo) {
    propToMove = normalizePropName(propToMove);
    var propToMoveIndex = this[propToMove];
    if (propToMoveIndex === undefined) throw new Error('moveBefore: Test data array does not have ' + propToMove);
    var propLength = this.getPropertyLength(propToMove);

    whereTo = normalizePropName(whereTo);
    var whereToIndex = this[whereTo];
    if (whereToIndex === undefined) throw new Error('moveBefore: Test data array does not have ' + whereTo);
    var whereToLength = this.getPropertyLength(whereTo);

    var movedPropDelta = whereToLength - (whereToIndex < propToMoveIndex ? 0 : propLength);
    var result = this.slice(0, propToMoveIndex).concat(this.slice(propToMoveIndex + propLength));
    result.splice.apply(result, [whereToIndex + movedPropDelta, 0].concat(this.slice(propToMoveIndex, propToMoveIndex + propLength)));

    var first = whereToIndex < propToMoveIndex ? whereToIndex : propToMoveIndex;
    var second = whereToIndex < propToMoveIndex ? propToMoveIndex + propLength : whereToIndex + whereToLength;

    var delta = (whereToIndex < propToMoveIndex ? 1 : -1) * propLength;
    var newLocationDelta = whereToIndex < propToMoveIndex ? 0 : -propLength;

    testDataProps.forEach(function(p) {
      var current = this[p];
      if (current === undefined) return;

      if (current < first || current >= second) {
        result[p] = current;
        return;
      }

      if (p === propToMove)
        result[p] = whereToIndex + movedPropDelta;
      else if (p === whereTo)
        result[p] = whereToIndex + newLocationDelta;
      else
        result[p] = this[p] + delta;
    }, this);

    return decorate(result, this.tag);
  };


  var getPropertyValue = function(prop) {
    prop = normalizePropName(prop);
    if (this[prop] === undefined) throw new Error('getPropertyValue: Test data array does not have ' + prop);

    var nextProp = this.getNextProperty(prop);
    var sliceEnd = nextProp !== undefined ? this[nextProp] : this.length;
    return this.slice(this[prop], sliceEnd);
  };


  var replaceProperty = function(prop, value) {
    prop = normalizePropName(prop);
    if (this[prop] === undefined) throw new Error('replaceProperty: Test data array does not have ' + prop);

    var result = this.slice();
    if (!Array.isArray(value)) value = [value];
    result.splice.apply(result, [this[prop], this.getPropertyLength(prop)].concat(value));

    var changePoint = this[prop];
    var delta = this.getPropertyLength(prop) - value.length;

    testDataProps.forEach(function(prop) {
      var index = this[prop];
      if (index === undefined) return;

      result[prop] = index - (index <= changePoint ? 0 : delta);
    }, this);

    return decorate(result, this.tag);
  };


  var applyToAll = function(fn) {
    var result = null;
    testDataProps.forEach(function(prop) {
      if (this[prop] === undefined) return;

      result = (result !== null ? result : this).replaceProperty(prop, fn(this.getPropertyValue(prop), prop));
    }, this);
    return result;
  };


  var decorate = function(arr, tag) {
    arr.getNextProperty = getNextProperty;
    arr.getPreviousProperty = getPreviousProperty;
    arr.removeProperty = removeProperty;
    arr.getPropertyLength = getPropertyLength;
    arr.moveBefore = moveBefore;
    arr.moveAfter = moveAfter;
    arr.getPropertyValue = getPropertyValue;
    arr.replaceProperty = replaceProperty;
    arr.applyToAll = applyToAll;
    arr.tag = tag;
    return arr;
  };


  var createTestData = function() {
    var props = [
      {name: 'name', value: 'testFunc'},
      {name: 'category', value: 'Category: funcCategory'},
      {name: 'synonyms', value: 'Synonyms: altName1, altName2'},
      {name: 'parameters', value: 'Parameter: x: number'},
      {name: 'returns', value: 'Returns: string'},
      {name: 'summary', value: ['The summary of the function', '']},
      {name: 'details', value: ['Details Line 1']},
      {name: 'examples', value: ['Examples:', 'var x = foo();']}
    ];

    var returnVal = [];
    props.forEach(function(p) {
      returnVal[p.name] = returnVal.length;
      if (Array.isArray(p.value)) {
        p.value.forEach(function(val) { returnVal.push(val); });
      } else {
        returnVal.push(p.value);
      }
    });

    returnVal = decorate(returnVal, 'apifunction');

    return returnVal;
  };


  exports.createTestData = createTestData;
  exports.standardProps = testDataProps;
}));

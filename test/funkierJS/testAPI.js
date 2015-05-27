(function() {
  "use strict";


  /* NOTE: THIS FILE IS AUTOMATICALLY GENERATED. DO NOT EDIT MANUALLY */


  var expect = require('chai').expect;
  var funkier = require('../../lib/funkier');


  describe('Documented values', function() {
    describe('arity', function() {
      it('arity exists', function() {
        expect(funkier).to.have.a.property('arity');
      });


      it('arity is a synonym for arityOf', function() {
        expect(funkier.arity).to.equal(funkier.arityOf);
      });
    });


    describe('arityOf', function() {
      it('arityOf exists', function() {
        expect(funkier).to.have.a.property('arityOf');
      });


      it('funkierJS\'s arityOf is indeed the documented value', function() {
        var module = require('../../lib/components/curry');
        expect(funkier.arityOf).to.equal(module.arityOf);
      });


      it('arityOf is a function', function() {
        expect(funkier.arityOf).to.be.a('function');
      });


      it('arityOf has documented arity', function() {
        expect(funkier.arityOf(funkier.arityOf)).to.equal(1);
      });


      it('arityOf is curried', function() {
        expect(funkier.arityOf._isCurried(funkier.arityOf)).to.equal(true);
      });
    });
  });


  describe('Exported values', function() {
    var documentedNames;


    beforeEach(function() {
      documentedNames = ['help', 'arity', 'arityOf'];
    });


    Object.keys(funkier).forEach(function(k) {
      var prop = funkier[k];
      if (k[0] === '_' || prop === null ||
          (typeof(prop) !== 'object' && typeof(prop) !== 'function'))
        return;

      it(k + ' is documented', function() {
        expect(documentedNames.indexOf(k)).to.not.equal(-1);
      });
    });
  });
})();

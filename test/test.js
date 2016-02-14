/**
 * mocha tests
 */
var calculator = require('../calculator.js')
var assert = require('assert');

//todo: seperate lexer, parser and interpreter into seperate files so they can be used as individual objects for testing
//var lexer = require('../lexer.js');
//var parser = require('../parser.js');
//var evaluator = require('../evaluator.js');

/**
 * takes a string expression,
 * @param  {[string]} expression [ex: 2 + 2]
 * @return {[number]} the result of the calculation
 */
function calculate(expression) {
    var lexer = new calculator._test.lex(expression);
    var interpreter = new calculator._test.interp(lexer);
    var result = interpreter.expr();
    return result;
}

//TOD
//TODO: fix tests now that visitor pattern has been implemented
describe('calculator tests', function() {
  describe('basic operators', function() {

    var test1 = calculate('1000+25');
    it('result for addition arithmetic should be 1025', function() {
      assert(test1 === 1025);
    });

    var test2 = calculate('1000-25');
    it('result for subtraction arithmetic should be 975', function() {
      assert(test2 === 975);
    });

    var test3 = calculate('1000*25');
    it('result for multiplication arithmetic should be 25000', function() {
      assert(test3 === 25000);
    });

    var test4 = calculate('1000/25');
    it('result for division arithmetic should be 40', function() {
      assert(test4 === 40);
    });
  });

  describe('other tests', function() {
    var test5 = calculate('10 + 10');
    it('should allow whitespace in input expression', function() {
      assert(test5 === 20);
    });

    var test6 = calculate('2 + 2 * 8'); // 16 + 2, see test7 also
    it('multiplication/division should evaluate before addition/subtraction', function() {
      assert(test6 === 18);
    });

    var test7 = calculate('(2 + 2) * 8'); // 4 * 8, would evaluate the same as above otherwise
    it('parenthesis should take precedence over other operators during evaluation', function() {
      assert(test7 === 32);
    });

    var test8 = calculate('((2 + 2) * 8 / 2) + 100 / 4 - (20 + 200) / 10'); //19
    it('should be able to handle an input expression of arbitrary length', function() {
      assert(test8 === 19);
    });

    var test9 = calculate('sin(20)');
    var result1 = parseFloat(test9);
    it('should resolve standalone sine operators correctly', function() {
      assert(result1 === 0.913);
    });

    var test10 = calculate('cos(20)');
    var result2 = parseFloat(test10);
    it('should resolve standalone cosine operators correctly', function() {
      assert(result2 === 0.408);
    });

    var test11 = calculate('tan(20)');
    var result3 = parseFloat(test11);
    it('should resolve standalone tangent operators correctly', function() {
      assert(result3 === 2.237);
    });

    var test12 = calculate('sin(20) + 10 - 5');
    var result4 = parseFloat(test12);
    it('should resolve sin within addition expressions', function() {
      assert(result4 === 5.913);
    });
  });

});

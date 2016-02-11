/**
 * mocha tests
 */
var calculator = require('../calculator.js')
var assert = require('assert');

describe('starter tests', function() {
  var lexer = new calculator._test.lex('1000 + 25');
  var interpreter = new calculator._test.interp(lexer);
  var result = interpreter.expr();
  it('calculator result for addition arithmetic should be 1025', function() {
    assert(result === 1025);
  });

  var lexer2 = new calculator._test.lex('1000 - 25');
  var interpreter2 = new calculator._test.interp(lexer2);
  var result2 = interpreter2.expr();
  it('calculator result for subtraction arithmetic should be 975', function() {
    assert(result2 === 975);
  });

  var lexer3 = new calculator._test.lex('1000 * 25');
  var interpreter3 = new calculator._test.interp(lexer3);
  var result3 = interpreter3.expr();
  it('calculator result for multiplication arithmetic should be 25000', function() {
    assert(result3 === 25000);
  });

  var lexer4 = new calculator._test.lex('1000 / 25');
  var interpreter4 = new calculator._test.interp(lexer4);
  var result4 = interpreter4.expr();
  it('calculator result for division arithmetic should be 40', function() {
    assert(result4 === 40);
  });
});

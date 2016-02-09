//AEL interpreter
//lexer: read code, character by character and create tokens
//parser: consumes tokens, creates parse tree object
//evaluator: evaluates parse tree object

/*
Write an interpreter that handles arithmetic expressions like “7 - 3 + 2 - 1” from scratch. Use any programming language you’re comfortable with and write it off the top of your head without looking at the examples. When you do that, think about components involved: a lexer that takes an input and converts it into a stream of tokens, a parser that feeds off the stream of the tokens provided by the lexer and tries to recognize a structure in that stream, and an interpreter that generates results after the parser has successfully parsed (recognized) a valid arithmetic expression. String those pieces together. Spend some time translating the knowledge you’ve acquired into a working interpreter for arithmetic expressions.*/

var readlineSync = require('readline-sync');
var logTokens = true;

// token takes a type and value
function Token(type, value) {
  this.type = type;
  this.value = value;
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

// todo:
// handle whitespace characters in the input
// handle integers of arbitrary
function Lexer (text) {
  this.text = text;
  this.position = 0;
  this.curr_char = text[this.position];

  Lexer.prototype.next_character = function() {
    this.position += 1;
    if (this.position > text.length - 1) {
      console.log('<done reading input>')
      this.curr_char = null;
    } else {
      this.curr_char = text[this.position];
    }
  }

  Lexer.prototype.get_next_token = function() {
    // turn a string of characters into tokens that are passed to the interpreter
    // handle integers and plus operators

    var token;
    //if the current character is numeric, check if the next one is and add them together
    if (isNumeric(this.curr_char)) {
      var result;
      while (this.curr_char !== null && isNumeric(this.curr_char)) {
        result = result + this.next_character();
      }
      console.log(result);

      token = new Token('INTEGER', parseInt(this.curr_char));
      if (logTokens) { console.log(token) }
      return token;
    }

    if (this.curr_char === '+') {
      token = new Token('PLUS', '+');
      if (logTokens) { console.log(token) }
      this.next_character();
      return token;
    }

    if (this.curr_char === '-') {
      token = new Token('MINUS', '-');
      if (logTokens) { console.log(token) }
      this.next_character();
      return token;
    }
  }

  Lexer.prototype.eat_token = function (token_type) {
    if (this.curr_token.type === token_type) {
      this.curr_token = this.get_next_token();
    } else {
      console.log('error, could not do');
    }
  }

  Lexer.prototype.expr = function () {
    // evaluate the expression
    this.curr_token = this.get_next_token();

    var left = this.curr_token;
    this.eat_token('INTEGER');

    var operator = this.curr_token;
    if (operator.type === 'PLUS') {
      this.eat_token('PLUS');
    } else if (operator.type === 'MINUS') {
      this.eat_token('MINUS');
    } else {
      throw Error('invalid operator type in expr');
    }

    var right = this.curr_token;
    this.eat_token('INTEGER');

    var result;
    if (operator.type === 'PLUS') {
      result = left.value + right.value;
    } else if (operator.type === 'MINUS') {
      result = left.value - right.value;
    } else {
      console.log('something isn\'t right');
    }
    return result;
  }
}

function Interpreter (lex) {

}

while (true) {
  var uInput = readlineSync.question('enter an arithmetic expression: ');
  var lexer = new Lexer(uInput);
  var result = lexer.expr();
  console.log(result);
}



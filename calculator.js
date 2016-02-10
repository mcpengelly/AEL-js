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
// handle integers of arbitrary character length/
// handle whitespace characters in the input/
// handle operations with multiple operators
// handle multiplcation and division
// establish precedence and association for operators
// handle parenthesis' in expression input

function Lexer (text) {
  this.text = text;
  this.position = 0;
  this.curr_char = text[this.position];

  Lexer.prototype.next_char = function() {
    this.position += 1;

    //if end is reached
    if (this.position > text.length - 1) {
      this.curr_char = null;
    } else {
      this.curr_char = text[this.position];
    }
  }

  // if whitespace detected just move on
  Lexer.prototype.skip_whitespace = function() {
    while (this.curr_char !== null && (this.curr_char === ' ' || this.curr_char === '\n' ||
           this.curr_char === '\t')) {
        this.next_char();
    }
  }

  Lexer.prototype.get_next_token = function() {
    // turn a string of characters into tokens that are passed to the interpreter
    // handle integers and plus operators

    while (this.curr_char !== null) {

      var token;
      // if whitespace ignore it
      if (this.curr_char === ' ' || this.curr_char === '\n' || this.curr_char === '\t') {
        this.skip_whitespace();
      }

      // if the character is numeric, check if the next one is, continue until char isnt numeric
      // concat together the numbers as it goes, cast the result to a number
      if (isNumeric(this.curr_char)) {
        var result = '';

        while (this.curr_char !== null && isNumeric(this.curr_char)) {
          result += this.curr_char;
          this.next_char();
        }
        var digit = parseInt(result);
        token = new Token('INTEGER', digit);
        if (logTokens) { console.log(token) }
        return token;
      }

      if (this.curr_char === '+') {
        token = new Token('PLUS', '+');
        if (logTokens) { console.log(token) }
        this.next_char();
        return token;
      }

      if (this.curr_char === '-') {
        token = new Token('MINUS', '-');
        if (logTokens) { console.log(token) }
        this.next_char();
        return token;
      }
    }
    //no characters remaining, return end of file token
    return new Token('EOF', null);
  }

  Lexer.prototype.eat_token = function (token_type) {
    if (this.curr_token.type === token_type) {
      this.curr_token = this.get_next_token();
    } else {
      console.log('error, could not eat token');
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

    if (operator.type === 'PLUS') {
      var result = left.value + right.value;
    } else if (operator.type === 'MINUS') {
      var result = left.value - right.value;
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



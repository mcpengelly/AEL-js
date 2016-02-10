// JavaScript AEL interpreter

/* components involved:
a lexer that takes an input and converts it into a stream of tokens,
a parser that feeds off the stream of the tokens provided by the lexer and tries to recognize a structure in that stream,
an interpreter that generates results after the parser has successfully parsed (recognized) a valid arithmetic expression.
*/

/* todo
handle integers of arbitrary character length/
handle whitespace characters in the input/
handle operations with multiple operators/
handle multiplcation and division/
establish precedence and association for operators
handle parenthesis' in expression input */

var readlineSync = require('readline-sync');
var logTokens = true; // toggle logging of read tokens

// token takes a type and value
function Token(type, value) {
  this.type = type;
  this.value = value;
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

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

      if (this.curr_char === '*' || this.curr_char.toLowerCase() === 'x') {
        token = new Token('MULTIPLY', '*');
        if (logTokens) { console.log(token) }
        this.next_char();
        return token;
      }

      if (this.curr_char === '/') {
        token = new Token('DIVIDE', '/');
        if (logTokens) { console.log(token) }
        this.next_char();
        return token;
      }

      // if (this.curr_char === '(') {
      //   token = new Token('LEFTPAREN')
      //   while (this.curr_char !== ')') {
      //     this.next_char();
      //   }
      // }
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

  Lexer.prototype.term = function () {
    token = this.curr_token;
    this.eat_token('INTEGER');
    return token.value;
  }

  // TODO: establish operator precedence and associativity (PEDMAS) using a Context Free Grammar
  Lexer.prototype.expr = function () {
    // evaluate the expression
    this.curr_token = this.get_next_token();

    result = this.term();
    while (this.curr_token.type === 'PLUS' || this.curr_token.type === 'MINUS' ||
    this.curr_token.type === 'MULTIPLY' || this.curr_token.type === 'DIVIDE'  ) {

      var operator = this.curr_token;
      if (operator.type === 'PLUS') {
        this.eat_token('PLUS');
        result = result + this.term();
      } else if (operator.type === 'MINUS') {
        this.eat_token('MINUS');
        result = result - this.term();
      } else if (operator.type === 'MULTIPLY') {
        this.eat_token('MULTIPLY');
        result = result * this.term();
      } else if (operator.type === 'DIVIDE') {
        this.eat_token('DIVIDE');
        result = result / this.term();
      } else {
        throw Error('invalid operator type in expr');
      }
    }
    return result;
  }
}

//todo: move excess portions of lexer into interpreter
function Interpreter (lex) {

}

while (true) {
  var uInput = readlineSync.question('enter an arithmetic expression: ');
  var lexer = new Lexer(uInput);
  var result = lexer.expr();
  console.log(result);
}

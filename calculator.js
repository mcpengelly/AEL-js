// JavaScript AEL interpreter

// for synchronous user input w/ node
var readlineSync = require('readline-sync');
var logTokens = true; // toggle auto-logging the tokens that get read

/** Utility function */
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * [Token: stores a type and value, to be fed into interpreter]
 * @param {string} type  [type of the token]
 * @param {string} value [value of the token]
 */
function Token(type, value) {
  this.type = type;
  this.value = value;
}

// Lexically analyze the string of characters input by the user, create and return tokens
function Lexer (text) {
  this.text = text;
  this.position = 0;
  this.curr_char = text[this.position];

  /**
   * increments the position of the character "pointer"
   * @return { character } returns the next character in the input sequence
   */
  Lexer.prototype.next_char = function () {
    this.position += 1;

    //if EOI is reached
    if (this.position > text.length - 1) {
      this.curr_char = null;
    } else {
      this.curr_char = text[this.position];
    }
  };

  /**
   * skips to the next character if it is a whitespace character,
   * until it sees non-whitespace character
   */
  Lexer.prototype.skip_whitespace = function () {
    while (this.curr_char !== null && (this.curr_char === ' ' ||
           this.curr_char === '\n' || this.curr_char === '\t')) {

        this.next_char();
    }
  };

  /**
   * scans the input creating tokens until the current character is null
   * @return { token } [returns a token object that gets fed into the interpreter]
   */
  Lexer.prototype.get_next_token = function () {
    // turn a string of characters into tokens that are passed to the interpreter
    while (this.curr_char !== null) {
      var token = '';
      //create unique tokens based on what characters the lexer reads

      // if whitespace
      if (this.curr_char === ' ' || this.curr_char === '\n' || this.curr_char === '\t') {
        this.skip_whitespace();
      }

      // if curr_char is numeric, check if the char is, continue until char isnt numeric
      // concat together the numbers as it goes, cast the result to a number (digit)
      if (isNumeric(this.curr_char)) {
        var result = '';

        while (this.curr_char !== null && isNumeric(this.curr_char)) {
          result += this.curr_char;
          this.next_char();
        }
        var digit = parseInt(result);
        token = new Token('INTEGER', digit);
        if (logTokens) { console.log(token); }
        return token;
      }

      if (this.curr_char === '+') {
        token = new Token('PLUS', '+');
        if (logTokens) { console.log(token); }
        this.next_char();
        return token;
      }

      if (this.curr_char === '-') {
        token = new Token('MINUS', '-');
        if (logTokens) { console.log(token); }
        this.next_char();
        return token;
      }

      if (this.curr_char === '*' || this.curr_char.toLowerCase() === 'x') {
        token = new Token('MULTIPLY', '*');
        if (logTokens) { console.log(token); }
        this.next_char();
        return token;
      }

      if (this.curr_char === '/') {
        token = new Token('DIVIDE', '/');
        if (logTokens) { console.log(token); }
        this.next_char();
        return token;
      }

      if (this.curr_char === '(') {
        token = new Token('LEFTPAREN', '(');
        if (logTokens) { console.log(token); }
        this.next_char();
        return token;
      }

      if (this.curr_char === ')') {
        token = new Token('RIGHTPAREN', ')');
        if (logTokens) { console.log(token); }
        this.next_char();
        return token;
      }
      //if this is reached an unrecognized operator has been used
      throw Error('Invalid operator type');
    }

    //curr_char is null, no characters remaining, return end of file token
    return new Token('EOF', null);
  };

}

// Interpreter: consumes tokens, evaluates results
function Interpreter (lex) {
  this.lexer = lex;
  this.curr_token = this.lexer.get_next_token();

/**
 * [eat_token: Compares the passed in token_type against the current token type, if they match get the next token, otherwise throw ]
 * @param  {string} token_type [a string representing the token type]
 * @return {null}
 */
  Interpreter.prototype.eat_token = function (token_type) {
    if (this.curr_token.type === token_type) {
      this.curr_token = this.lexer.get_next_token();
    } else {
      throw Error('Type Mismatch, passed in token type and current token don\'t match');
    }
  };

  /**
  * [FACTOR]
  * grammar: INTEGER | LEFTPAREN expr RIGHTPAREN
    represents the following expressions:
    1, 1231, 90, ... */
  Interpreter.prototype.factor = function () {
    var token = this.curr_token;
    var result = '';

    if (this.curr_token.type === 'INTEGER') {
      this.eat_token('INTEGER');
      return token.value;
    } else if (this.curr_token.type === 'LEFTPAREN') {
      this.eat_token('LEFTPAREN');
      result = this.expr();
      this.eat_token('RIGHTPAREN');
      return result;
    }
  };

  /**
  * [term: grammar for multiplication and/or division]
  FACTOR ((MUL|DIV) FACTOR)*
  represents the following expressions:
  2 * 1,
  9 * 10 / 2,
  2 / 1 * 1000 * 152,
  ... */
  Interpreter.prototype.term = function () {
    var result = this.factor();

    while (this.curr_token.type === 'MULTIPLY' || this.curr_token.type === 'DIVIDE') {
      if (this.curr_token.type === 'MULTIPLY') {
        this.eat_token('MULTIPLY');
        result = result * this.factor();
      } else if (this.curr_token.type === 'DIVIDE') {
        this.eat_token('DIVIDE');
        result = result / this.factor();
      } else {
        throw Error('invalid operator type in term()');
      }
    }
    return result;
  };

  /**
  * [expr: grammar for addition and/or subtraction]
    TERM ((PLUS|MINUS) TERM)*
    represents the following expressions:
    1 + 1,
    2 + 10 + 2,
    2 - 1 + 1000 - 152,
    ... */
  Interpreter.prototype.expr = function () {
    var result = this.term();

    while (this.curr_token.type === 'PLUS' || this.curr_token.type === 'MINUS') {

      var operator = this.curr_token;
      if (operator.type === 'PLUS') {
        this.eat_token('PLUS');
        result = result + this.term();
      } else if (operator.type === 'MINUS') {
        this.eat_token('MINUS');
        result = result - this.term();
      } else {
        throw Error('invalid operator type in expr()');
      }
    }
    return result;
  };

}

//entry point
while (true) {
  //take expression from standard input
  var uInput = readlineSync.question('enter an arithmetic expression (or enter exit to quit): ');
  if (uInput.toLowerCase() === 'exit') { break; } // early return to quit program
  var lexer = new Lexer(uInput);
  var interpreter = new Interpreter(lexer);
  var result = interpreter.expr(); // generate the result
  console.log(result);
}

//export objects for testing
exports._test = {
  lex: Lexer,
  interp: Interpreter
}

/* components involved:
a lexer that takes an input and converts it into a stream of tokens,
a parser that feeds off the stream of the tokens provided by the lexer and tries to recognize a structure in that stream,
an interpreter that generates results after the parser has successfully parsed (recognized) a valid arithmetic expression.
*/

/*
  handle integers of arbitrary character length/
  handle whitespace characters in the input/
  handle operations with multiple operators/
  handle multiplcation and division/
  establish precedence and association for operators/
  handle parenthesis' in expression input/
todo:
  add support for sine, cosine, tangent operations, ...
  add support for saving and reusing variables (?)
*/

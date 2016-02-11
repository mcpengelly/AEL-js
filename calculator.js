// JavaScript AEL interpreter

var readlineSync = require('readline-sync'); // for synchronous user input w/ node
var logTokens = true; // toggle auto-logging the tokens that get read

/** Helper func, if the string argument is a number return true*/
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

/** Helper func, if argument is an alphabet character return true, else return false*/
function isAlphabetChar(c) {
  var regexp = /[a-z]/;
  return regexp.test(c);
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

// Lexically analyze the string of characters in0put by the user, create and return tokens
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

  Lexer.prototype.read_char_sequence = function () {
    var sequence = '';
    var sNum = '';
    var digit;

    //read the whole character string, then hardcode index values? lol
    while ((this.curr_char !== null && isAlphabetChar(this.curr_char)) ||
     this.curr_char === '(' || isNumeric(this.curr_char) || this.curr_char === ')') {
        if (isNumeric(this.curr_char)) {
          while (isNumeric(this.curr_char)) {
            sNum = sNum + this.curr_char;
            this.next_char();
          }
          digit = sNum;
          sequence = sequence + digit;
        } else {
          sequence = sequence + this.curr_char;
          this.next_char();
        }
    }

    var seq = sequence.toLowerCase();
    var op = seq[0] + seq[1] + seq[2];// assume operators of of 3 character length. todo: refactor
    var token = '';
    var operatorArg = '';
    digit = parseFloat(digit);

    if (op === 'sin') {
      token = new Token('SINE', digit);
      if (logTokens) { console.log(token); }

      return token;
    } else if (op === 'cos') {
      token = new Token('COSINE', digit);
      if (logTokens) { console.log(token); }

      return token;
    } else if (op === 'tan') {
      token = new Token('TANGENT', digit);
      if (logTokens) { console.log(token); }

      return token;
    } else {
      throw Error('failed to recognize character sequence')
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

      //if an alphabetical character, read the sequence of characters and create a token from it
      //for this i assume the only expressions to be used are sin, cos, tan
      if (isAlphabetChar(this.curr_char)) {
        var token = this.read_char_sequence();
        return token;
      }

      // if curr_char is numeric, check if the char is, continue until char isnt numeric
      // concat together the numbers as it goes, cast the result to a number (digit)
      if (isNumeric(this.curr_char)) {
        var result = '';

        while (this.curr_char !== null && isNumeric(this.curr_char)) {
          result += this.curr_char;
          this.next_char();
        }
        var digit = parseFloat(result);
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

    while (this.curr_token.type === 'PLUS' || this.curr_token.type === 'MINUS' ||
     this.curr_token.type === 'SINE' ||
     this.curr_token.type === 'COSINE' ||
     this.curr_token.type === 'TANGENT') {

      var token = this.curr_token;
      if (token.type === 'PLUS') {
        this.eat_token('PLUS');
        result = parseFloat(result);
        result = result + this.term();
      } else if (token.type === 'MINUS') {
        result = parseFloat(result);
        this.eat_token('MINUS');
        result = result - this.term();

      //TODO: seperate this part out into a grammar of its own?
      } else if (token.type === 'SINE') {
        this.eat_token('SINE');
        result = Math.sin(token.value).toFixed(3);
      } else if (token.type === 'COSINE') {
        this.eat_token('COSINE');
        result = Math.cos(token.value).toFixed(3);
      } else if (token.type === 'TANGENT') {
        this.eat_token('TANGENT');
        result = Math.tan(token.value).toFixed(3);
      } else {
        throw Error('invalid operator type in expr()');
      }
    }
    //result = parseFloat(result);
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
  add support for sine, cosine, tangent operations, .../
  add support for saving and reusing variables (?)
*/

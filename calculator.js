// JavaScript AEL interpreter

// todo: add variable support
// parse pascal

  /** Helper methods */
  //todo: implement inheritsFrom

  function inheritsFrom (args) {
    //
  }

  function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  function isAlphabetChar(c) {
    var regexp = /[a-z]/;
    return regexp.test(c);
  }

  //todo: refactor
  var funcs = {
    getAttr: function(ele, attr) {
        var result = (ele.getAttribute && ele.getAttribute(attr)) || null;
        if( !result ) {
            var attrs = ele.attributes;
            var length = attrs.length;
            for(var i = 0; i < length; i++)
                if(attrs[i].nodeName === attr)
                    result = attrs[i].nodeValue;
        }
        return result;
      }
  };
  /** /Helper methods */

var readlineSync = require('readline-sync'); // for synchronous user input w/ node
var logTokens = true; // toggle auto-logging the tokens that get read

/**
 * [Token: stores a type and value, to be fed into interpreter]
 * @param {string} type  [type of the token]
 * @param {string} value [value of the token]
 */
function Token (type, value) {
  this.type = type;
  this.value = value;
}

/***************************************************
                      Lexer
*****************************************************/

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
      throw Error('failed to recognize character sequence');
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
        token = this.read_char_sequence();
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

/***************************************************
                      Parser
*****************************************************/

function AST () {}

// inherits from AST
function Num (token) {
  this.prototype = new AST();
  this.token = token;
  this.value = token.value;
}


//  inherits from AST
function BinOp (left, op, right) {
  this.prototype = new AST();
  this.left = left;
  this.token = this.op = op;
  this.right = right;
}

// Interpreter: consumes tokens, evaluates results
function Parser (lex) {
  this.lexer = lex;
  this.curr_token = this.lexer.get_next_token();

  /**
    * [eat_token: Compares the passed in token_type against the current token type, if they match get the next token, otherwise throw ]
    * @param  {string} token_type [a string representing the token type]
    * @return {null}
   */
  Parser.prototype.eat_token = function (token_type) {
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
  Parser.prototype.factor = function () {
    var token = this.curr_token;

    if (this.curr_token.type === 'INTEGER') {
      this.eat_token('INTEGER');
      return new Num(this.curr_token);
    } else if (this.curr_token.type === 'LEFTPAREN') {
      this.eat_token('LEFTPAREN');
      var node = this.expr();
      this.eat_token('RIGHTPAREN');
      return node;
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
  Parser.prototype.term = function () {
    var node = this.factor();

    while (this.curr_token.type === 'MULTIPLY' || this.curr_token.type === 'DIVIDE') {
      var token = this.curr_token;
      if (this.curr_token.type === 'MULTIPLY') {
        this.eat_token('MULTIPLY');
        } else if (this.curr_token.type === 'DIVIDE') {
        this.eat_token('DIVIDE');
        } else {
        throw Error('invalid operator type in term()');
        }
      node = new BinOp(node, token, this.factor());
    }
    return node;
  };

  /**
  * [expr: grammar for addition and/or subtraction]
    TERM ((PLUS|MINUS) TERM)*
    represents the following expressions:
    1 + 1,
    2 + 10 + 2,
    2 - 1 + 1000 - 152,
    ... */
  Parser.prototype.expr = function () {
    var node = this.term();

    while (this.curr_token.type === 'PLUS' || this.curr_token.type === 'MINUS' ||
     this.curr_token.type === 'SINE' ||
     this.curr_token.type === 'COSINE' ||
     this.curr_token.type === 'TANGENT') {

      var token = this.curr_token;
      if (token.type === 'PLUS') {
        this.eat_token('PLUS');
      } else if (token.type === 'MINUS') {
        this.eat_token('MINUS');
      } else {
        throw Error('invalid operator type in expr()');
      }
      /* //uncomment to enable SIN,COS,TAN tokens
        else if (token.type === 'SINE') {
        this.eat_token('SINE');
        result = Math.sin(token.value).toFixed(3);
      } else if (token.type === 'COSINE') {
        this.eat_token('COSINE');
        result = Math.cos(token.value).toFixed(3);
      } else if (token.type === 'TANGENT') {
        this.eat_token('TANGENT');
        result = Math.tan(token.value).toFixed(3);
      */

      node = new BinOp(node, token, this.term());
    }
    return node;
  };

  Parser.prototype.parse = function () {
    return this.expr();
  };

}


/***************************************************
                    Interpreter
*****************************************************/

//todo: implement js visitor pattern
function NodeVisitor () {

  NodeVisitor.prototype.visit = function(node) {
    var method_name = 'visit_' + typeof node;
    var visitor = funcs.getAttr(this, method_name);
    return visitor(node);
  };

  NodeVisitor.prototype.generic_visit = function () {
    throw Error('Problem occurred while visiting node!');
  };
}

// Parser: inherits NodeVisitor
function Interpreter (parser) {
  this.prototype = new NodeVisitor();
  this.prototype.constructor = this;
  this.prototype.parent = NodeVisitor.prototype;
  this.parser = parser;

  Interpreter.prototype.visit_BinOp = function (node) {
    console.log(node)
    if (node.op.type === 'PLUS') {
      return this.prototype.visit(node.left) + this.prototype.visit(node.right);
    } else if (node.op.type === 'MINUS') {
      return this.prototype.visit(node.left) - this.prototype.visit(node.right);
    } else if (node.op.type === 'MULTIPLY') {
      return this.prototype.visit(node.left) * this.prototype.visit(node.right);
    } else if (node.op.type === 'DIVIDE') {
      return this.prototype.visit(node.left) / this.prototype.visit(node.right);
    }
  };

  Interpreter.prototype.visit_Num = function (node) {
    return node.value;
  };

  Interpreter.prototype.interpret = function () {
   var tree = this.parser.parse();
   return this.prototype.visit(tree);
  };
}

//entry point
while (true) {
  //take expression from standard input
  var uInput = readlineSync.question('enter an arithmetic expression (or enter exit to quit): ');
  if (uInput.toLowerCase() === 'exit') { break; } // early return to quit program
  var lexer = new Lexer(uInput);
  var parser = new Parser(lexer);
  var interpreter = new Interpreter(parser);
  var result = interpreter.interpret(); // generate the result
  console.log(result);
}

//export objects for testing
exports._test = {
  lex: Lexer,
  par: Parser,
  interp: Interpreter
};


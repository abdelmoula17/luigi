import { TInputStream } from './inputStream';

export type TToken = {
  type: string;
  value: string | number;
};

export type TTokenStream = {
  next: () => TToken | null | undefined;
  peek: () => TToken;
  eof: () => boolean;
  panic: (msg: string) => void;
};

const KEY_WORDS: string[] = [
  'if',
  '?',
  'else',
  ':',
  'func',
  'true',
  'false',
  'for',
  'while',
];

export function TokenStream(input: TInputStream): TTokenStream {
  var current_token: TToken | null | undefined = null;
  /** HELPERS */
  function espc_str() {
    var end_of_str = '"';
    var str = '';
    var escaped = false;
    input.next();
    while (!input.eof()) {
      var current_char = input.next();
      if (escaped) {
        str += current_char;
        escaped = false;
      } else if (current_char === '\\') {
        escaped = true;
      } else if (current_char === end_of_str) {
        break;
      } else {
        str += current_char;
      }
    }
    return str;
  }
  function skip_comment() {
    read_while(function (char: string) {
      return char != '\n';
    });
    input.next();
  }
  //TODO::  should be in a separate component
  /** PREDICATES */
  function is_keyword(key: string) {
    return KEY_WORDS.includes(key);
  }
  function is_whitespace(char: string) {
    return ' \t\n'.indexOf(char) >= 0;
  }
  function is_string(char: string) {
    return char === '"';
  }
  function is_digit(char: string) {
    return /[0-9]/i.test(char);
  }
  function is_punc(char: string) {
    return '{}[]();,'.indexOf(char) >= 0;
  }
  function is_op(char: string) {
    return '+-*/%=&|<>!'.indexOf(char) >= 0;
  }
  function is_ternary_op(char: string) {
    return '?:'.indexOf(char) >= 0;
  }
  function is_id_start(char: string) {
    return /[a-z_]/i.test(char);
  }
  function is_id(char: string) {
    return is_id_start(char) || '?!-<>=0123456789'.indexOf(char) >= 0;
  }

  //TODO::  should be in a separate class
  /** READERS */
  function read_while(predicate: (char: string) => boolean) {
    let str: string = '';
    while (!input.eof() && predicate(input.peek())) str += input.next();
    return str;
  }
  function read_string() {
    return {
      type: 'str',
      value: espc_str(),
    };
  }

  function read_number() {
    var is_decimal = false;
    let number = read_while((char) => {
      if (char === '.') {
        if (!is_decimal) {
          is_decimal = true;
          return true;
        }
        return false;
      }
      return is_digit(char);
    });
    return {
      type: 'num',
      value: parseFloat(number),
    };
  }
  function read_identifier() {
    var ident = read_while(is_id);
    return {
      type: is_keyword(ident) ? 'kw' : 'var',
      value: ident,
    };
  }
  function read_punc() {
    return {
      type: 'punc',
      value: input.next(),
    };
  }
  function read_operation() {
    return {
      type: 'op',
      value: read_while(is_op),
    };
  }

  /** return token */
  function read_next_token(): TToken | undefined | null {
    read_while(is_whitespace);
    if (input.eof()) return null;
    var current_char = input.peek();
    if (current_char === '#') {
      skip_comment();
      return read_next_token();
    }
    if (is_string(current_char)) {
      return read_string();
    }
    if (is_digit(current_char)) {
      return read_number();
    }
    if (is_id_start(current_char)) {
      return read_identifier();
    }
    if (is_punc(current_char)) {
      return read_punc();
    }
    if (is_op(current_char)) {
      return read_operation();
    }
    if (is_ternary_op(current_char)) {
      return {
        type: 'ternary_op',
        value: input.next(),
      };
    }
    input.panic('Unknown character: ' + current_char + ' ');
  }

  function next() {
    var token = current_token;
    current_token = null;
    return token || read_next_token();
  }
  function peek(): TToken {
    return current_token || ((current_token = read_next_token()) as TToken);
  }
  function eof() {
    return peek() == null;
  }

  return {
    next: next,
    peek: peek,
    eof: eof,
    panic: input.panic,
  };
}

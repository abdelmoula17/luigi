import { TTokenStream } from './tokenStream';
var PRECEDENCE: {
  [key: string]: number;
} = {
  '=': 1,
  '||': 2,
  '&&': 3,
  '<': 7,
  '>': 7,
  '<=': 7,
  '>=': 7,
  '==': 7,
  '!=': 7,
  '+': 10,
  '-': 10,
  '*': 20,
  '/': 20,
  '%': 20,
};
export function Parser(input: TTokenStream) {
  function is_punc(char: string) {
    var current_token = input.peek();
    return (
      current_token &&
      current_token.type === 'punc' &&
      (!char || current_token.value === char) &&
      current_token
    );
  }

  function is_kw(keyword: string) {
    var current_token = input.peek();
    return (
      current_token &&
      current_token.type === 'kw' &&
      (!keyword || current_token.value === keyword) &&
      current_token
    );
  }
  function is_op(op?: string) {
    var current_token = input.peek();
    return (
      current_token &&
      current_token.type === 'op' &&
      (!op || current_token.value === op) &&
      current_token
    );
  }
  function is_ternary_op(op: string) {
    var current_token = input.peek();
    return (
      current_token &&
      current_token.type === 'ternary_op' &&
      (!op || current_token.value === op) &&
      current_token
    );
  }

  function skip_op(op: string) {
    if (is_op(op)) input.next();
    else input.panic('Excepcting operator: ( ' + op + ' )');
  }
  function skip_kw(keyword: string) {
    if (is_kw(keyword)) input.next();
    else input.panic('Excepcting keyword: ( ' + keyword + ' )');
  }

  function skip_punc(punc: string) {
    if (is_punc(punc)) input.next();
    else input.panic('Excepcting punctuation: ( ' + punc + ' )');
  }

  function skip_ternary_op(op: string) {
    if (is_ternary_op(op)) input.next();
    else input.panic('Excepcting operator: ( ' + op + ' )');
  }

  /**
   * the delimited function used to handle functions or for(loop) arguments
   * @param start
   * @param stop
   * @param separator
   * @param parser
   * @returns
   */
  function delimited(
    start: string,
    stop: string,
    separator: string,
    parser: any
  ) {
    var a = [],
      first = true;
    skip_punc(start);
    while (!input.eof()) {
      if (is_punc(stop)) break;
      if (first) first = false;
      else skip_punc(separator);
      if (is_punc(stop)) break;
      a.push(parser());
    }
    skip_punc(stop);
    return a;
  }
  function maybe_call(expr: any) {
    expr = expr();
    return is_punc('(') ? parse_func_call(expr) : expr;
  }

  /**
   * parse a function call
   * @param func
   * @returns
   */
  function parse_func_call(func: any) {
    return {
      type: 'func_call',
      func: func,
      args: delimited('(', ')', ',', parse_expression),
    };
  }

  /**
   * parse for loop
   * @returns
   */
  function parse_for_loop() {
    skip_kw('for');
    var args = delimited('(', ')', ';', parse_expression);
    var parsed = {
      type: 'for',
      initialisation: args[0],
      cond: args[1],
      iteration: args[2],
      body: parse_expression(),
    };
    return parsed;
  }

  /**
   * parse conditions
   * @returns
   */
  function parse_cond() {
    skip_kw('if');
    var condtition = parse_expression();
    if (!is_punc('{')) skip_ternary_op('?');
    var then_cond = parse_expression();
    var parsed: {
      type: string;
      cond: string;
      then: string;
      else?: any;
    } = {
      type: 'if',
      cond: condtition,
      then: then_cond,
    };
    if (is_ternary_op(':')) {
      input.next();
      parsed.else = parse_expression();
    }
    return parsed;
  }

  /**
   * parse booleans
   * @returns
   */
  function parse_bool() {
    return {
      type: 'bool',
      value: input?.next()?.value == 'true',
    };
  }

  /**
   * parse the program, this is the entry point
   * @returns
   */
  function parse_prog() {
    var block = delimited('{', '}', ';', parse_expression);
    if (block.length === 0) return false;
    if (block.length === 1) return block[0];
    return {
      type: 'prog',
      value: block,
    };
  }

  /**
   * parse variables names
   * @returns
   */
  function parse_varname() {
    var name = input.next();
    if (name?.type != 'var') input.panic('Expecting variable name');
    return name?.value;
  }

  /**
   * parse functions
   * @returns
   */
  function parse_func() {
    return {
      type: 'func',
      vars: delimited('(', ')', ',', parse_varname),
      body: parse_expression(),
    };
  }

  function parse_atom() {
    return maybe_call(() => {
      if (is_punc('(')) {
        input.next();
        var expr = parse_expression();
        skip_punc(')');
        return expr;
      }
      if (is_punc('{')) return parse_prog();
      if (is_kw('if')) return parse_cond();
      if (is_kw('for')) return parse_for_loop();
      if (is_kw('true') || is_kw('false')) return parse_bool();
      if (is_kw('func')) {
        input.next();
        return parse_func();
      }
      var token = input.next();
      if (
        token?.type == 'var' ||
        token?.type == 'num' ||
        token?.type == 'str'
      ) {
        return token;
      }
    });
  }

  function maybe_binary(left: any, current_prec: number): any {
    var current_token = is_op();
    if (current_token) {
      var token_prec = PRECEDENCE[current_token.value];
      if (token_prec > current_prec) {
        input.next();
        return maybe_binary(
          {
            type: current_token.value == '=' ? 'assign' : 'binary',
            operator: current_token.value,
            left: left,
            right: maybe_binary(parse_atom(), token_prec),
          },
          current_prec
        );
      }
    }
    return left;
  }
  function parse_expression() {
    return maybe_call(() => {
      return maybe_binary(parse_atom(), 0);
    });
  }

  function root_parse() {
    const content = [];
    while (!input.eof()) {
      content.push(parse_expression());
    }
    return {
      type: 'prog',
      value: content,
    };
  }
  return root_parse();
}

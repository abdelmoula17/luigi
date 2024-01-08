export type TInputStream = {
  next: () => string;
  peek: () => string;
  eof: () => boolean;
  panic: (msg: string) => void;
};

export function InputStream(input: string): TInputStream {
  var pos: number = 0;
  var line: number = 1;
  var column: number = 0;
  function next() {
    var char = input.charAt(pos++);
    if (char === '\n') {
      line++;
      column = 0;
    } else {
      column++;
    }
    return char;
  }

  function peek() {
    return input.charAt(pos);
  }

  function eof() {
    return peek() === '';
  }

  function panic(msg: string) {
    throw new Error(msg + '(' + line + ':' + column + ')');
  }
  return {
    next: next,
    peek: peek,
    eof: eof,
    panic: panic,
  };
}

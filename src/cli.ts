#!/usr/bin/env node

import { Command } from 'commander';
import { InputStream } from './inputStream';
import { TokenStream } from './tokenStream';
import { Parser } from './parser';
import { readFileSync } from 'fs';
import { Env } from './environment';
import { evaluator } from './evaluator';

const read_file = (filename: string) => readFileSync(`./${filename}`);

const parse = (code: string) => Parser(TokenStream(InputStream(code)));

const tokenizer = (code: string) => {
  const tokenStream = TokenStream(InputStream(code));
  const tokens = [];
  while (!tokenStream.eof()) tokens.push(tokenStream.next());
  return tokens;
};

const program = new Command();

program
  .option('-p, --parse', '<file>')
  .option('-c, --compile', 'compile the code')
  .option('-t, --tokenize ', '<file> tokenize the code');

program.parse(process.argv);

var options = program.opts();

/** generate the AST tree */
if (options.parse) {
  const code = read_file(program.args[0]);
  console.log(JSON.stringify(parse(code.toString())));
}

/** generate TOKENS */
if (options.tokenize) {
  const code = read_file(program.args[0]);
  console.log(JSON.stringify(tokenizer(code.toString())));
}

/** compile the input */
if (options.compile) {
  const code = read_file(program.args[0]);
  var ast = Parser(TokenStream(InputStream(code.toString())));
  var globalEnv = new Env();

  globalEnv.def('print', function (something: any) {
    console.log(something);
  });

  try {
    evaluator(ast, globalEnv);
  } catch (err) {
    console.log(err);
  }
}

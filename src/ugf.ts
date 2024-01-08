//@ts-nocheck
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
  .option('-a, --ast', 'generate the ast tree')
  .option('-p, --parse', '<file>')
  .option('-c, --compile', 'compile the code')
  .option('-t, --tokenize ', '<file> tokenize the code');

program.parse(process.argv);

var options = program.opts();

if (options.ast) console.log('generate the ast tree');
if (options.parse) {
  const code = read_file(program.args[0]);
  console.log(JSON.stringify(parse(code.toString())));
}
if (options.tokenize) {
  const code = read_file(program.args[0]);
  console.log(tokenizer(code.toString()));
}
if (options.compile) {
  const code = read_file(program.args[0]);
  var ast = Parser(TokenStream(InputStream(code.toString())));
  var globalEnv = new Env();
  globalEnv.def('print', function (txt) {
    console.log(txt);
  });
  try {
    evaluator(ast, globalEnv); // will print 5
  } catch (err) {
    console.log(err);
  }
}

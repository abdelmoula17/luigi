import { Env } from './environment';
import {
  TAssignNode,
  TBinaryNode,
  TConditionNode,
  TExpression,
  TExpressionType,
  TFuncCallNode,
  TFunctionNode,
  TForLoopNode,
  TNum,
  TOperator,
  TProg,
  TStr,
  TVar,
} from './type';

const handle_prog = (expression: TProg, env: Env) => {
  var val = false;
  expression.value.forEach((node: TExpression) => {
    val = evaluator(node, env);
  });
  return val;
};
const handle_primitives = (expression: TNum | TStr | TVar) => expression.value;

const handle_condition = (expression: TConditionNode, env: Env) => {
  var cond = evaluator(expression.cond, env);
  if (cond !== false) return evaluator(expression.then, env);
  return expression.else ? evaluator(expression.else, env) : false;
};

const handle_assign = (expression: TAssignNode, env: Env) => {
  if (expression.left.type != 'var')
    throw new Error('Cannot assign to ' + JSON.stringify(expression.left));
  return env.set(expression.left.value, evaluator(expression.right, env));
};

const handle_var = (expression: TVar, env: Env) => {
  return env.get(expression.value);
};

const handle_func_call = (expression: TFuncCallNode, env: Env) => {
  var func = evaluator(expression.func, env);
  return func.apply(
    null,
    expression.args.map(function (arg) {
      return evaluator(arg, env);
    })
  );
};

const handle_for_loop = (expression: TForLoopNode, env: Env) => {
  var scope = env.extend();
  for (
    evaluator(expression.initialisation, env);
    evaluator(expression.cond, env);
    evaluator(expression.iteration, env)
  ) {
    evaluator(expression.body, scope);
  }
};

const handle_func = (expression: TFunctionNode, env: Env) => {
  function func() {
    var var_names = expression.vars;
    var scope = env.extend();
    for (var i = 0; i < var_names.length; ++i) {
      scope.def(var_names[i], i < arguments.length ? arguments[i] : false);
    }
    return evaluator(expression.body, scope);
  }
  return func;
};

function apply_op(op: TOperator, a: TExpression, b: TExpression) {
  function num(x: TExpression) {
    if (typeof x != 'number') throw new Error('Expected number but got ' + x);
    return x;
  }
  function div(x: TExpression) {
    if (num(x) == 0) throw new Error('Divide by zero');
    return x;
  }
  switch (op) {
    case '+':
      return num(a) + num(b);
    case '-':
      return num(a) - num(b);
    case '*':
      return num(a) * num(b);
    case '/':
      return num(a) / (div(b) as number);
    case '%':
      return num(a) % (div(b) as number);
    case '&&':
      return a !== false && b;
    case '||':
      return a !== false ? a : b;
    case '<':
      return num(a) < num(b);
    case '>':
      return num(a) > num(b);
    case '<=':
      return num(a) <= num(b);
    case '>=':
      return num(a) >= num(b);
    case '==':
      return a === b;
    case '!=':
      return a !== b;
  }
  throw new Error("Can't apply operator " + op);
}

const handle_binary = (expression: TBinaryNode, env: Env) => {
  return apply_op(
    expression.operator,
    evaluator(expression.left, env),
    evaluator(expression.right, env)
  );
};

export function evaluator(expression: TExpression, env: Env): any {
  switch ((expression as { type: TExpressionType }).type) {
    case 'num':
    case 'str':
    case 'boolean':
      return handle_primitives(expression as TNum | TStr | TVar);
      break;
    case 'prog':
      return handle_prog(expression as TProg, env);
      break;
    case 'if':
      return handle_condition(expression as TConditionNode, env);
      break;
    case 'for':
      return handle_for_loop(expression as TForLoopNode, env);
      break;
    case 'assign':
      return handle_assign(expression as TAssignNode, env);
      break;
    case 'var':
      return handle_var(expression as TVar, env);
      break;
    case 'func_call':
      return handle_func_call(expression as TFuncCallNode, env);
      break;
    case 'func':
      return handle_func(expression as TFunctionNode, env);
      break;
    case 'binary':
      return handle_binary(expression as TBinaryNode, env);
      break;
    default:
      throw new Error(
        'Unexptected expression  ' +
          (expression as { type: TExpressionType }).type
      );
  }
}

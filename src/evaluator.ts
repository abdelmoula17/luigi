//TODO:: this code should be typed
export function evaluator(expression, env) {
  switch (expression.type) {
    case 'num':
    case 'str':
    case 'boolean':
      return expression.value;
      break;
    case 'prog':
      var val = false;
      expression.value.forEach((node) => {
        val = evaluator(node, env);
      });
      return val;
      break;
    case 'if':
      var cond = evaluator(expression.cond, env);
      if (cond !== false) return evaluator(expression.then, env);
      return expression.else ? evaluator(expression.else, env) : false;
      break;
    case 'assign':
      if (expression.left.type != 'var')
        throw new Error('Cannot assign to ' + JSON.stringify(expression.left));
      return env.set(expression.left.value, evaluator(expression.right, env));
      break;
    case 'var':
      return env.get(expression.value, env);
      break;
    case 'func_call':
      var func = evaluator(expression.func, env);
      return func.apply(
        null,
        expression.args.map(function (arg) {
          return evaluator(arg, env);
        })
      );
      break;
    case 'func':
      return build_function(expression, env);
      break;
    case 'binary':
      return apply_op(
        expression.operator,
        evaluator(expression.left, env),
        evaluator(expression.right, env)
      );
      return;
    default:
      throw new Error('Unexptected expression  ' + expression.type);
  }
}

function build_function(expression, env) {
  function func() {
    var var_names = expression.vars;
    var scope = env.extend();
    for (let i = 0; i < var_names.length; i++) {
      scope.def(var_names[i], i < arguments.length ? arguments[i] : false);
    }
    return evaluator(expression.body, scope);
  }
  return func;
}

function apply_op(op, a, b) {
  function num(x) {
    if (typeof x != 'number') throw new Error('Expected number but got ' + x);
    return x;
  }
  function div(x) {
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
      return num(a) / div(b);
    case '%':
      return num(a) % div(b);
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

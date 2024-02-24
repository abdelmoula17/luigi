export type TVar = {
  type: 'var';
  value: string;
};

export type TStr = {
  type: 'str';
  value: string;
};

export type TNum = {
  type: 'num';
  value: number;
};

export type TExpressionType =
  | 'num'
  | 'str'
  | 'boolean'
  | 'prog'
  | 'if'
  | 'assign'
  | 'var'
  | 'func_call'
  | 'func'
  | 'for'
  | 'binary';

export type TPrimitves = string | number | boolean | object;

export type TCondition = {
  type: 'if';
  value: TVar;
};

export type TFuncCallNode = {
  type: 'func_call';
  func: TVar;
  args: (TStr | TNum | TVar)[];
};

export type TConditionNode = {
  type: 'if';
  cond: TCondition;
  then: TExpression;
  else: TExpression;
};

export type TProg = {
  type: 'prog';
  value: TExpression[];
};

export type TFunctionNode = {
  type: 'func';
  vars: string[];
  body: TExpression;
};

export type TAssignNode = {
  type: 'assign';
  operator: '=';
  left: TNum | TVar;
  right: TNum | TVar | TFuncCallNode;
};

export type TOperator =
  | '+'
  | '/'
  | '*'
  | '-'
  | '>='
  | '>'
  | '<='
  | '<'
  | '%'
  | '&'
  | '|'
  | '||'
  | '&&'
  | '='
  | '=='
  | '!=';

export type TBinaryNode = {
  type: 'binary';
  operator: TOperator;
  left: TExpression;
  right: TExpression;
};

export type TForLoopNode = {
  type: 'for';
  initialisation: TAssignNode;
  cond: TConditionNode;
  iteration: TBinaryNode;
  body: TExpression;
};

export type TExpression =
  | TFuncCallNode
  | TAssignNode
  | TConditionNode
  | TProg
  | TFunctionNode
  | { type: TExpressionType }
  | TPrimitves;

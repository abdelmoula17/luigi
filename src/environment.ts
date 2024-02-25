export class Env {
  vars;
  parent;
  constructor(parent?: { vars: { [key: string]: any } }) {
    this.vars = Object.create(parent ? parent.vars : null);
    this.parent = parent;
  }

  /**
   *  extend the scope
   * @returns Env
   */
  extend() {
    return new Env(this);
  }

  /**
   * find the scope where the variable is defined
   * @param name
   * @returns
   */
  lookup(name: string) {
    var scope: any = this;
    while (scope) {
      if (Object.prototype.hasOwnProperty.call(scope.vars, name)) return scope;
      scope = scope.parent;
    }
  }

  /**
   * get the value of the variable
   * @param name
   * @returns
   */
  get(name: string) {
    if (name in this.vars) return this.vars[name];
    throw new Error('undefined variable ' + name);
  }

  /**
   * set the value of variable, the varibale should be at the current scope , if it's not throws an error
   * @param name
   * @param value
   * @returns
   */
  set(name: string, value: string) {
    let scope = this.lookup(name);
    if (!scope && this.parent) throw new Error('Undefined variable ' + name);
    return ((scope || this).vars[name] = value);
  }

  /**
   * creates a variable in the current scope
   * @param name
   * @param value
   * @returns
   */
  def(name: string, value: any) {
    return (this.vars[name] = value);
  }
}

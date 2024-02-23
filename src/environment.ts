export class Env {
  vars;
  parent;
  constructor(parent?: { vars: { [key: string]: any } }) {
    this.vars = Object.create(parent ? parent.vars : null);
    this.parent = parent;
  }
  extend() {
    return this;
  }

  lookup(name: string) {
    var scope: any = this;
    while (scope) {
      if (Object.prototype.hasOwnProperty.call(scope.vars, name)) return scope;
      scope = scope.parent;
    }
  }

  get(name: string) {
    if (name in this.vars) return this.vars[name];
    throw new Error('undefined variable ' + name);
  }

  set(name: string, value: string) {
    let scope = this.lookup(name);
    if (!scope && this.parent) throw new Error('Undefined variable ' + name);
    return ((scope || this).vars[name] = value);
  }

  def(name: string, value: any) {
    return (this.vars[name] = value);
  }
}

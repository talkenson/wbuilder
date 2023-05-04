export var Stack = class StackClass<T> {
  stack: T[] = []

  set(value: T[]) {
    this.stack = value
  }

  push(...values: T[]) {
    return this.stack.push(...values)
  }

  pop() {
    return this.stack.pop()
  }

  popMany(count: number) {
    if (count > this.stack.length) throw new Error('Stack exceeded')
    return this.stack.splice(-count)
  }

  peek() {
    return this.stack.at(-1)
  }

  export() {
    // Logging only
    return this.stack.join(' ')
  }

  get value() {
    return this.stack
  }

  get length() {
    return this.stack.length
  }

  toString() {
    return `Stack: [${this.export()}]`
  }
}

export type StackType<T> = (typeof Stack<T>)['prototype']

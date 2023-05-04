// node_modules/nanoid/index.browser.js
var random = (bytes) => crypto.getRandomValues(new Uint8Array(bytes));
var customRandom = (alphabet, defaultSize, getRandom) => {
  let mask = (2 << Math.log(alphabet.length - 1) / Math.LN2) - 1;
  let step = -~(1.6 * mask * defaultSize / alphabet.length);
  return (size = defaultSize) => {
    let id = "";
    while (true) {
      let bytes = getRandom(step);
      let j = step;
      while (j--) {
        id += alphabet[bytes[j] & mask] || "";
        if (id.length === size)
          return id;
      }
    }
  };
};
var customAlphabet = (alphabet, size = 21) => customRandom(alphabet, size, random);
var nanoid = (size = 21) => crypto.getRandomValues(new Uint8Array(size)).reduce((id, byte) => {
  byte &= 63;
  if (byte < 36) {
    id += byte.toString(36);
  } else if (byte < 62) {
    id += (byte - 26).toString(36).toUpperCase();
  } else if (byte > 62) {
    id += "-";
  } else {
    id += "_";
  }
  return id;
}, "");

// src/components/statement.ts
var nanoid2 = customAlphabet("0123456789", 4);
var markedLabel = (id) => (label, internalId = "") => `
!${label}${internalId ? `_${internalId}` : ""}_${id}#`;
var Statement = class {
  constructor(type) {
    this.type = type;
    this.id = nanoid2();
    this.genLabel = markedLabel(this.id);
  }
  params = {};
  id = "";
  genLabel;
  getType() {
    return this.type;
  }
  apply(field, value) {
    this.params[field] = value;
  }
  dump() {
    debug(JSON.stringify(this.params, null, 2));
  }
};

// src/components/assignment.ts
var AssignmentClass = class extends Statement {
  constructor() {
    super("assignment" /* Assignment */);
  }
  export() {
    pushLexem(this.params.id, ...this.params.value, "=");
  }
};

// src/components/condition.ts
var ConditionClass = class extends Statement {
  constructor() {
    super("condition" /* Condition */);
  }
  export() {
    pushLexem(
      ...this.params.condition,
      this.genLabel("Else"),
      "jumpElse" /* JUMP_ELSE */,
      ...this.params.trulyBody,
      this.genLabel("Exit"),
      "jump" /* JUMP */,
      this.genLabel("Else"),
      ...this.params.falsyBody ? this.params.falsyBody : [],
      this.genLabel("Exit")
    );
  }
};

// src/components/cycle.ts
var CycleClass = class extends Statement {
  constructor() {
    super("loop" /* Loop */);
  }
  export() {
    pushLexem(
      "stepInto" /* STEP_IN */,
      this.params.iterator,
      this.params.from,
      "=",
      this.genLabel("Condition"),
      this.params.iterator,
      this.params.to,
      "<=",
      this.genLabel("Exit"),
      "jumpElse" /* JUMP_ELSE */,
      ...this.params.body,
      this.params.iterator,
      this.params.iterator,
      this.params.step || 1,
      "+",
      "=",
      this.genLabel("Jump"),
      "jump" /* JUMP */,
      this.genLabel("Exit"),
      "stepOut" /* STEP_OUT */
    );
  }
};

// src/components/switch.ts
var SwitchClass = class extends Statement {
  constructor() {
    super("switch" /* Switch */);
    this.params.cases = [];
  }
  addCase(matcher, body) {
    this.apply("cases", [...this.params.cases, { matcher, body }]);
  }
  export() {
    pushLexem(
      "stepInto" /* STEP_IN */,
      ...this.params.cases.flatMap(({ matcher, body }, i) => [
        ...this.params.condition,
        ...matcher.length ? matcher : this.params.condition,
        "==",
        this.genLabel("Skip", i + 1),
        "jumpElse" /* JUMP_ELSE */,
        ...body,
        this.genLabel("Skip", i + 1)
      ]),
      this.genLabel("Exit"),
      "stepOut" /* STEP_OUT */
    );
  }
};

// src/std.ts
var Stack = class StackClass {
  stack = [];
  set(value) {
    this.stack = value;
  }
  push(...values) {
    return this.stack.push(...values);
  }
  pop() {
    return this.stack.pop();
  }
  popMany(count) {
    if (count > this.stack.length)
      throw new Error("Stack exceeded");
    return this.stack.splice(-count);
  }
  peek() {
    return this.stack.at(-1);
  }
  export() {
    return this.stack.join(" ");
  }
  get value() {
    return this.stack;
  }
  get length() {
    return this.stack.length;
  }
  toString() {
    return `Stack: [${this.export()}]`;
  }
};

// src/main.ts
var ignoreLastWord;
var operatorStack;
var operandStack;
var operandCount;
var tmp;
var depth;
var unSign = "";
var Machine = class StateMachine {
  history = new Stack();
  breadcrumbs = new Stack();
  constructor() {
  }
  reinit() {
    this.history = new Stack();
    this.breadcrumbs = new Stack();
  }
  getAll() {
    return this.history.value.join(" ");
  }
  setHistory(history) {
    this.history.set(history);
  }
  getHistory() {
    return this.history.value;
  }
  appendLexem(...lexs) {
    this.history.push(...lexs);
  }
  /**
   * Pushes current position into breadcrumbs stack
   */
  addCrumb() {
    this.breadcrumbs.push(this.history.length);
  }
  /**
   * Splits history in two by last breadcrumb, then keeps first part in, and return last part
   * @returns History
   */
  sliceCrumb() {
    const bcPosition = this.breadcrumbs.pop() || 0;
    let oldHistory = this.history.value.slice(
      -(this.history.length - bcPosition)
    );
    this.history.set(this.history.value.slice(0, bcPosition));
    return oldHistory;
  }
};
window.pushLexem = (...lexs) => machine.appendLexem(...lexs);
var p = pushLexem;
var pushHistory = (history) => machine.appendLexem(...history);
var writeError = (msg) => {
  errors.push(`Error: ${msg}`);
  hasError = true;
};
window.debug = (...any) => console.warn(...any);
var writeInfo = () => {
  pushLexem("\n");
  debugMessages.forEach((msg) => pushLexem(`${msg}
`));
  debugMessages = [];
  pushLexem("\n");
  errors.forEach((msg) => pushLexem(`${msg}
`));
  errors = [];
  hasError = false;
};
var getLabel = (label) => `
#${label}_${operandStack.peek()}#`;
var setLabel = (label) => pushLexem(getLabel(label));
var setJump = (label) => pushLexem(getLabel(label), "jump" /* JUMP */);
var setJumpElse = (label) => pushLexem(getLabel(label), "jumpElse" /* JUMP_ELSE */);
var pushVar = (name) => pushLexem(`${name} ${operandStack.peek()}`);
var pushExit = () => {
  exits.length === 0 ? writeError("No exits or function declarations") : pushLexem(exits.peek(), "jump" /* JUMP */);
};
window.loopExit = () => {
  const upperBound = stack.value.findLast(
    (v) => v.getType() === "loop" /* Loop */
  );
  if (!upperBound) {
    writeError("Cannot escape from nothing");
    throw new Error("Unhandled exit");
    return;
  }
  pushLexem(upperBound.genLabel("Exit"), "stepOut" /* STEP_OUT */);
};
var getPriority = (lex) => {
  if (!lex)
    return -1;
  if (lex === "~")
    return 9;
  if (lex === "!")
    return 8;
  if (lex.match(/[%*\/]/g))
    return 6;
  if (lex.match(/[+-]/g))
    return 5;
  if (lex.match(/[><]=?/g))
    return 4;
  if (lex.match(/[!=]=?/g))
    return 3;
  if (lex === "&&")
    return 2;
  if (lex === "||")
    return 1;
  return 0;
};
var handle = (op) => {
  while (operatorStack.length) {
    if (getPriority(operatorStack.peek()) >= getPriority(op)) {
      pushLexem(operatorStack.pop());
    } else {
      break;
    }
  }
  operatorStack.push(op);
};
var handleUnary = (op) => handle(op === "-" ? "~" : op);
var handleCloseBracket = () => {
  while (operatorStack.length) {
    if (operatorStack.peek() === "(") {
      operatorStack.pop();
      break;
    } else {
      pushLexem(operatorStack.pop());
    }
  }
};
var freeOperatorStack = () => {
  while (operatorStack.length) {
    if (operatorStack.peek() === "(") {
      operatorStack.pop();
    } else {
      pushLexem(operatorStack.pop());
    }
  }
};
var machine = new Machine();
var stack = new Stack();
var Cycle = CycleClass;
var Assignment = AssignmentClass;
var Condition = ConditionClass;
var Switch = SwitchClass;
function reinit() {
  operatorStack = new Stack();
  operandStack = new Stack();
  operandCount = 0;
  tmp = [];
  depth = 0;
  exits = new Stack();
  stack.set([]);
  machine.reinit();
}
var tracer = {
  getAll() {
    return machine.getAll();
  }
};
reinit();

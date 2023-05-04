import { AssignmentClass } from './components/assignment'
import { ConditionClass } from './components/condition'
import { CycleClass } from './components/cycle'
import { Statement } from './components/statement'
import { SwitchClass } from './components/switch'
import { Stack, StackType } from './std'
import { CMD, DefaultParameters, SMState, StatementType } from './types'

var ignoreLastWord: boolean

// Defining Environment

var operatorStack: StackType<string>
var operandStack: StackType<number | string>
var operandCount: number
var tmp: string[]
var depth: number
var unSign: string = '' //temporary unarySign

// ==================

var Machine = class StateMachine {
  private history = new Stack<SMState>()
  private breadcrumbs = new Stack<number>()

  constructor() {}

  reinit() {
    this.history = new Stack()
    this.breadcrumbs = new Stack()
  }

  getAll() {
    return this.history.value.join(' ')
  }

  setHistory(history) {
    this.history.set(history)
  }

  getHistory() {
    return this.history.value
  }

  appendLexem(...lexs: SMState[]) {
    this.history.push(...lexs)
  }

  /**
   * Pushes current position into breadcrumbs stack
   */
  addCrumb() {
    this.breadcrumbs.push(this.history.length)
  }

  /**
   * Splits history in two by last breadcrumb, then keeps first part in, and return last part
   * @returns History
   */
  sliceCrumb(): SMState[] {
    const bcPosition = this.breadcrumbs.pop() || 0

    let oldHistory = this.history.value.slice(
      -(this.history.length - bcPosition),
    )
    this.history.set(this.history.value.slice(0, bcPosition))

    return oldHistory
  }
}

window.pushLexem = (...lexs: SMState[]) => machine.appendLexem(...lexs)
var p = pushLexem
var pushHistory = (history: SMState[]) => machine.appendLexem(...history)

declare var errors: string[]
declare var hasError: boolean

var writeError = (msg) => {
  errors.push(`Error: ${msg}`)
  hasError = true
}

window.debug = (...any) => console.warn(...any)

declare var debugMessages: string[]

var writeInfo = () => {
  pushLexem('\n')
  debugMessages.forEach((msg) => pushLexem(`${msg}\n`))
  debugMessages = []

  pushLexem('\n')
  errors.forEach((msg) => pushLexem(`${msg}\n`))
  errors = []

  hasError = false
}

var getLabel = (label: string) => `\n#${label}_${operandStack.peek()}#`
var setLabel = (label: string) => pushLexem(getLabel(label))

var setJump = (label: string) => pushLexem(getLabel(label), CMD.JUMP)
var setJumpElse = (label: string) => pushLexem(getLabel(label), CMD.JUMP_ELSE)

var pushVar = (name: string) => pushLexem(`${name} ${operandStack.peek()}`)

var pushExit = () => {
  exits.length === 0
    ? writeError('No exits or function declarations')
    : pushLexem(exits.peek(), CMD.JUMP)
}

window.loopExit = () => {
  const upperBound = stack.value.findLast(
    (v) => v.getType() === StatementType.Loop,
  )
  if (!upperBound) {
    writeError('Cannot escape from nothing')
    throw new Error('Unhandled exit')
    return
  }
  pushLexem(upperBound.genLabel('Exit'), CMD.STEP_OUT)
}

var getPriority = (lex: string) => {
  if (!lex) return -1

  if (lex === '~') return 9
  if (lex === '!') return 8
  if (lex.match(/[%*\/]/g)) return 6
  if (lex.match(/[+-]/g)) return 5
  if (lex.match(/[><]=?/g)) return 4
  if (lex.match(/[!=]=?/g)) return 3
  if (lex === '&&') return 2
  if (lex === '||') return 1

  return 0
}

var handle = (op: string) => {
  while (operatorStack.length) {
    if (getPriority(operatorStack.peek()) >= getPriority(op)) {
      pushLexem(operatorStack.pop())
    } else {
      break
    }
  }
  operatorStack.push(op)
}

var handleUnary = (op: string) => handle(op === '-' ? '~' : op)

var handleCloseBracket = () => {
  while (operatorStack.length) {
    if (operatorStack.peek() === '(') {
      operatorStack.pop()
      break
    } else {
      pushLexem(operatorStack.pop())
    }
  }
}

var freeOperatorStack = () => {
  while (operatorStack.length) {
    if (operatorStack.peek() === '(') {
      operatorStack.pop()
    } else {
      pushLexem(operatorStack.pop())
    }
  }
}

var machine = new Machine()
var stack = new Stack<Statement<StatementType>>()

// Exports

var Cycle = CycleClass
var Assignment = AssignmentClass
var Condition = ConditionClass
var Switch = SwitchClass

// =======

function reinit() {
  operatorStack = new Stack<string>()
  operandStack = new Stack<number | string>()
  operandCount = 0
  tmp = []
  depth = 0
  exits = new Stack<string>()
  stack.set([])

  machine.reinit()
}

var tracer = {
  getAll() {
    return machine.getAll()
  },
}

reinit()

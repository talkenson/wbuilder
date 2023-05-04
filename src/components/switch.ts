import { CMD, SMState, StatementType } from '../types'
import { Statement } from './statement'

export class SwitchClass extends Statement<StatementType.Switch> {
  constructor() {
    super(StatementType.Switch)
    this.params.cases = []
  }

  addCase(matcher: SMState[], body: SMState[]) {
    this.apply('cases', [...this.params.cases, { matcher, body }])
  }

  export() {
    pushLexem(
      CMD.STEP_IN,
      ...this.params.cases.flatMap(({ matcher, body }, i) => [
        ...this.params.condition,
        ...(matcher.length ? matcher : this.params.condition),
        '==',
        this.genLabel('Skip', i + 1),
        CMD.JUMP_ELSE,
        ...body,
        this.genLabel('Skip', i + 1),
      ]),
      this.genLabel('Exit'),
      CMD.STEP_OUT,
    )
  }
}

import { CMD, SMState, StatementType } from '../types'
import { Statement } from './statement'

export class ConditionClass extends Statement<StatementType.Condition> {
  constructor() {
    super(StatementType.Condition)
  }

  export() {
    pushLexem(
      ...this.params.condition,
      this.genLabel('Else'),
      CMD.JUMP_ELSE,
      ...this.params.trulyBody,
      this.genLabel('Exit'),
      CMD.JUMP,
      this.genLabel('Else'),
      ...(this.params.falsyBody ? this.params.falsyBody : []),
      this.genLabel('Exit'),
    )
  }
}

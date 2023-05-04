import { CMD, StatementType } from '../types'
import { Statement } from './statement'

export class CycleClass extends Statement<StatementType.Loop> {
  constructor() {
    super(StatementType.Loop)
  }

  export() {
    pushLexem(
      CMD.STEP_IN,
      this.params.iterator,
      this.params.from,
      '=',
      this.genLabel('Condition'),
      this.params.iterator,
      this.params.to,
      '<=',
      this.genLabel('Exit'),
      CMD.JUMP_ELSE,
      ...this.params.body,
      this.params.iterator,
      this.params.iterator,
      this.params.step || 1,
      '+',
      '=',
      this.genLabel('Jump'),
      CMD.JUMP,
      this.genLabel('Exit'),
      CMD.STEP_OUT,
    )
  }
}

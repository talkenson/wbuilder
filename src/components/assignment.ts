import { StatementType } from '../types'
import { Statement } from './statement'

export class AssignmentClass extends Statement<StatementType.Assignment> {
  constructor() {
    super(StatementType.Assignment)
  }

  export() {
    pushLexem(this.params.id, ...this.params.value, '=')
  }
}

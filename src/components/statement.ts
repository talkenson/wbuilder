import { DefaultParameters, SMState, StatementType } from '../types'
import { customAlphabet } from 'nanoid'

var nanoid = customAlphabet('0123456789', 4)

var markedLabel =
  (id: string) =>
  (label: string, internalId: number | string = '') =>
    `\n!${label}${internalId ? `_${internalId}` : ''}_${id}#`

export abstract class Statement<
  T extends StatementType,
  Parameters extends Record<string, any> = DefaultParameters<T>,
> {
  protected params: Parameters = {} as Parameters
  protected id = ''
  constructor(protected readonly type: T) {
    this.id = nanoid()
    this.genLabel = markedLabel(this.id)
  }
  genLabel: ReturnType<typeof markedLabel>

  getType() {
    return this.type
  }

  apply(field: keyof Parameters, value: any) {
    this.params[field] = value
  }

  dump() {
    debug(JSON.stringify(this.params, null, 2))
  }

  /**
   * Registers Lexems by itself
   */
  abstract export(): void
}

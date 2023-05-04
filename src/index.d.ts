import { StackType } from './std'
import { SMState } from './types'

declare global {
  var currentLexem: [number, string]
  var pushLexem: (...lex: SMState[]) => void
  var getLabel: (label: string) => string
  var markedLabel: (
    id: string,
  ) => (label: string, internalId?: number | string) => string
  var loopExit: () => void
  var debug: (...any: any[]) => void
  var exits: StackType<string>
}

export {}

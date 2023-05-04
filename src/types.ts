export type SMState = string | number

export const enum StatementType {
  Assignment = 'assignment',
  Condition = 'condition',
  Loop = 'loop',
  Switch = 'switch',
}

interface LoopParams {
  body: SMState[]
  iterator: string
  from: number
  to: number
  step?: number
}

interface AssignmentParams {
  id: string
  value: SMState[]
}

interface ConditionParams {
  condition: SMState[]
  trulyBody: SMState[]
  falsyBody: SMState[]
}

interface SwitchParams {
  condition: SMState[]
  cases: { matcher: SMState[]; body: SMState[] }[]
}

export type DefaultParameters<T extends StatementType> =
  T extends StatementType.Loop
    ? LoopParams
    : T extends StatementType.Assignment
    ? AssignmentParams
    : T extends StatementType.Condition
    ? ConditionParams
    : T extends StatementType.Switch
    ? SwitchParams
    : never

export const enum CMD {
  JUMP = 'jump',
  JUMP_ELSE = 'jumpElse',
  RETURN = 'return',
  STEP_IN = 'stepInto',
  STEP_OUT = 'stepOut',
}

export const enum KEYS {
  STACK = 'stack',
}

export interface Authorization {
  actor: string
  permission: string
}

export interface Action {
  account: string
  name: string
  authorization: Authorization[]
  data: any
}

export class SendableAction {
  public payload: Action
  public eos: WrappedEos
  constructor(payload: Action, eos: WrappedEos) {
    this.payload = payload
    this.eos = eos
  }
  public async send() {
    return this.eos.transact([this.payload])
  }
}

export class WrappedEos {
  public eos: any
  constructor(eos: any) {
    this.eos = eos
  }
  public async transact(actions: Array<Action | SendableAction>) {
    actions = actions.map(a => (a instanceof SendableAction ? a.payload : a))
    if (this.eos.transact) {
      return this.eos.transact(
        { actions },
        { blocksBehind: 0, expireSeconds: 60 }
      )
    } else {
      return this.eos.transaction({ actions })
    }
  }
  public async getTableRows(options: {
    code: string
    scope: string
    table: string
    lower_bound: string
    upper_bound: string
    limit: number
  }) {
    ;(options as any).json = true
    if (this.eos.rpc && this.eos.rpc.get_table_rows) {
      return this.eos.rpc.get_table_rows(options)
    } else {
      return this.eos.getTableRows(options)
    }
  }
}

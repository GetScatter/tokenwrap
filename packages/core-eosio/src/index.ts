export {
  Authorization,
  Action,
  SendableAction,
  PaginationOptions,
  Morpheos
} from 'morpheos'

import { TokenStandard } from '@tokenwrap/core'
import { Action, Authorization, Morpheos, SendableAction } from 'morpheos'

export class EosioTokenStandard extends TokenStandard {
  public eos: Morpheos
  public contract: string

  /***
   * @param eos - an instantiated eosjs@16.0.9 or eosjs@20+ reference.
   * @param contract - a string of the contract name.
   */
  constructor(eos: any, contract: string) {
    super()
    if (!eos) {
      throw new Error(
        'eosReference must be an instantiated eosjs@16.0.9 or eosjs@20+ reference.'
      )
    }
    if (!contract || typeof contract !== 'string') {
      throw new Error('contract must be a valid account name')
    }
    this.eos = new Morpheos(eos)
    this.contract = contract
  }

  /***
   * Creates a SendableAction instance using the local EOS client.
   * @param payload
   */
  protected getSendableAction(payload: Action) {
    return new SendableAction(payload, this.eos)
  }

  /***
   * Creates an authorization array.
   * @param account
   */
  protected formatAuth(account: string | Authorization): Authorization[] {
    if (typeof account === 'string') {
      return [{ actor: account, permission: 'active' }]
    }
    return [
      {
        actor: account.actor,
        permission: account.permission || 'active'
      }
    ]
  }

  /***
   * Extracts the account name from the provided authorization.
   * @param authorization
   */
  protected formatAccount(authorization: string | Authorization) {
    if (typeof authorization === 'string') {
      return authorization
    }
    return authorization.actor
  }
}

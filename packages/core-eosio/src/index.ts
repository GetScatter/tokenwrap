export {
  Authorization,
  Action,
  SendableTransaction,
  PaginationOptions,
  Morpheos
} from 'morpheos'

import { TokenStandard } from '@tokenwrap/core'
import { Action, Authorization, Morpheos, SendableTransaction } from 'morpheos'

export type FlexAuth = Authorization | string

export abstract class EosioTokenStandard extends TokenStandard {
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

  public abstract transferNft(
    from: FlexAuth,
    to: string,
    ids: string[],
    memo: string
  ): SendableTransaction

  public abstract transferFt(
    from: FlexAuth,
    to: string,
    amount: any,
    memo: string
  ): SendableTransaction

  public abstract offerNft(
    owner: FlexAuth,
    newOwner: string,
    ids: string[],
    memo: string
  ): SendableTransaction

  public abstract acceptNft(
    claimer: FlexAuth,
    ids: string[]
  ): SendableTransaction

  public abstract rentOutNft(
    owner: FlexAuth,
    to: string,
    ids: string[],
    period: number | string,
    memo: string
  ): SendableTransaction

  public abstract reclaimNft(
    owner: FlexAuth,
    from: string,
    ids: string[]
  ): SendableTransaction

  /***
   * Creates a SendableAction instance using the local EOS client.
   * @param payload
   */
  protected getSendableAction(payload: Action) {
    return new SendableTransaction(payload, this.eos)
  }

  /***
   * Creates an authorization array.
   * @param account
   */
  protected formatAuth(account: FlexAuth): Authorization[] {
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
  protected formatAccount(authorization: FlexAuth) {
    if (typeof authorization === 'string') {
      return authorization
    }
    return authorization.actor
  }
}

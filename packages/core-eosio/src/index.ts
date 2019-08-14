export {
  Authorization,
  Action,
  Transaction,
  PaginationOptions,
  Morpheos
} from 'morpheos'

import { TokenStandard } from '@tokenwrap/core'
import { Action, FlexAuth, Morpheos, Transaction } from 'morpheos'

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
  ): Transaction

  public abstract transferFt(
    from: FlexAuth,
    to: string,
    amount: any,
    memo: string
  ): Transaction

  public abstract offerNft(
    owner: FlexAuth,
    newOwner: string,
    ids: string[],
    memo: string
  ): Transaction

  public abstract acceptNft(claimer: FlexAuth, ids: string[]): Transaction

  public abstract rentOutNft(
    owner: FlexAuth,
    to: string,
    ids: string[],
    period: number | string,
    memo: string
  ): Transaction

  public abstract reclaimNft(
    owner: FlexAuth,
    from: string,
    ids: string[]
  ): Transaction

  /***
   * Creates a Transaction instance using the local EOS client.
   * @param payload
   */
  protected getSendableAction(payload: Action) {
    return new Transaction(payload, this.eos)
  }

  /***
   * Extracts the account name from the provided FlexAuth.
   * @param authorization
   */
  protected getAccountName(authorization: FlexAuth) {
    return Transaction.extractAccountName(authorization)
  }
}

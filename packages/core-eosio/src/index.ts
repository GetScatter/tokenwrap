export {
  Authorization,
  Action,
  SendableAction,
  PaginationOptions,
  Morpheos
} from 'morpheos'

import { TokenStandard } from '@tokenwrap/core'
import { Morpheos } from 'morpheos'

export class EosioTokenStandard extends TokenStandard {
  protected eos: Morpheos
  protected contract: string

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
}

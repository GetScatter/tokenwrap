export { encodeName } from './encoders'
export {
  Authorization,
  Action,
  SendableAction,
  PaginationOptions,
  WrappedEos
} from './wrappedEos'

import { TokenStandard } from '@tokenwrap/core'
import { WrappedEos } from './wrappedEos'

export class EosioTokenStandard extends TokenStandard {
  protected eos: WrappedEos
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
    this.eos = eos
    this.contract = contract
  }
}

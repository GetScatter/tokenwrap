import {
  EosioTokenStandard,
  FlexAuth,
  Morpheos,
  SendableTransaction
} from '@tokenwrap/core-eosio'
import { runInNewContext } from 'vm'

export interface NftIds {
  contract: string
  standard?: string
  token_ids: string[]
}

export interface FtAsset {
  contract: string
  quantity: string
}
export interface DGoodsFtAsset extends FtAsset {
  category: string
  tokenName: string
}

export interface SimpleassetsFtAsset extends FtAsset {
  author: string
}

type TokenStandardClass = new (...args: any[]) => EosioTokenStandard

export class MultiWrapper {
  public eos: Morpheos
  private standards: { [standard: string]: TokenStandardClass } = {}
  private standardInstances: {
    [standard: string]: { [contract: string]: EosioTokenStandard }
  } = {}

  constructor(eos: any) {
    this.eos = new Morpheos(eos)
  }

  public use(standard: string, tokenStandardClass: TokenStandardClass) {
    this.standards[standard] = tokenStandardClass
  }

  public async transferNft(
    from: FlexAuth,
    to: string,
    ids: NftIds[],
    memo: string
  ) {
    return this.processGroups(ids, (wrapper, groupIds) =>
      wrapper.transferNft(from, to, groupIds, memo)
    )
  }

  public transferFt(
    from: FlexAuth,
    to: string,
    amount: DGoodsFtAsset | SimpleassetsFtAsset,
    memo: string
  ) {
    const wrapper = this.getStandardInstance(
      this.ftIsSimpleassets(amount) ? 'simpleassets' : 'dgoods',
      amount.contract
    )
    return wrapper.transferFt(from, to, amount, memo)
  }

  public async offerNft(
    owner: FlexAuth,
    newOwner: string,
    ids: NftIds[],
    memo: string
  ) {
    return this.processGroups(ids, (wrapper, groupIds) =>
      wrapper.offerNft(owner, newOwner, groupIds, memo)
    )
  }

  public async acceptNft(claimer: string, ids: NftIds[]) {
    return this.processGroups(ids, (wrapper, groupIds) =>
      wrapper.acceptNft(claimer, groupIds)
    )
  }

  public async rentOutNft(
    owner: FlexAuth,
    to: string,
    ids: NftIds[],
    period: number | string,
    memo: string
  ) {
    return this.processGroups(ids, (wrapper, groupIds) =>
      wrapper.rentOutNft(owner, to, groupIds, period, memo)
    )
  }

  public async reclaimNft(owner: FlexAuth, from: string, ids: NftIds[]) {
    return this.processGroups(ids, (wrapper, groupIds) =>
      wrapper.reclaimNft(owner, from, groupIds)
    )
  }

  private getStandardInstance(name: string, contract: string) {
    if (
      this.standardInstances[name] &&
      this.standardInstances[name][contract]
    ) {
      return this.standardInstances[name][contract]
    } else {
      const standardClass = this.standards[name]
      if (!standardClass) {
        throw new Error(`Standard not loaded: '${name}'`)
      }
      const instance = new standardClass(this.eos, contract)
      if (!this.standardInstances[name]) {
        this.standardInstances[name] = {}
      }
      this.standardInstances[name][contract] = instance
      return instance
    }
  }

  private async processGroups(
    ids: NftIds[],
    fn: (wrapper: EosioTokenStandard, tokenIds: string[]) => SendableTransaction
  ) {
    for (const nftIds of ids) {
      if (!nftIds.standard) {
        nftIds.standard = await this.getStandard(nftIds.contract)
      }
    }
    const actions = Object.entries(ids).map(([contract, nfts]) => {
      const wrapper = this.getStandardInstance(
        nfts.standard ? nfts.standard : '',
        nfts.contract
      )
      return fn(wrapper, nfts.token_ids)
    })
    return new SendableTransaction(actions, this.eos)
  }

  private async getStandard(contract: string) {
    const tokenConfigs = await this.eos.getTableRow({
      code: contract,
      scope: contract,
      table: 'tokenconfigs'
    })
    if (tokenConfigs) {
      return tokenConfigs.standard
    }
    return ''
  }

  private ftIsSimpleassets(asset: any): asset is SimpleassetsFtAsset {
    return 'author' in asset
  }
}

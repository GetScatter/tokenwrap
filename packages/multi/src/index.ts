import {
  EosioTokenStandard,
  FlexAuth,
  Morpheos,
  SendableTransaction
} from '@tokenwrap/core-eosio'

export interface NftId {
  standard: string
  contract: string
  id: string
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

  public transferNft(from: FlexAuth, to: string, ids: NftId[], memo: string) {
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

  public offerNft(
    owner: FlexAuth,
    newOwner: string,
    ids: NftId[],
    memo: string
  ) {
    return this.processGroups(ids, (wrapper, groupIds) =>
      wrapper.offerNft(owner, newOwner, groupIds, memo)
    )
  }

  public acceptNft(claimer: string, ids: NftId[]) {
    return this.processGroups(ids, (wrapper, groupIds) =>
      wrapper.acceptNft(claimer, groupIds)
    )
  }

  public rentOutNft(
    owner: FlexAuth,
    to: string,
    ids: NftId[],
    period: number | string,
    memo: string
  ) {
    return this.processGroups(ids, (wrapper, groupIds) =>
      wrapper.rentOutNft(owner, to, groupIds, period, memo)
    )
  }

  public reclaimNft(owner: FlexAuth, from: string, ids: NftId[]) {
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

  private groupByContract(ids: NftId[]) {
    const groups: { [key: string]: NftId[] } = {}
    for (const id of ids) {
      if (!groups[id.contract]) {
        groups[id.contract] = []
      }
      groups[id.contract].push(id)
    }
    return groups
  }

  private processGroups(
    ids: NftId[],
    fn: (wrapper: EosioTokenStandard, groupIds: string[]) => SendableTransaction
  ) {
    const groups = this.groupByContract(ids)
    const actions = Object.entries(groups).map(([contract, groupIds]) => {
      const wrapper = this.getStandardInstance(groupIds[0].standard, contract)
      return fn(wrapper, groupIds.map(id => id.id))
    })
    return new SendableTransaction(actions, this.eos)
  }

  private ftIsSimpleassets(asset: any): asset is SimpleassetsFtAsset {
    return 'author' in asset
  }
}

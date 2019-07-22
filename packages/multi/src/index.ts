import {
  EosioTokenStandard,
  FlexAuth,
  Morpheos,
  SendableTransaction
} from '@tokenwrap/core-eosio'

export interface NftId {
  standard?: string
  contract: string
  tokenId: string
}

export interface NftGroup {
  standard?: string
  contract: string
  tokenIds: string[]
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
    ids: Array<NftGroup | NftId>,
    memo: string
  ) {
    return this.processGroups(ids, (wrapper, tokenIds) =>
      wrapper.transferNft(from, to, tokenIds, memo)
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
    ids: Array<NftGroup | NftId>,
    memo: string
  ) {
    return this.processGroups(ids, (wrapper, tokenIds) =>
      wrapper.offerNft(owner, newOwner, tokenIds, memo)
    )
  }

  public async acceptNft(claimer: FlexAuth, ids: Array<NftGroup | NftId>) {
    return this.processGroups(ids, (wrapper, tokenIds) =>
      wrapper.acceptNft(claimer, tokenIds)
    )
  }

  public async rentOutNft(
    owner: FlexAuth,
    to: string,
    ids: Array<NftGroup | NftId>,
    period: number | string,
    memo: string
  ) {
    return this.processGroups(ids, (wrapper, tokenIds) =>
      wrapper.rentOutNft(owner, to, tokenIds, period, memo)
    )
  }

  public async reclaimNft(
    owner: FlexAuth,
    from: string,
    ids: Array<NftGroup | NftId>
  ) {
    return this.processGroups(ids, (wrapper, tokenIds) =>
      wrapper.reclaimNft(owner, from, tokenIds)
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

  private normalizeNftGroups(ids: Array<NftGroup | NftId>) {
    const groups: { [contract: string]: NftGroup } = {}
    for (const item of ids) {
      const group: NftGroup = groups[item.contract] || {
        contract: item.contract,
        tokenIds: []
      }
      group.standard = group.standard || item.standard
      groups[item.contract] = group
      if ('tokenIds' in item) {
        group.tokenIds = group.tokenIds.concat(item.tokenIds)
      } else if ('tokenId' in item) {
        group.tokenIds.push(item.tokenId)
      } else {
        throw new TypeError('Unrecognized NFT ID interface format')
      }
    }
    return groups
  }

  private async processGroups(
    ids: Array<NftGroup | NftId>,
    fn: (wrapper: EosioTokenStandard, tokenIds: string[]) => SendableTransaction
  ) {
    const groups = this.normalizeNftGroups(ids)
    const actions = await Promise.all(
      Object.entries(groups).map(async ([contract, group]) => {
        if (!group.standard) {
          group.standard = await this.fetchStandard(contract)
        }
        const wrapper = this.getStandardInstance(group.standard, contract)
        return fn(wrapper, group.tokenIds)
      })
    )
    return new SendableTransaction(actions, this.eos)
  }

  private async fetchStandard(contract: string) {
    const tokenConfigs = await this.eos.getTableRow({
      code: contract,
      table: 'tokenconfigs'
    })
    if (!tokenConfigs || !tokenConfigs.standard) {
      throw new Error(
        `Could not determine NFT standard of contract '${contract}'`
      )
    }
    return tokenConfigs.standard as string
  }

  private ftIsSimpleassets(asset: any): asset is SimpleassetsFtAsset {
    return 'author' in asset
  }
}

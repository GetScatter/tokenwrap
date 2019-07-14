import { Authorization, EosioTokenStandard } from '@tokenwrap/core-eosio'

export interface DGoodsFtAsset {
  category: string
  tokenName: string
  quantity: string
}

export interface SimpleassetsFtAsset {
  author: string
  quantity: string
}

export interface NftId {
  spec: string
  contract: string
  id: string
}

export class MultiWrapper {
  public eos: any
  public standards = new Map<string, EosioTokenStandard>()
  constructor(eos: any) {
    this.eos = eos
  }

  public use(
    standard: string,
    tokenStandardConstructor: new (...args: any[]) => EosioTokenStandard
  ) {
    this.standards.set(standard, new tokenStandardConstructor(this.eos))
  }

  // TODO:
  // public async transferNft(
  //   from: string | Authorization,
  //   to: string,
  //   ids: NftId[],
  //   memo: string
  // ) {}
  // public async transferFt()
  // public async offerNft()
  // public async acceptNft()
  // public async rentOutNft()
  // public async reclaimNft()

  private getStandard(name: string, contract?: string) {
    const standard = this.standards.get(name)
    if (!standard) {
      throw new Error(`Standard not loaded: '${name}'`)
    }
    if (contract) {
      standard.contract = contract
    }
    return standard
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
}

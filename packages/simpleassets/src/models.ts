export class Configs {
  public readonly standard!: string
  public readonly version!: string
  constructor(json: any) {
    Object.assign(this, json)
  }
}

export class Stats {
  public readonly supply!: string
  public readonly max_supply!: string
  public readonly issuer!: string
  public readonly id!: string
  public readonly authorctrl!: boolean
  public readonly data!: string
  constructor(json: any) {
    Object.assign(this, json)
    this.id = this.id.toString()
  }
}

export class Author {
  public readonly author!: string
  public readonly data!: string
  public readonly stemplate!: string
  constructor(json: any) {
    Object.assign(this, json)
  }
}

export class TokenBalance {
  public readonly id!: string
  public readonly author!: string
  public readonly balance!: string
  constructor(json: any) {
    Object.assign(this, json)
    this.id = this.id.toString()
  }
}

export class TokenDetails {
  public readonly id!: string
  public readonly owner!: string
  public readonly author!: string
  public readonly category!: string
  public readonly idata!: string
  public readonly mdata!: string
  public readonly container!: TokenDetails[]
  public readonly containerf!: TokenBalance[]
  constructor(json: any) {
    Object.assign(this, json)
    this.id = this.id.toString()
  }
}

export class Offer {
  public readonly assetid!: string
  public readonly owner!: string
  public readonly offeredto!: string
  public readonly cdate!: string
  constructor(json: any) {
    Object.assign(this, json)
    this.assetid = this.assetid.toString()
    this.cdate = this.cdate.toString()
  }
}

export class OfferFungible {
  public readonly id!: string
  public readonly author!: string
  public readonly owner!: string
  public readonly quantity!: string
  public readonly offeredto!: string
  public readonly cdate!: string
  constructor(json: any) {
    Object.assign(this, json)
    this.id = this.id.toString()
    this.cdate = this.cdate.toString()
  }
}

export class TokenDelegation {
  public readonly assetid!: string
  public readonly owner!: string
  public readonly delegatedto!: string
  public readonly cdate!: string
  public readonly period!: string
  constructor(json: any) {
    Object.assign(this, json)
    this.assetid = this.assetid.toString()
    this.cdate = this.cdate.toString()
    this.period = this.period.toString()
  }
}

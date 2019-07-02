export class Config {
  public standard!: string
  public version!: string
  public symbol!: string
  public category_name_id!: string
  constructor(json: any) {
    Object.assign(this, json)
    this.category_name_id = this.category_name_id.toString()
  }
}

export class Stats {
  public fungible!: boolean
  public burnable!: boolean
  public transferable!: boolean
  public issuer!: string
  public token_name!: string
  public category_name_id!: string
  public max_supply!: string
  public current_supply!: string
  public issued_supply!: string
  public base_uri!: string
  constructor(json: any) {
    Object.assign(this, json)
    this.category_name_id = this.category_name_id.toString()
    this.current_supply = this.current_supply.toString()
    this.issued_supply = this.issued_supply.toString()
  }
}

export class TokenBalance {
  public category_name_id!: string
  public category!: string
  public token_name!: string
  public amount!: string
  constructor(json: any) {
    Object.assign(this, json)
    this.category_name_id = this.category_name_id.toString()
  }
}

export class TokenDetails {
  public id!: string
  public serial_number!: string
  public owner!: string
  public category!: string
  public token_name!: string
  public relative_uri?: string
  constructor(json: any) {
    Object.assign(this, json)
    this.id = this.id.toString()
    this.serial_number = this.serial_number.toString()
  }
}

export class Ask {
  public dgood_id!: string
  public seller!: string
  public amount!: string
  public expiration!: string
  constructor(json: any) {
    Object.assign(this, json)
    this.dgood_id = this.dgood_id.toString()
    this.expiration = this.expiration.toString()
  }
}

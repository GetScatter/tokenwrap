import {
  Action,
  Authorization,
  encodeName,
  SendableAction,
  WrappedEos
} from '@tokenwrap/core-eosio'

export class DAsset {
  public static placeholder() {
    return new DAsset()
  }
  public static fromJson(json: any) {
    return (Object as any).assign(DAsset.placeholder(), json)
  }
  public readonly amount!: number
  public readonly precision!: number

  public toString() {
    return parseFloat(this.amount.toString())
      .toFixed(this.precision)
      .toString()
  }
}

export class Configs {
  public static placeholder() {
    return new Configs()
  }
  public static fromJson(json: any) {
    return Object.assign(Configs.placeholder(), json)
  }
  public readonly standard!: name
  public readonly version!: string
  public readonly symbol!: symbol_code
  public readonly category_name_id!: uint64_t
}

export class Category {
  public static placeholder() {
    return new Category()
  }
  public static fromJson(json: any) {
    return (Object as any).assign(Category.placeholder(), json)
  }
  public readonly category!: name
}

export class Stats {
  public static placeholder() {
    return new Stats()
  }
  public static fromJson(json: any) {
    const p = (Object as any).assign(Stats.placeholder(), json)
    p.max_supply = DAsset.fromJson(json.max_supply)
    return p
  }
  public readonly fungible!: boolean
  public readonly burnable!: boolean
  public readonly transferable!: boolean
  public readonly issuer!: name
  public readonly token_name!: name
  public readonly category_name_id!: uint64_t
  public readonly max_supply!: dasset
  public readonly current_supply!: uint64_t
  public readonly issued_supply!: uint64_t
  public readonly base_uri!: string
}

export class TokenBalance {
  public static placeholder() {
    return new TokenBalance()
  }
  public static fromJson(json: any) {
    const p = (Object as any).assign(TokenBalance.placeholder(), json)
    p.amount = DAsset.fromJson(json.amount)
    return p
  }
  public readonly category_name_id!: uint64_t
  public readonly category!: name
  public readonly token_name!: name
  public readonly amount!: DAsset
}

export class TokenInfo {
  public static placeholder() {
    return new TokenInfo()
  }
  public static fromJson(json: any) {
    return (Object as any).assign(TokenInfo.placeholder(), json)
  }
  public readonly id!: uint64_t
  public readonly serial_number!: uint64_t
  public readonly owner!: name
  public readonly category!: name
  public readonly token_name!: name
  public readonly relative_uri?: string
}

export class Asks {
  public static placeholder() {
    return new TokenInfo()
  }
  public static fromJson(json: any) {
    return (Object as any).assign(Asks.placeholder(), json)
  }
  public readonly dgood_id!: uint64_t
  public readonly seller!: name
  public readonly amount!: asset
  public readonly expiration!: time_point_sec
}

export class DGoods {
  private eos: any
  private isLegacy: boolean
  private contractAccount: name
  private getTableRows: any

  /***
   * @param eosReference - an instantiated eosjs@16.0.9 or eosjs@20+ reference.
   * @param contract - a string of the contract name.
   */
  constructor(eosReference: any, contract: string) {
    if (!eosReference) {
      throw new Error(
        'eosReference must be an instantiated eosjs@16.0.9 or eosjs@20+ reference.'
      )
    }
    if (!contract.length) {
      throw new Error('contract must be a valid account name')
    }

    this.eos = eosReference
    this.isLegacy = typeof eosReference.contract === 'function'
    this.contractAccount = contract

    this.getTableRows = getTableRowsBuilder(this.eos, this.contractAccount)
  }

  public transact(actions: Array<Action | object>) {
    return this.transactor()({
      actions: actions.map(action => {
        if (action.hasOwnProperty('json')) {
          return (action as any).json
        } else {
          return action
        }
      })
    })
  }

  /*********************************/
  /********  DATA FETCHERS *********/
  /*********************************/

  /***
   * Gets the base token configs
   */
  public async getConfig() {
    return this.getTableRows('tokenconfigs', {
      model: Configs,
      firstOnly: true
    })
  }

  /***
   * Specify a category_name_id to get it, or none to get all.
   * @param accountName
   * @param categoryNameId
   */
  public async getBalances(
    accountName: name,
    categoryNameId: uint64_t | null = null
  ) {
    return this.getTableRows('accounts', {
      scope: encodeName(accountName),
      model: TokenBalance,
      firstOnly: categoryNameId !== null,
      rowsOnly: categoryNameId === null,
      index: categoryNameId !== null ? categoryNameId : null
    })
  }

  /***
   * Specify a category to get it, or none to get all.
   * @param category
   */
  public async getCategory(category: name | null = null) {
    return this.getTableRows('categoryinfo', {
      model: Category,
      firstOnly: !!category,
      rowsOnly: !category,
      index: category ? encodeName(category) : null
    })
  }

  /***
   * Specify a token_name to get it, or none to get all.
   * @param category
   * @param tokenName
   */
  public async getStats(category: name, tokenName: name | null = null) {
    return this.getTableRows('dgoodstats', {
      scope: encodeName(category),
      model: Stats,
      firstOnly: !!tokenName,
      rowsOnly: !tokenName,
      index: tokenName ? encodeName(tokenName) : null
    })
  }

  /***
   * Specify a tokeninfoId to get it, or none to get all.
   * @param tokeninfoId
   */
  public async getTokenInfo(tokeninfoId: uint64_t | null = null) {
    return this.getTableRows('dgood', {
      model: TokenInfo,
      firstOnly: tokeninfoId !== null,
      rowsOnly: tokeninfoId === null,
      index: tokeninfoId !== null ? tokeninfoId : null
    })
  }

  /***
   * Specify a tokeninfoId to get it, or none to get all.
   * @param tokeninfoId
   */
  public async getAsk(tokeninfoId: uint64_t | null = null) {
    return this.getTableRows('asks', {
      model: Asks,
      firstOnly: tokeninfoId !== null,
      rowsOnly: tokeninfoId === null,
      index: tokeninfoId !== null ? tokeninfoId : null
    })
  }

  /*********************************/
  /******  METHOD FORMATTERS  ******/
  /*********************************/

  public setconfig(symbol: symbol_code, version: string) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'setconfig',
      data: {
        symbol,
        version
      },
      authorization: this.actionAuth(this.contractAccount)
    })
  }

  public create(
    issuer: Authorization,
    category: name,
    tokenName: name,
    fungible: boolean,
    burnable: boolean,
    transferable: boolean,
    baseUri: string,
    maxSupply: string
  ) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'create',
      data: {
        issuer: issuer.name,
        category,
        token_name: tokenName,
        fungible,
        burnable,
        transferable,
        base_uri: baseUri,
        max_supply: maxSupply
      },
      authorization: this.actionAuth(issuer)
    })
  }

  public issue(
    to: name,
    category: name,
    tokenName: name,
    quantity: string,
    metadataType: string,
    relativeUri: string,
    memo: string
  ) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'create',
      data: {
        to,
        category,
        token_name: tokenName,
        quantity,
        relative_uri: relativeUri,
        memo
      },
      authorization: this.actionAuth(this.contractAccount)
    })
  }

  public burnnft(owner: Authorization, dgoodIds: uint64_t[]) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'create',
      data: {
        owner: owner.name,
        dgood_ids: dgoodIds
      },
      authorization: this.actionAuth(owner)
    })
  }

  public burnft(
    owner: Authorization,
    categoryNameId: uint64_t,
    quantity: string
  ) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'create',
      data: {
        owner: owner.name,
        category_name_id: categoryNameId,
        quantity
      },
      authorization: this.actionAuth(owner)
    })
  }

  public transfernft(
    from: Authorization,
    to: name,
    dgoodIds: uint64_t[],
    memo: string
  ) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'create',
      data: {
        from: from.name,
        to,
        dgood_ids: dgoodIds,
        memo
      },
      authorization: this.actionAuth(from)
    })
  }

  public transferft(
    from: Authorization,
    to: name,
    category: name,
    tokenName: name,
    quantity: string,
    memo: string
  ) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'create',
      data: {
        from: from.name,
        to,
        category,
        token_name: tokenName,
        quantity,
        memo
      },
      authorization: this.actionAuth(from)
    })
  }

  public listsalenft(
    seller: Authorization,
    dgoodId: uint64_t,
    netSaleAmount: asset
  ) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'listsalenft',
      data: {
        seller: seller.name,
        dgood_id: dgoodId,
        net_sale_amount: netSaleAmount
      },
      authorization: this.actionAuth(seller)
    })
  }

  public closesalenft(seller: Authorization, dgoodId: uint64_t) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'closesalenft',
      data: {
        seller: seller.name,
        dgood_id: dgoodId
      },
      authorization: this.actionAuth(seller)
    })
  }

  /*********************************/
  /***********  HELPERS  ***********/
  /*********************************/

  /***
   * Provides a dual return result for action methods.
   * `send` can be called as a method to transact the JSON.
   * `method(...).send()` returns a promise.
   * @param json
   */
  private actionResult(json: any) {
    return { json, send: () => this.transact([json]) }
  }

  /***
   * Gets a transactor depending on the version of eosjs
   */
  private transactor() {
    return this.isLegacy ? this.eos.transaction : this.eos.transact
  }

  /***
   * Creates an authorization array.
   * @param account
   */
  private actionAuth(account: any) {
    if (typeof account === 'string') {
      return [{ actor: account, permission: 'active' }]
    }
    return [
      {
        actor: account.name,
        permission: account.authority || account.permission || 'active'
      }
    ]
  }
}

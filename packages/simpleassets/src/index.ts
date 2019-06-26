// @ts-ignore
import { encodeName, getTableRowsBuilder } from '@tokenwrap/core-eosio'

type name = string
// @ts-ignore
type _symbol = string
type uint64_t = number
type asset = string
interface Account {
  name: name
  authority?: string
}
interface Action {
  json: object
  send: any
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
}

export class Stats {
  public static placeholder() {
    return new Stats()
  }
  public static fromJson(json: any) {
    return Object.assign(Stats.placeholder(), json)
  }
  public readonly supply!: asset
  public readonly max_supply!: asset
  public readonly issuer!: name
  public readonly id!: uint64_t
  public readonly authorctrl!: boolean
  public readonly data!: string
}

export class Author {
  public static placeholder() {
    return new Author()
  }
  public static fromJson(json: any) {
    return Object.assign(Author.placeholder(), json)
  }
  public readonly author!: name
  public readonly data!: string
  public readonly stemplate!: string
}


export class TokenBalance {
  public static placeholder() {
    return new TokenBalance()
  }
  public static fromJson(json: any) {
    return Object.assign(TokenBalance.placeholder(), json)
  }
  public readonly id!: uint64_t
  public readonly author!: name
  public readonly balance!: asset
}

export class TokenInfo {
  public static placeholder() {
    return new TokenInfo()
  }
  public static fromJson(json: any) {
    return (Object as any).assign(TokenInfo.placeholder(), json)
  }
  public readonly id!: uint64_t
  public readonly owner!: name
  public readonly author!: name
  public readonly category!: name
  public readonly idata!: string
  public readonly mdata!: string
  public readonly container!: TokenInfo[]
  public readonly containerf!: TokenBalance[]
}

export class Offer {
  public static placeholder() {
    return new TokenInfo()
  }
  public static fromJson(json: any) {
    return (Object as any).assign(TokenInfo.placeholder(), json)
  }
  public readonly assetid!: uint64_t
  public readonly owner!: name
  public readonly offeredto!: name
  public readonly cdate!: uint64_t
}

export class OfferFungible {
  public static placeholder() {
    return new TokenInfo()
  }
  public static fromJson(json: any) {
    return (Object as any).assign(TokenInfo.placeholder(), json)
  }
  public readonly id!: uint64_t
  public readonly author!: name
  public readonly owner!: name
  public readonly quantity!: asset
  public readonly offeredto!: name
  public readonly cdate!: uint64_t
}

export class Delegate {
  public static placeholder() {
    return new TokenInfo()
  }
  public static fromJson(json: any) {
    return (Object as any).assign(TokenInfo.placeholder(), json)
  }
  public readonly assetid!: uint64_t
  public readonly owner!: name
  public readonly delegatedto!: name
  public readonly cdate!: uint64_t
  public readonly period!: uint64_t
}

export class SimpleAssets {
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
   * Specify a accountName to get it.
   * @param accountName
   */
  public async getBalances(accountName: name) {
    return this.getTableRows('accounts', {
      scope: encodeName(accountName),
      model: TokenBalance,
      firstOnly: false,
      rowsOnly: true,
      index: null
    })
  }

  /***
   * Specify an author to get it.
   * @param author
   */
  public async getStats(author: name) {
    return this.getTableRows('stat', {
      scope: encodeName(author),
      model: Stats,
      firstOnly: false,
      rowsOnly: true,
      index: null
    })
  }

  /***
   * Specify an author to get it, or none to get all.
   * @param author
   */
  public async getAuthor(author: name | null = null) {
    return this.getTableRows('authors', {
      model: Author,
      firstOnly: author !== null,
      rowsOnly: author === null,
      index: author !== null ? encodeName(author) : null
    })
  }

  /***
   * Specify a tokeninfoId to get it, or none to get all.
   * @param author
   * @param tokeninfoId
   */
  public async getTokenInfo(author: name, tokeninfoId: uint64_t | null = null) {
    return this.getTableRows('sassets', {
      scope: encodeName(author),
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
  public async getOffer(tokeninfoId: uint64_t | null = null) {
    return this.getTableRows('offers', {
      model: Offer,
      firstOnly: tokeninfoId !== null,
      rowsOnly: tokeninfoId === null,
      index: tokeninfoId !== null ? tokeninfoId : null
    })
  }
  
  /***
   * Gets the fungible token offers
   */
  public async getFungibleOffer() {
    return this.getTableRows('offerfs', {
      model: OfferFungible,
      firstOnly: false,
      rowsOnly: true,
      index: null
    })
  }
  
  /***
   * Specify a tokeninfoId to get it, or none to get all.
   * @param tokeninfoId
   */
  public async getDelegate(tokeninfoId: uint64_t | null = null) {
    return this.getTableRows('delegates', {
      model: Delegate,
      firstOnly: tokeninfoId !== null,
      rowsOnly: tokeninfoId === null,
      index: tokeninfoId !== null ? tokeninfoId : null
    })
  }

  /*********************************/
  /******  METHOD FORMATTERS  ******/
  /*********************************/
  
  public updatever(version: string) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'updatever',
      data: {
        version
      },
      authorization: this.actionAuth(this.contractAccount)
    })
  }

  public regauthor(author: name, data: string, sTemplate: string) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'regauthor',
      data: {
        author,
        data,
        stemplate: sTemplate
      },
      authorization: this.actionAuth(author)
    })
  }
  
  public authorupdate(author: name, data: string, sTemplate: string) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'authorupdate',
      data: {
        author,
        data,
        stemplate: sTemplate
      },
      authorization: this.actionAuth(author)
    })
  }
  
  public create(
    author: Account,
    category: name,
    owner: name,
    iData: string,
    mData: string,
    requireClaim: boolean
  ) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'create',
      data: {
        author: author.name,
        category,
        owner,
        idata: iData,
        mdata: mData,
        requireclaim: requireClaim
      },
      authorization: this.actionAuth(author)
    })
  }
  
  public claim(
    claimer: Account,
    assetIds: uint64_t[]
  ) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'claim',
      data: {
        author: claimer.name,
        assetids: assetIds
      },
      authorization: this.actionAuth(claimer)
    })
  }
  
  public transfer(
    from: Account,
    to: name,
    assetIds: uint64_t[],
    memo: string
  ) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'transfer',
      data: {
        from: from.name,
        to,
        assetids: assetIds,
        memo
      },
      authorization: this.actionAuth(from)
    })
  }
  
  public update(
    author: Account,
    owner: name,
    assetIds: uint64_t[],
    mdata: string
  ) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'update',
      data: {
        author: author.name,
        owner,
        assetids: assetIds,
        mdata
      },
      authorization: this.actionAuth(author)
    })
  }

  public offer(
    owner: Account,
    newOwner: name,
    assetIds: uint64_t[],
    memo: string
  ) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'offer',
      data: {
        owner: owner.name,
        newowner: newOwner,
        assetids: assetIds,
        memo
      },
      authorization: this.actionAuth(owner)
    })
  }
  
  public canceloffer(
    owner: Account,
    assetIds: uint64_t[]
  ) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'canceloffer',
      data: {
        owner: owner.name,
        assetids: assetIds
      },
      authorization: this.actionAuth(owner)
    })
  }
  
  public burn(
    owner: Account,
    assetIds: uint64_t[],
    memo: string
  ) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'burn',
      data: {
        owner: owner.name,
        assetids: assetIds,
        memo
      },
      authorization: this.actionAuth(owner)
    })
  }

  public delegate(
    owner: Account,
    to: name,
    assetIds: uint64_t[],
    period: uint64_t,
    memo: string
  ) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'delegate',
      data: {
        owner: owner.name,
        to,
        assetids: assetIds,
        period,
        memo
      },
      authorization: this.actionAuth(owner)
    })
  }
  
  public undelegate(
    owner: Account,
    from: name,
    assetIds: uint64_t[]
  ) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'undelegate',
      data: {
        owner: owner.name,
        from,
        assetids: assetIds
      },
      authorization: this.actionAuth(owner)
    })
  }
  
  public attach(
    owner: Account,
    assetIdc: uint64_t,
    assetIds: uint64_t[]
  ) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'attach',
      data: {
        owner: owner.name,
        assetidc: assetIdc,
        assetids: assetIds
      },
      authorization: this.actionAuth(owner)
    })
  }
  
  public detach(
    owner: Account,
    assetIdc: uint64_t,
    assetIds: uint64_t[]
  ) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'detach',
      data: {
        owner: owner.name,
        assetidc: assetIdc,
        assetids: assetIds
      },
      authorization: this.actionAuth(owner)
    })
  }
  
  public attachf(
    owner: Account,
    author: name,
    quantity: asset,
    assetIdc: uint64_t,
  ) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'attachf',
      data: {
        owner: owner.name,
        author,
        quantity,
        assetidc: assetIdc,
      },
      authorization: this.actionAuth(owner)
    })
  }
  
  public detachf(
    owner: Account,
    author: name,
    quantity: asset,
    assetIdc: uint64_t,
  ) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'detachf',
      data: {
        owner: owner.name,
        author,
        quantity,
        assetidc: assetIdc,
      },
      authorization: this.actionAuth(owner)
    })
  }
  
  public updatef(
    author: Account,
    sym: _symbol,
    data: string
  ) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'updatef',
      data: {
        author: author.name,
        sym,
        data
      },
      authorization: this.actionAuth(author)
    })
  }
  
  public issuef(
    to: name,
    author: Account,
    quantity: asset,
    memo: string
  ) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'transferf',
      data: {
        to,
        author: author.name,
        quantity,
        memo
      },
      authorization: this.actionAuth(author)
    })
  }
  
  public transferf(
    from: Account,
    to: name,
    author: name,
    quantity: asset,
    memo: string
  ) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'transferf',
      data: {
        from: from.name,
        to,
        author,
        quantity,
        memo
      },
      authorization: this.actionAuth(from)
    })
  }
  
  public offerf(
    owner: Account,
    newOwner: name,
    author: name,
    quantity: asset,
    memo: string
  ) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'offerf',
      data: {
        owner: owner.name,
        newowner: newOwner,
        author,
        quantity,
        memo
      },
      authorization: this.actionAuth(owner)
    })
  }
  
  public cancelofferf(
    owner: Account,
    ftOfferIds: uint64_t[]
  ) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'cancelofferf',
      data: {
        owner: owner.name,
        ftofferids: ftOfferIds
      },
      authorization: this.actionAuth(owner)
    })
  }
  
  public claimf(
    claimer: Account,
    ftOfferIds: uint64_t[]
  ) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'claimf',
      data: {
        claimer: claimer.name,
        ftofferids: ftOfferIds
      },
      authorization: this.actionAuth(claimer)
    })
  }
  
  public burnf(
    from: Account,
    author: name,
    quantity: asset,
    memo: string
  ) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'burnf',
      data: {
        from: from.name,
        author,
        quantity,
        memo
      },
      authorization: this.actionAuth(from)
    })
  }
  
  public openf(
    owner: name,
    author: name,
    symbol: _symbol,
    ramPayer: Account
  ) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'openf',
      data: {
        owner,
        author,
        symbol,
        ram_payer: ramPayer.name
      },
      authorization: this.actionAuth(ramPayer)
    })
  }
  
  public closef(
    owner: Account,
    author: name,
    symbol: _symbol
  ) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'closef',
      data: {
        owner: owner.name,
        author,
        symbol
      },
      authorization: this.actionAuth(owner)
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

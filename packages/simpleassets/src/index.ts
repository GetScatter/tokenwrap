import {
  Action,
  Authorization,
  EosioTokenStandard,
  PaginationOptions,
  SendableAction
} from '@tokenwrap/core-eosio'
import {
  Author,
  Configs as Config,
  Offer,
  OfferFungible,
  Stats,
  TokenBalance,
  TokenDelegation,
  TokenDetails
} from './models'

export class SimpleAssets extends EosioTokenStandard {
  /*********************************/
  /********  DATA FETCHERS *********/
  /*********************************/

  /***
   * Gets the base token config
   */
  public async getConfig() {
    return new Config(
      await this.eos.getTableRow({ code: this.contract, table: 'tokenconfigs' })
    )
  }

  /***
   * Query the balances of an account
   * @param accountName
   * @param paginationOptions
   */
  public async getBalances(
    accountName: string,
    paginationOptions?: PaginationOptions
  ) {
    const results = await this.eos.getTableRows(
      {
        code: this.contract,
        scope: accountName,
        table: 'accounts'
      },
      paginationOptions
    )
    results.rows = results.rows.map(r => new TokenBalance(r))
    return results
  }

  /***
   * Get stats of a token by specifying its author.
   * @param author
   */
  public async getTokenStats(author: string) {
    return new Stats(
      await this.eos.getTableRow({
        code: this.contract,
        scope: author,
        table: 'stat'
      })
    )
  }

  /***
   * Query token authors.
   */
  public async getAuthors(paginationOptions?: PaginationOptions) {
    const results = await this.eos.getTableRows(
      {
        code: this.contract,
        table: 'authors'
      },
      paginationOptions
    )
    results.rows = results.rows.map(r => new Author(r))
    return results
  }

  /***
   * Get a specific token author.
   * @param author
   */
  public async getAuthor(author: string) {
    return new Author(
      await this.eos.getTableRow({
        code: this.contract,
        table: 'authors',
        primaryKey: author
      })
    )
  }

  /***
   * Query the token details list.
   * @param author
   * @param paginationOptions
   */
  public async getTokenDetails(
    author: string,
    paginationOptions?: PaginationOptions
  ): Promise<{ rows: TokenDetails[]; more: boolean }>
  /***
   * Get the details about a specific token.
   * @param author
   * @param tokenId
   */
  public async getTokenDetails(
    author: string,
    tokenId: string
  ): Promise<TokenDetails>
  public async getTokenDetails(author: string, option: any) {
    if (typeof option === 'string') {
      return new TokenDetails(
        await this.eos.getTableRow({
          code: this.contract,
          scope: author,
          table: 'sassets',
          primaryKey: option
        })
      )
    } else {
      const results = await this.eos.getTableRows(
        {
          code: this.contract,
          scope: author,
          table: 'sassets'
        },
        option
      )
      results.rows = results.rows.map(r => new TokenDetails(r))
      return results
    }
  }

  /***
   * Query NFT offers.
   * @param paginationOptions
   */
  public async getOffers(paginationOptions?: PaginationOptions) {
    const results = await this.eos.getTableRows(
      {
        code: this.contract,
        table: 'offers'
      },
      paginationOptions
    )
    results.rows = results.rows.map(r => new Offer(r))
    return results
  }

  /***
   * Get offer associated to an NFT.
   * @param tokenId
   */
  public async getOffer(tokenId: string) {
    return new Offer(
      await this.eos.getTableRow({
        code: this.contract,
        table: 'offers',
        primaryKey: tokenId
      })
    )
  }

  /***
   * Query the fungible token offers.
   */
  public async getFungibleOffers() {
    const results = await this.eos.getTableRows({
      code: this.contract,
      table: 'offerfs'
    })
    results.rows = results.rows.map(r => new OfferFungible(r))
    return results
  }

  /***
   * Query the delegated tokens.
   * @param paginationOptions
   */
  public async getDelegations(paginationOptions: PaginationOptions) {
    const results = await this.eos.getTableRows(
      {
        code: this.contract,
        table: 'delegates'
      },
      paginationOptions
    )
    results.rows = results.rows.map(r => new TokenDelegation(r))
    return results
  }

  /***
   * Query the delegated tokens.
   * @param tokenId
   */
  public async getDelegation(tokenId: string) {
    return new TokenDelegation(
      await this.eos.getTableRow({
        code: this.contract,
        table: 'delegates',
        primaryKey: tokenId
      })
    )
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

  public claim(claimer: Account, assetIds: uint64_t[]) {
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

  public transfer(from: Account, to: name, assetIds: uint64_t[], memo: string) {
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

  public canceloffer(owner: Account, assetIds: uint64_t[]) {
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

  public burn(owner: Account, assetIds: uint64_t[], memo: string) {
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

  public undelegate(owner: Account, from: name, assetIds: uint64_t[]) {
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

  public attach(owner: Account, assetIdc: uint64_t, assetIds: uint64_t[]) {
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

  public detach(owner: Account, assetIdc: uint64_t, assetIds: uint64_t[]) {
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
    assetIdc: uint64_t
  ) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'attachf',
      data: {
        owner: owner.name,
        author,
        quantity,
        assetidc: assetIdc
      },
      authorization: this.actionAuth(owner)
    })
  }

  public detachf(
    owner: Account,
    author: name,
    quantity: asset,
    assetIdc: uint64_t
  ) {
    return this.actionResult({
      account: this.contractAccount,
      name: 'detachf',
      data: {
        owner: owner.name,
        author,
        quantity,
        assetidc: assetIdc
      },
      authorization: this.actionAuth(owner)
    })
  }

  public updatef(author: Account, sym: _symbol, data: string) {
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

  public issuef(to: name, author: Account, quantity: asset, memo: string) {
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

  public cancelofferf(owner: Account, ftOfferIds: uint64_t[]) {
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

  public claimf(claimer: Account, ftOfferIds: uint64_t[]) {
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

  public burnf(from: Account, author: name, quantity: asset, memo: string) {
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

  public openf(owner: name, author: name, symbol: _symbol, ramPayer: Account) {
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

  public closef(owner: Account, author: name, symbol: _symbol) {
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

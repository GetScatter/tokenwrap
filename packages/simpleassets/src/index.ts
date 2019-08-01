import {
  EosioTokenStandard,
  FlexAuth,
  PaginationOptions,
  Transaction
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
  public transferNft(
    from: FlexAuth,
    to: string,
    ids: string[],
    memo: string
  ): Transaction {
    return this.transfer(from, to, ids, memo)
  }

  public transferFt(
    from: FlexAuth,
    to: string,
    amount: { author: string; quantity: string },
    memo: string
  ): Transaction {
    return this.transferf(from, to, amount.author, amount.quantity, memo)
  }

  public offerNft(
    owner: FlexAuth,
    newOwner: string,
    ids: string[],
    memo: string
  ): Transaction {
    return this.offer(owner, newOwner, ids, memo)
  }

  public acceptNft(claimer: FlexAuth, ids: string[]): Transaction {
    return this.claim(claimer, ids)
  }

  public rentOutNft(
    owner: FlexAuth,
    to: string,
    ids: string[],
    period: number | string,
    memo: string
  ): Transaction {
    return this.delegate(owner, to, ids, period, memo)
  }

  public reclaimNft(owner: FlexAuth, from: string, ids: string[]): Transaction {
    return this.undelegate(owner, from, ids)
  }

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
    return this.getSendableAction({
      account: this.contract,
      name: 'updatever',
      data: { version },
      authorization: this.contract
    })
  }

  public regauthor(author: FlexAuth, data: string, sTemplate: string) {
    return this.getSendableAction({
      account: this.contract,
      name: 'regauthor',
      data: {
        author: this.getAccountName(author),
        data,
        stemplate: sTemplate
      },
      authorization: author
    })
  }

  public authorupdate(author: FlexAuth, data: string, sTemplate: string) {
    return this.getSendableAction({
      account: this.contract,
      name: 'authorupdate',
      data: {
        author: this.getAccountName(author),
        data,
        stemplate: sTemplate
      },
      authorization: author
    })
  }

  public create(
    author: FlexAuth,
    category: string,
    owner: string,
    iData: string,
    mData: string,
    requireClaim: boolean
  ) {
    return this.getSendableAction({
      account: this.contract,
      name: 'create',
      data: {
        author: this.getAccountName(author),
        category,
        owner,
        idata: iData,
        mdata: mData,
        requireclaim: requireClaim
      },
      authorization: author
    })
  }

  public claim(claimer: FlexAuth, assetIds: string[]) {
    return this.getSendableAction({
      account: this.contract,
      name: 'claim',
      data: {
        claimer: this.getAccountName(claimer),
        assetids: assetIds
      },
      authorization: claimer
    })
  }

  public transfer(
    from: FlexAuth,
    to: string,
    assetIds: string[],
    memo: string
  ) {
    return this.getSendableAction({
      account: this.contract,
      name: 'transfer',
      data: {
        from: this.getAccountName(from),
        to,
        assetids: assetIds,
        memo
      },
      authorization: from
    })
  }

  public update(
    author: FlexAuth,
    owner: string,
    assetIds: string[],
    mdata: string
  ) {
    return this.getSendableAction({
      account: this.contract,
      name: 'update',
      data: {
        author: this.getAccountName(author),
        owner,
        assetids: assetIds,
        mdata
      },
      authorization: author
    })
  }

  public offer(
    owner: FlexAuth,
    newOwner: string,
    assetIds: string[],
    memo: string
  ) {
    return this.getSendableAction({
      account: this.contract,
      name: 'offer',
      data: {
        owner: this.getAccountName(owner),
        newowner: newOwner,
        assetids: assetIds,
        memo
      },
      authorization: owner
    })
  }

  public canceloffer(owner: FlexAuth, assetIds: string[]) {
    return this.getSendableAction({
      account: this.contract,
      name: 'canceloffer',
      data: {
        owner: this.getAccountName(owner),
        assetids: assetIds
      },
      authorization: owner
    })
  }

  public burn(owner: FlexAuth, assetIds: string[], memo: string) {
    return this.getSendableAction({
      account: this.contract,
      name: 'burn',
      data: {
        owner: this.getAccountName(owner),
        assetids: assetIds,
        memo
      },
      authorization: owner
    })
  }

  public delegate(
    owner: FlexAuth,
    to: string,
    assetIds: string[],
    period: number | string,
    memo: string
  ) {
    return this.getSendableAction({
      account: this.contract,
      name: 'delegate',
      data: {
        owner: this.getAccountName(owner),
        to,
        assetids: assetIds,
        period,
        memo
      },
      authorization: owner
    })
  }

  public undelegate(owner: FlexAuth, from: string, assetIds: string[]) {
    return this.getSendableAction({
      account: this.contract,
      name: 'undelegate',
      data: {
        owner: this.getAccountName(owner),
        from,
        assetids: assetIds
      },
      authorization: owner
    })
  }

  public attach(owner: FlexAuth, assetIdc: string, assetIds: string[]) {
    return this.getSendableAction({
      account: this.contract,
      name: 'attach',
      data: {
        owner: this.getAccountName(owner),
        assetidc: assetIdc,
        assetids: assetIds
      },
      authorization: owner
    })
  }

  public detach(owner: FlexAuth, assetIdc: string, assetIds: string[]) {
    return this.getSendableAction({
      account: this.contract,
      name: 'detach',
      data: {
        owner: this.getAccountName(owner),
        assetidc: assetIdc,
        assetids: assetIds
      },
      authorization: owner
    })
  }

  public attachf(
    owner: FlexAuth,
    author: string,
    quantity: string,
    assetIdc: string
  ) {
    return this.getSendableAction({
      account: this.contract,
      name: 'attachf',
      data: {
        owner: this.getAccountName(owner),
        author,
        quantity,
        assetidc: assetIdc
      },
      authorization: owner
    })
  }

  public detachf(
    owner: FlexAuth,
    author: string,
    quantity: string,
    assetIdc: string
  ) {
    return this.getSendableAction({
      account: this.contract,
      name: 'detachf',
      data: {
        owner: this.getAccountName(owner),
        author,
        quantity,
        assetidc: assetIdc
      },
      authorization: owner
    })
  }

  public updatef(author: FlexAuth, sym: string, data: string) {
    return this.getSendableAction({
      account: this.contract,
      name: 'updatef',
      data: {
        author: this.getAccountName(author),
        sym,
        data
      },
      authorization: author
    })
  }

  public issuef(to: string, author: FlexAuth, quantity: string, memo: string) {
    return this.getSendableAction({
      account: this.contract,
      name: 'issuef',
      data: {
        to,
        author: this.getAccountName(author),
        quantity,
        memo
      },
      authorization: author
    })
  }

  public transferf(
    from: FlexAuth,
    to: string,
    author: string,
    quantity: string,
    memo: string
  ) {
    return this.getSendableAction({
      account: this.contract,
      name: 'transferf',
      data: {
        from: this.getAccountName(from),
        to,
        author,
        quantity,
        memo
      },
      authorization: from
    })
  }

  public offerf(
    owner: FlexAuth,
    newOwner: string,
    author: string,
    quantity: string,
    memo: string
  ) {
    return this.getSendableAction({
      account: this.contract,
      name: 'offerf',
      data: {
        owner: this.getAccountName(owner),
        newowner: newOwner,
        author,
        quantity,
        memo
      },
      authorization: owner
    })
  }

  public cancelofferf(owner: FlexAuth, ftOfferIds: string[]) {
    return this.getSendableAction({
      account: this.contract,
      name: 'cancelofferf',
      data: {
        owner: this.getAccountName(owner),
        ftofferids: ftOfferIds
      },
      authorization: owner
    })
  }

  public claimf(claimer: FlexAuth, ftOfferIds: string[]) {
    return this.getSendableAction({
      account: this.contract,
      name: 'claimf',
      data: {
        claimer: this.getAccountName(claimer),
        ftofferids: ftOfferIds
      },
      authorization: claimer
    })
  }

  public burnf(from: FlexAuth, author: string, quantity: string, memo: string) {
    return this.getSendableAction({
      account: this.contract,
      name: 'burnf',
      data: {
        from: this.getAccountName(from),
        author,
        quantity,
        memo
      },
      authorization: from
    })
  }

  public openf(
    owner: string,
    author: string,
    symbol: string,
    ramPayer: FlexAuth
  ) {
    return this.getSendableAction({
      account: this.contract,
      name: 'openf',
      data: {
        owner,
        author,
        symbol,
        ram_payer: this.getAccountName(ramPayer)
      },
      authorization: ramPayer
    })
  }

  public closef(owner: FlexAuth, author: string, symbol: string) {
    return this.getSendableAction({
      account: this.contract,
      name: 'closef',
      data: {
        owner: this.getAccountName(owner),
        author,
        symbol
      },
      authorization: owner
    })
  }
}

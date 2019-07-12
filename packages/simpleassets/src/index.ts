import {
  Authorization,
  EosioTokenStandard,
  PaginationOptions
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
    return this.getSendableAction({
      account: this.contract,
      name: 'updatever',
      data: { version },
      authorization: this.formatAuth(this.contract)
    })
  }

  public regauthor(
    author: string | Authorization,
    data: string,
    sTemplate: string
  ) {
    return this.getSendableAction({
      account: this.contract,
      name: 'regauthor',
      data: {
        author: this.formatAccount(author),
        data,
        stemplate: sTemplate
      },
      authorization: this.formatAuth(author)
    })
  }

  public authorupdate(
    author: string | Authorization,
    data: string,
    sTemplate: string
  ) {
    return this.getSendableAction({
      account: this.contract,
      name: 'authorupdate',
      data: {
        author: this.formatAccount(author),
        data,
        stemplate: sTemplate
      },
      authorization: this.formatAuth(author)
    })
  }

  public create(
    author: string | Authorization,
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
        author: this.formatAccount(author),
        category,
        owner,
        idata: iData,
        mdata: mData,
        requireclaim: requireClaim
      },
      authorization: this.formatAuth(author)
    })
  }

  public claim(claimer: string | Authorization, assetIds: string[]) {
    return this.getSendableAction({
      account: this.contract,
      name: 'claim',
      data: {
        author: this.formatAccount(claimer),
        assetids: assetIds
      },
      authorization: this.formatAuth(claimer)
    })
  }

  public transfer(
    from: string | Authorization,
    to: string,
    assetIds: string[],
    memo: string
  ) {
    return this.getSendableAction({
      account: this.contract,
      name: 'transfer',
      data: {
        from: this.formatAccount(from),
        to,
        assetids: assetIds,
        memo
      },
      authorization: this.formatAuth(from)
    })
  }

  public update(
    author: string | Authorization,
    owner: string,
    assetIds: string[],
    mdata: string
  ) {
    return this.getSendableAction({
      account: this.contract,
      name: 'update',
      data: {
        author: this.formatAccount(author),
        owner,
        assetids: assetIds,
        mdata
      },
      authorization: this.formatAuth(author)
    })
  }

  public offer(
    owner: string | Authorization,
    newOwner: string,
    assetIds: string[],
    memo: string
  ) {
    return this.getSendableAction({
      account: this.contract,
      name: 'offer',
      data: {
        owner: this.formatAccount(owner),
        newowner: newOwner,
        assetids: assetIds,
        memo
      },
      authorization: this.formatAuth(owner)
    })
  }

  public canceloffer(owner: string | Authorization, assetIds: string[]) {
    return this.getSendableAction({
      account: this.contract,
      name: 'canceloffer',
      data: {
        owner: this.formatAccount(owner),
        assetids: assetIds
      },
      authorization: this.formatAuth(owner)
    })
  }

  public burn(owner: string | Authorization, assetIds: string[], memo: string) {
    return this.getSendableAction({
      account: this.contract,
      name: 'burn',
      data: {
        owner: this.formatAccount(owner),
        assetids: assetIds,
        memo
      },
      authorization: this.formatAuth(owner)
    })
  }

  public delegate(
    owner: string | Authorization,
    to: string,
    assetIds: string[],
    period: string | number,
    memo: string
  ) {
    return this.getSendableAction({
      account: this.contract,
      name: 'delegate',
      data: {
        owner: this.formatAccount(owner),
        to,
        assetids: assetIds,
        period,
        memo
      },
      authorization: this.formatAuth(owner)
    })
  }

  public undelegate(
    owner: string | Authorization,
    from: string,
    assetIds: string[]
  ) {
    return this.getSendableAction({
      account: this.contract,
      name: 'undelegate',
      data: {
        owner: this.formatAccount(owner),
        from,
        assetids: assetIds
      },
      authorization: this.formatAuth(owner)
    })
  }

  public attach(
    owner: string | Authorization,
    assetIdc: string,
    assetIds: string[]
  ) {
    return this.getSendableAction({
      account: this.contract,
      name: 'attach',
      data: {
        owner: this.formatAccount(owner),
        assetidc: assetIdc,
        assetids: assetIds
      },
      authorization: this.formatAuth(owner)
    })
  }

  public detach(
    owner: string | Authorization,
    assetIdc: string,
    assetIds: string[]
  ) {
    return this.getSendableAction({
      account: this.contract,
      name: 'detach',
      data: {
        owner: this.formatAccount(owner),
        assetidc: assetIdc,
        assetids: assetIds
      },
      authorization: this.formatAuth(owner)
    })
  }

  public attachf(
    owner: string | Authorization,
    author: string,
    quantity: string,
    assetIdc: string
  ) {
    return this.getSendableAction({
      account: this.contract,
      name: 'attachf',
      data: {
        owner: this.formatAccount(owner),
        author,
        quantity,
        assetidc: assetIdc
      },
      authorization: this.formatAuth(owner)
    })
  }

  public detachf(
    owner: string | Authorization,
    author: string,
    quantity: string,
    assetIdc: string
  ) {
    return this.getSendableAction({
      account: this.contract,
      name: 'detachf',
      data: {
        owner: this.formatAccount(owner),
        author,
        quantity,
        assetidc: assetIdc
      },
      authorization: this.formatAuth(owner)
    })
  }

  public updatef(author: string | Authorization, sym: string, data: string) {
    return this.getSendableAction({
      account: this.contract,
      name: 'updatef',
      data: {
        author: this.formatAccount(author),
        sym,
        data
      },
      authorization: this.formatAuth(author)
    })
  }

  public issuef(
    to: string,
    author: string | Authorization,
    quantity: string,
    memo: string
  ) {
    return this.getSendableAction({
      account: this.contract,
      name: 'transferf',
      data: {
        to,
        author: this.formatAccount(author),
        quantity,
        memo
      },
      authorization: this.formatAuth(author)
    })
  }

  public transferf(
    from: string | Authorization,
    to: string,
    author: string,
    quantity: string,
    memo: string
  ) {
    return this.getSendableAction({
      account: this.contract,
      name: 'transferf',
      data: {
        from: this.formatAccount(from),
        to,
        author,
        quantity,
        memo
      },
      authorization: this.formatAuth(from)
    })
  }

  public offerf(
    owner: string | Authorization,
    newOwner: string,
    author: string,
    quantity: string,
    memo: string
  ) {
    return this.getSendableAction({
      account: this.contract,
      name: 'offerf',
      data: {
        owner: this.formatAccount(owner),
        newowner: newOwner,
        author,
        quantity,
        memo
      },
      authorization: this.formatAuth(owner)
    })
  }

  public cancelofferf(owner: string | Authorization, ftOfferIds: string[]) {
    return this.getSendableAction({
      account: this.contract,
      name: 'cancelofferf',
      data: {
        owner: this.formatAccount(owner),
        ftofferids: ftOfferIds
      },
      authorization: this.formatAuth(owner)
    })
  }

  public claimf(claimer: string | Authorization, ftOfferIds: string[]) {
    return this.getSendableAction({
      account: this.contract,
      name: 'claimf',
      data: {
        claimer: this.formatAccount(claimer),
        ftofferids: ftOfferIds
      },
      authorization: this.formatAuth(claimer)
    })
  }

  public burnf(
    from: string | Authorization,
    author: string,
    quantity: string,
    memo: string
  ) {
    return this.getSendableAction({
      account: this.contract,
      name: 'burnf',
      data: {
        from: this.formatAccount(from),
        author,
        quantity,
        memo
      },
      authorization: this.formatAuth(from)
    })
  }

  public openf(
    owner: string,
    author: string,
    symbol: string,
    ramPayer: string | Authorization
  ) {
    return this.getSendableAction({
      account: this.contract,
      name: 'openf',
      data: {
        owner,
        author,
        symbol,
        ram_payer: this.formatAccount(ramPayer)
      },
      authorization: this.formatAuth(ramPayer)
    })
  }

  public closef(owner: string | Authorization, author: string, symbol: string) {
    return this.getSendableAction({
      account: this.contract,
      name: 'closef',
      data: {
        owner: this.formatAccount(owner),
        author,
        symbol
      },
      authorization: this.formatAuth(owner)
    })
  }
}

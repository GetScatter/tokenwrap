import {
  EosioTokenStandard,
  FlexAuth,
  PaginationOptions,
  Transaction
} from '@tokenwrap/core-eosio'
import { Ask, Config, Stats, TokenBalance, TokenDetails } from './models'

export class DGoods extends EosioTokenStandard {
  public transferNft(
    from: FlexAuth,
    to: string,
    ids: string[],
    memo: string
  ): Transaction {
    return this.transfernft(from, to, ids, memo)
  }

  public transferFt(
    from: FlexAuth,
    to: string,
    amount: { category: string; tokenName: string; quantity: string },
    memo: string
  ): Transaction {
    return this.transferft(
      from,
      to,
      amount.category,
      amount.tokenName,
      amount.quantity,
      memo
    )
  }

  public offerNft(
    owner: FlexAuth,
    newOwner: string,
    ids: string[],
    memo: string
  ): Transaction {
    throw new Error('DGoods does not support offerNft')
  }

  public acceptNft(claimer: FlexAuth, ids: string[]): Transaction {
    throw new Error('DGoods does not support acceptNft')
  }

  public rentOutNft(
    owner: FlexAuth,
    to: string,
    ids: string[],
    period: string | number,
    memo: string
  ): Transaction {
    throw new Error('DGoods does not support rentOutNft')
  }

  public reclaimNft(owner: FlexAuth, from: string, ids: string[]): Transaction {
    throw new Error('DGoods does not support reclaimNft')
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
   * Get the specific token balance of an account
   * @param accountName
   * @param categoryNameId
   */
  public async getBalance(accountName: string, categoryNameId: string) {
    return new TokenBalance(
      await this.eos.getTableRow({
        code: this.contract,
        scope: accountName,
        table: 'accounts',
        primaryKey: categoryNameId
      })
    )
  }

  /***
   * Check if a specific category is defined in the contract.
   * @param category
   */
  public async hasCategory(category: string) {
    const result = await this.eos.getTableRow({
      code: this.contract,
      table: 'categoryinfo',
      primaryKey: category
    })
    return result !== undefined
  }

  /***
   * Query the categories defined in the contract.
   */
  public async getCategories(paginationOptions?: PaginationOptions) {
    return this.eos.getTableRows(
      {
        code: this.contract,
        table: 'categoryinfo'
      },
      paginationOptions
    )
  }

  /***
   * Query the token stats list.
   * @param category
   */
  public async getTokenStats(
    category: string,
    paginationOptions?: PaginationOptions
  ): Promise<{ rows: Stats[]; more: boolean }>
  /***
   * Get stats about a specific token.
   * @param category
   * @param tokenName
   */
  public async getTokenStats(
    category: string,
    tokenName: string
  ): Promise<Stats>
  public async getTokenStats(category: any, option: any): Promise<any> {
    if (typeof option === 'string') {
      return new Stats(
        await this.eos.getTableRow({
          code: this.contract,
          scope: category,
          table: 'dgoodstats',
          primaryKey: option
        })
      )
    } else {
      const results = await this.eos.getTableRows(
        {
          code: this.contract,
          scope: category,
          table: 'dgoodstats'
        },
        option
      )
      results.rows = results.rows.map(r => new Stats(r))
      return results
    }
  }

  // TODO Add functionality to query by owner account
  /***
   * Query the token details list.
   * @param paginationOptions
   */
  public async getTokenDetails(
    paginationOptions?: PaginationOptions
  ): Promise<{ rows: TokenDetails[]; more: boolean }>
  /***
   * Get the details about a specific token.
   * @param tokenId
   */
  public async getTokenDetails(tokenId: string): Promise<TokenDetails>
  public async getTokenDetails(option: any): Promise<any> {
    if (typeof option === 'string') {
      return new TokenDetails(
        await this.eos.getTableRow({
          code: this.contract,
          table: 'dgood',
          primaryKey: option
        })
      )
    } else {
      const results = await this.eos.getTableRows(
        {
          code: this.contract,
          table: 'dgood'
        },
        option
      )
      results.rows = results.rows.map(r => new TokenDetails(r))
      return results
    }
  }

  // TODO Add functionality to query by seller account
  /***
   * Query token sale listings.
   */
  public async getAsks(paginationOptions?: PaginationOptions) {
    const results = await this.eos.getTableRows(
      {
        code: this.contract,
        table: 'dgood'
      },
      paginationOptions
    )
    results.rows = results.rows.map(r => new Ask(r))
    return results as { rows: Ask[]; more: boolean }
  }

  /***
   * Get a specific token sale listing.
   * @param tokenId
   */
  public async getAsk(tokenId: string) {
    return new Ask(
      await this.eos.getTableRow({
        code: this.contract,
        table: 'dgood',
        primaryKey: tokenId
      })
    )
  }

  /*********************************/
  /******  METHOD FORMATTERS  ******/
  /*********************************/

  public setconfig(symbol: string, version: string) {
    return this.getSendableAction({
      account: this.contract,
      name: 'setconfig',
      data: {
        symbol,
        version
      },
      authorization: this.contract
    })
  }

  public create(
    issuer: FlexAuth,
    category: string,
    tokenName: string,
    fungible: boolean,
    burnable: boolean,
    sellable: boolean,
    transferable: boolean,
    baseUri: string,
    maxSupply: string
  ) {
    return this.getSendableAction({
      account: this.contract,
      name: 'create',
      data: {
        issuer: this.getAccountName(issuer),
        category,
        token_name: tokenName,
        fungible,
        burnable,
        sellable,
        transferable,
        base_uri: baseUri,
        max_supply: maxSupply
      },
      authorization: issuer
    })
  }

  public issue(
    to: string,
    category: string,
    tokenName: string,
    quantity: string,
    metadataType: string,
    relativeUri: string,
    memo: string
  ) {
    return this.getSendableAction({
      account: this.contract,
      name: 'create',
      data: {
        to,
        category,
        token_name: tokenName,
        quantity,
        relative_uri: relativeUri,
        memo
      },
      authorization: this.contract
    })
  }

  public burnnft(owner: FlexAuth, dgoodIds: string[]) {
    return this.getSendableAction({
      account: this.contract,
      name: 'create',
      data: {
        owner: this.getAccountName(owner),
        dgood_ids: dgoodIds
      },
      authorization: owner
    })
  }

  public burnft(owner: FlexAuth, categoryNameId: string, quantity: string) {
    return this.getSendableAction({
      account: this.contract,
      name: 'create',
      data: {
        owner: this.getAccountName(owner),
        category_name_id: categoryNameId,
        quantity
      },
      authorization: owner
    })
  }

  public transfernft(
    from: FlexAuth,
    to: string,
    dgoodIds: string[],
    memo: string
  ) {
    return this.getSendableAction({
      account: this.contract,
      name: 'create',
      data: {
        from: this.getAccountName(from),
        to,
        dgood_ids: dgoodIds,
        memo
      },
      authorization: from
    })
  }

  public transferft(
    from: FlexAuth,
    to: string,
    category: string,
    tokenName: string,
    quantity: string,
    memo: string
  ) {
    return this.getSendableAction({
      account: this.contract,
      name: 'create',
      data: {
        from: this.getAccountName(from),
        to,
        category,
        token_name: tokenName,
        quantity,
        memo
      },
      authorization: from
    })
  }

  public listsalenft(seller: FlexAuth, dgoodId: string, netSaleAmount: string) {
    return this.getSendableAction({
      account: this.contract,
      name: 'listsalenft',
      data: {
        seller: this.getAccountName(seller),
        dgood_id: dgoodId,
        net_sale_amount: netSaleAmount
      },
      authorization: seller
    })
  }

  public closesalenft(seller: FlexAuth, dgoodId: string) {
    return this.getSendableAction({
      account: this.contract,
      name: 'closesalenft',
      data: {
        seller: this.getAccountName(seller),
        dgood_id: dgoodId
      },
      authorization: seller
    })
  }
}

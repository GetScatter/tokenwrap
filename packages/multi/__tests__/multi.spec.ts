/// <reference types="../../../@types/types" />

import { suite, test, timeout } from 'mocha-typescript'

import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)
const { assert } = chai

import { Api, JsonRpc } from 'eosjs'
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig'
import fetch from 'node-fetch'
import { TextDecoder, TextEncoder } from 'util'

import * as Eos from 'eosjs-legacy'

import { Morpheos } from '@tokenwrap/core-eosio'
import { DGoods } from '@tokenwrap/dgoods'
import { SimpleAssets } from '@tokenwrap/simpleassets'
import { MultiWrapper } from '../src/index'

const httpEndpoint = 'https://api.jungle.alohaeos.com'
const privateKey = '5K3MYohjJLNfNGD6Dg2xuqiZcgKejos9bLHwwjkyw7eH3JxvyZj'
const chainId =
  '038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca'

@suite(timeout(5000))
class MultiWrapperTests {
  public eos: Api
  public morph: Morpheos
  public multi: MultiWrapper

  constructor() {
    const signatureProvider = new JsSignatureProvider([privateKey])
    const rpc = new JsonRpc(httpEndpoint, { fetch })
    this.eos = new Api({
      rpc,
      signatureProvider,
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder()
    })

    // Overwrite with legacy eosjs
    this.eos = Eos({
      httpEndpoint,
      keyProvider: privateKey,
      chainId
    })

    this.morph = new Morpheos(this.eos)
    this.multi = new MultiWrapper(this.eos)
    this.multi.use('dgoods', DGoods)
    this.multi.use('simpleassets', SimpleAssets)
  }

  @test public async FlatteningActionsTest() {
    const items = [
      {
        standard: 'simpleassets',
        contract: 'simplesimple',
        id: '100000000000003'
      }
    ]
    const transaction = await this.morph.transact(
      [
        {
          account: 'stanismarket',
          name: 'sellnft',
          authorization: [{ actor: 'account', permission: 'active' }],
          data: {
            owner: 'account',
            nfts: [{ contract: items[0].contract, token_ids: [items[0].id] }],
            price: '0.0001 EOS'
          }
        },
        this.multi.transferNft(
          'account',
          'stanismarket',
          items,
          'Selling on Scatter Marketplace'
        )
      ],
      { broadcast: false, sign: false }
    )
    // console.log(transaction.transaction.transaction.actions)
  }
}

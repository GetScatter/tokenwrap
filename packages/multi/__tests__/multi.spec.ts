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

import { Morpheos } from '@tokenwrap/core-eosio'
import { DGoods } from '@tokenwrap/dgoods'
import { SimpleAssets } from '@tokenwrap/simpleassets'
import { MultiWrapper } from '../src/index'

const httpEndpoint = 'https://api.jungle.alohaeos.com'
const privateKey = '5K3MYohjJLNfNGD6Dg2xuqiZcgKejos9bLHwwjkyw7eH3JxvyZj'

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
    const auth = { actor: 'someaccount', permission: 'active' }
    assert.isFulfilled(
      this.morph.transact(
        [
          {
            account: 'stanismarket',
            name: 'sellnft',
            authorization: [auth],
            data: {
              owner: auth.actor,
              nfts: [{ contract: items[0].contract, token_ids: [items[0].id] }],
              price: '0.0001 EOS'
            }
          },
          this.multi.transferNft(
            auth,
            'stanismarket',
            items,
            'Selling on Scatter Marketplace'
          )
        ],
        { broadcast: false, sign: false }
      )
    )
  }
}

/// <reference types="../../../@types/types" />

import { suite, test, timeout } from 'mocha-typescript'

import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)
const { assert } = chai

import { EosUp } from 'eosup'

import { DGoods } from '@tokenwrap/dgoods'
import { SimpleAssets } from '@tokenwrap/simpleassets'
import { MultiWrapper } from '../src/index'

@suite(timeout(5000))
class MultiWrapperTests {
  public up: any
  public multi: MultiWrapper

  constructor() {
    this.up = new EosUp()

    this.multi = new MultiWrapper(this.up.eos)
    this.multi.use('dgoods', DGoods)
    this.multi.use('simpleassets', SimpleAssets)
  }
}

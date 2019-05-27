import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)
const { assert } = chai
import 'mocha'

import Tokenwrap from '../src/index';

/// @ts-ignore
import * as Eos from 'eosjs'
// @ts-ignore
import DGoods from '@tokenwrap/dgoods'
// @ts-ignore
import SimpleAssets from '@tokenwrap/simpleassets'

describe('dGoods SDK', () => {
  let tokenwrap: Tokenwrap = null as any;

  it('should instantiate a tokenwrap instance', async () => {
    const eos = Eos({ httpEndpoint: 'https://api.jungle.alohaeos.com' })
    tokenwrap = new Tokenwrap([
      // TODO: Is it a problem having to predefine every contract?
      new DGoods(eos, 'dgoodsdgoods'),
      new SimpleAssets(eos, 'simpleassets')
    ])
  })

  it('should be able to get an account\'s balances', async () => {
    const tokens = await tokenwrap.getTokens('marketmarket');
    console.log(tokens);
  })

})

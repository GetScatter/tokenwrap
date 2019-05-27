import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)
const { assert } = chai

/// @ts-ignore
import * as Eos from 'eosjs'
import 'mocha'
import SimpleAssets from '../src/index'

describe('Simple Assets SDK', () => {
  let simpleassets: SimpleAssets = null as any

  it('should instantiate a simpleassets instance', async () => {
    const eos = Eos({ httpEndpoint: 'https://api.jungle.alohaeos.com' })
    simpleassets = new SimpleAssets(eos, 'simpleassets')
    assert(simpleassets, 'Did not instantiate a simpleassets instance')
  })

  it('should be able to get the token configs', async () => {
    assert(await simpleassets.getConfig(), 'Could not get token configs')
  })

})

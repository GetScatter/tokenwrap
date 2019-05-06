import dGoods from '../lib/dgoods';
import * as Eos from 'eosjs';
import { assert } from 'chai';
import 'mocha';

describe('dGoods SDK', () => {
	let dgoods:dGoods = null;

	it('should instantiate a dgoods instance', done => {
		// @ts-ignore
		new Promise(async() => {
			const eos = Eos({httpEndpoint:'https://api.jungle.alohaeos.com'});
			dgoods = new dGoods(eos, 'dgoodsdgoods');
			assert(dgoods, "Did not instantiate a dgoods instance");
			return done();
		});
	});

	it('should be able to get the token configs', done => {
		// @ts-ignore
		new Promise(async() => {
			assert(await dgoods.getConfig(), "Could not get token configs");
			return done();
		});
	});

	it('should be able to get categories', done => {
		// @ts-ignore
		new Promise(async() => {
			const allCategories = await dgoods.getCategory();
			assert(allCategories.length > 0, "Could not get categories");
			const specificCategory = await dgoods.getCategory(allCategories[1].category);
			assert(specificCategory.category === allCategories[1].category, "Could not fetch category");
			assert(!await dgoods.getCategory('badcat'), "Found category it shouldn't have");

			return done();
		});
	});

	it('should be able to get token stats', done => {
		// @ts-ignore
		new Promise(async() => {
			const allCategories = await dgoods.getCategory();
			const allStats = await dgoods.getStats(allCategories[0].category);
			assert(allStats.length > 0, "Could not get token stats");
			const specificStat = await dgoods.getStats(allCategories[0].category, allStats[0].token_name);
			assert(specificStat && specificStat.token_name === allStats[0].token_name, "Could not get specific token stat.");
			assert(!await dgoods.getStats(allCategories[0].category, 'notoken'), "Found token stat it shouldn't have.")

			return done();
		});
	});

	it('should be able to get account tokens', done => {
		// @ts-ignore
		new Promise(async() => {
			const allAccountTokens = await dgoods.getBalances('marketmarket');
			assert(allAccountTokens.length > 0, "Could not get account tokens");
			const specificTokenBalance = await dgoods.getBalances('marketmarket', allAccountTokens[0].category_name_id);
			assert(specificTokenBalance && specificTokenBalance.category_name_id === allAccountTokens[0].category_name_id, "Could not get specific token balance.");
			assert(!await dgoods.getBalances('marketmarket', 99999), "Found token balance it shouldn't have.")

			return done();
		});
	});

	it('should be able to get token infos', done => {
		// @ts-ignore
		new Promise(async() => {
			const allInfos = await dgoods.getTokenInfo();
			assert(allInfos.length > 0, "Could not get token infos");
			const specificTokenInfo = await dgoods.getTokenInfo(allInfos[0].id);
			assert(specificTokenInfo && specificTokenInfo.id === allInfos[0].id, "Could not get specific token info");
			assert(!await dgoods.getTokenInfo(99999), "Got a token info it shouldn't have.");
			return done();
		});
	});

	it('should be able to transact single actions', done => {
		// @ts-ignore
		new Promise(async() => {
			const result = await dgoods.setconfig('EOS', '1.0.0').send();
			return done();
		});
	});
	//
	it('should be able to transact multiple actions', done => {
		// @ts-ignore
		new Promise(async() => {
			const result = await dgoods.transact([
				dgoods.setconfig('EOS', '1.0.0'),
				dgoods.setrampayer({name:'test11user'}, 1),
			]);
			console.log('result', result);
			return done();
		});
	});

	it('should be able to transact multiple actions along with other cleartext actions', done => {
		// @ts-ignore
		new Promise(async() => {
			const result = await dgoods.transact([
				dgoods.setconfig('EOS', '1.0.0'),
				// Loose JSON can be anywhere in the stack and will be included
				// in its exact position in the transaction batch.
				{
					account:'eosio.token',
					name:'transfer',
					data:{
						from:'someone',
						to:'someone',
						quantity:'1.0000 EOS',
						memo:'',
					},
					authorization:[{
						actor:'someone',
						permission:'active',
					}],
				},
				dgoods.setrampayer({name:'test11user'}, 1),
			]);
			console.log('result', result);
			return done();
		});
	});

});

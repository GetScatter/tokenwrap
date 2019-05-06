import {encodeName, getTableRowsBuilder} from '@tokenwrap/core';

type name = String;
type symbol_code = String;
type uint64_t = number;
type dasset = String;
type account = {name:name, authority?:string};
type action = {json:object, send:any};

export class DAsset {

    readonly amount             :number;
    readonly precision          :number;

    constructor(){}
    static placeholder(){ return new DAsset(); }
    static fromJson(json){ return (<any>Object).assign(DAsset.placeholder(), json); }

    public toString(){
        return parseFloat(this.amount.toString()).toFixed(this.precision).toString();
    }

}

export class Configs {

    readonly standard           :name;
    readonly version            :string;
    readonly symbol             :symbol_code;
    readonly category_name_id   :uint64_t;

    constructor(){}
    static placeholder(){ return new Configs(); }
    static fromJson(json){ return (<any>Object).assign(Configs.placeholder(), json); }
}

export class Category {

    readonly category           :name;

    constructor(){}
    static placeholder(){ return new Category(); }
    static fromJson(json){ return (<any>Object).assign(Category.placeholder(), json); }
}

export class Stats {

    readonly fungible           :boolean;
    readonly burnable           :boolean;
    readonly transferable       :boolean;
    readonly issuer             :name;
    readonly token_name         :name;
    readonly category_name_id   :uint64_t;
    readonly max_supply         :dasset;
    readonly current_supply     :uint64_t;
    readonly issued_supply      :uint64_t;

    constructor(){}
    static placeholder(){ return new Stats(); }
    static fromJson(json){
        let p = (<any>Object).assign(Stats.placeholder(), json);
        p.max_supply = DAsset.fromJson(json.max_supply);
        return p;
    }
}

export class TokenBalance {

    readonly category_name_id   :uint64_t;
    readonly category           :name;
    readonly token_name         :name;
    readonly amount             :DAsset;

    constructor(){}
    static placeholder(){ return new TokenBalance(); }
    static fromJson(json){
        let p = (<any>Object).assign(TokenBalance.placeholder(), json);
        p.amount = DAsset.fromJson(json.amount);
        return p;
    }
}

export class TokenInfo {

    readonly id                 :uint64_t;
    readonly serial_number      :uint64_t;
    readonly owner              :name;
    readonly category           :name;
    readonly token_name         :name;
    readonly metadata_type      :String;
    readonly metadata_uri       :String;

    constructor(){}
    static placeholder(){ return new TokenInfo(); }
    static fromJson(json){ return (<any>Object).assign(TokenInfo.placeholder(), json); }
}

export default class dGoods {

    private eos                :any;
    private isLegacy           :boolean;
    private contractAccount    :name;
    private getTableRows       :any;

    /***
     * @param eosReference - an instantiated eosjs@16.0.9 or eosjs@20+ reference.
     * @param contract - a string of the contract name.
     */
    constructor(eosReference:any, contract:string){
        if(!eosReference) throw new Error('eosReference must be an instantiated eosjs@16.0.9 or eosjs@20+ reference.')
        if(!contract.length) throw new Error('contract must be a valid account name');

        this.eos = eosReference;
        this.isLegacy = typeof eosReference.contract === 'function';
        this.contractAccount = contract;

        this.getTableRows = getTableRowsBuilder(this.eos, this.contractAccount);
    }

    public transact(actions:Array<action | object>){
        return this.transactor()({
            actions:actions.map(action => {
                if(action.hasOwnProperty('json')) return (<any>action).json;
                else return action;
            })
        })
    }





    /*********************************/
    /********  DATA FETCHERS *********/
    /*********************************/

    /***
     * Gets the base token configs
     */
    public async getConfig(){
        return await this.getTableRows('tokenconfigs', {model:Configs, firstOnly:true}).catch(err => {
            console.error(err);
            return null;
        });
    }

    /***
     * Specify a category_name_id to get it, or none to get all.
     * @param account_name
     * @param category_name_id
     */
    public async getBalances(account_name:name, category_name_id:uint64_t = null){
        return await this.getTableRows('accounts', {
            scope:encodeName(account_name),
            model:TokenBalance,
            firstOnly:category_name_id !== null,
            rowsOnly:category_name_id === null,
            index:category_name_id !== null ? category_name_id : null,
        }).catch(err => {
            console.error(err);
            return category_name_id === null ? [] : null;
        });
    }

    /***
     * Specify a category to get it, or none to get all.
     * @param category
     */
    public async getCategory(category:name = null){
        return await this.getTableRows('categories', {
            model:Category,
            firstOnly:!!category,
            rowsOnly:!category,
            index:category ? encodeName(category) : null,
        }).catch(err => {
            console.error(err);
            return !category ? [] : null;
        });
    }

    /***
     * Specify a token_name to get it, or none to get all.
     * @param category
     * @param token_name
     */
    public async getStats(category:name, token_name:name = null){
        return await this.getTableRows('stats', {
            scope:encodeName(category),
            model:Stats,
            firstOnly:!!token_name,
            rowsOnly:!token_name,
            index:token_name ? encodeName(token_name) : null,
        }).catch(err => {
            console.error(err);
            return !token_name ? [] : null;
        });
    }

    /***
     * Specify a token_name to get it, or none to get all.
     * @param tokeninfo_id
     */
    public async getTokenInfo(tokeninfo_id:uint64_t = null){
        return await this.getTableRows('token', {
            model:TokenInfo,
            firstOnly:tokeninfo_id !== null,
            rowsOnly:tokeninfo_id === null,
            index:tokeninfo_id !== null ? tokeninfo_id : null,
        }).catch(err => {
            console.error(err);
            return tokeninfo_id === null ? [] : null;
        });
    }





    /*********************************/
    /******  METHOD FORMATTERS  ******/
    /*********************************/


    public setconfig(symbol:symbol_code, version:string){
        return this.actionResult({
            account:this.contractAccount,
            name:'setconfig',
            data:{
                symbol,
                version,
            },
            authorization: this.actionAuth(this.contractAccount)
        });
    }

    public create(issuer:account, category:name, token_name:name, fungible:boolean, burnable:boolean, transferable:boolean, max_supply:string){
        return this.actionResult({
            account:this.contractAccount,
            name:'create',
            data:{
                issuer:issuer.name,
                category,
                token_name,
                fungible,
                burnable,
                transferable,
                max_supply
            },
            authorization: this.actionAuth(issuer)
        });
    }

    public issue(to:name, category:name, token_name:name, quantity:string, metadata_type:string, metadata_uri:string, memo:string){
        return this.actionResult({
            account:this.contractAccount,
            name:'create',
            data:{
                to,
                category,
                token_name,
                quantity,
                metadata_type,
                metadata_uri,
                memo
            },
            authorization: this.actionAuth(this.contractAccount)
        });
    }

    public burnnft(owner:account, tokeninfo_ids:Array<uint64_t>){
        return this.actionResult({
            account:this.contractAccount,
            name:'create',
            data:{
                owner:owner.name,
                tokeninfo_ids
            },
            authorization: this.actionAuth(owner)
        });
    }

    public burn(owner:account, category_name_id:uint64_t, quantity:string){
        return this.actionResult({
            account:this.contractAccount,
            name:'create',
            data:{
                owner:owner.name,
                category_name_id,
                quantity
            },
            authorization: this.actionAuth(owner)
        });
    }

    public setrampayer(payer:account, id:uint64_t){
        return this.actionResult({
            account:this.contractAccount,
            name:'setrampayer',
            data:{
                payer:payer.name,
                id
            },
            authorization: this.actionAuth(payer)
        });
    }

    public transfernft(from:account, to:name, tokeninfo_ids:Array<uint64_t>, memo:string){
        return this.actionResult({
            account:this.contractAccount,
            name:'create',
            data:{
                from:from.name,
                to,
                tokeninfo_ids,
                memo
            },
            authorization: this.actionAuth(from)
        });
    }

    public transfer(from:account, to:name, category:name, token_name:name, quantity:string, memo:string){
        return this.actionResult({
            account:this.contractAccount,
            name:'create',
            data:{
                from:from.name,
                to,
                category,
                token_name,
                quantity,
                memo
            },
            authorization: this.actionAuth(from)
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
    private actionResult(json){
        return {json, send:() => this.transact([json])};
    }

    /***
     * Gets a transactor depending on the version of eosjs
     */
    private transactor(){
        return this.isLegacy ? this.eos.transaction : this.eos.transact;
    }

    /***
     * Creates an authorization array.
     * @param account
     */
    private actionAuth(account){
        if(typeof account === 'string') return [{actor:account, permission:'active'}];
        return [{ actor:account.name, permission:account.authority || account.permission || 'active' }];
    }

}


import {BigNumber} from "bignumber.js";

export const getTableRowsBuilder = (eos:any, contractAccount:String) => {
    return (table:String, options:any = {}) => {
        const formatRow = (result, model) => {
            result.rows = result.rows.map(model.fromJson);
            return result;
        };

        const getRowsOnly = result => result.rows;
        const getFirstOnly = result => result.rows.length ? getRowsOnly(result)[0] : null;

        // OPTION DEFAULTS
        let scope = options.scope || contractAccount;
        let index = options.index || null;
        let upper_bound = options.upper_bound || null;
        let search = options.search || null;
        let limit = options.limit || 10;
        let nobound = options.nobound || null;
        let key_type = options.key_type || null;
        let index_position = options.index_position || null;
        let model = options.model || null;
        let firstOnly = options.firstOnly || null;
        let rowsOnly = options.rowsOnly || null;

        // @ts-ignore
        let additions = index !== null ? {lower_bound:index, upper_bound: upper_bound ? upper_bound : BigNumber(index).plus(search !== null ? search : limit).toString()} : {};
        if(nobound) delete additions.upper_bound;
        if(key_type) additions = (<any>Object).assign({key_type}, additions);
        if(index_position) additions = (<any>Object).assign({index_position}, additions);
        const body = (<any>Object).assign({ json:true, code:contractAccount, scope, table, limit }, additions);
        return eos.getTableRows(body)
            .then(result => {
                if(model) result = formatRow(result, model);
                if(firstOnly) return getFirstOnly(result);
                if(rowsOnly) return getRowsOnly(result);
                return result;
            });
    }
}
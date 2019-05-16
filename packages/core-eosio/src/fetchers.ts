import * as Long from 'long'

const formatRow = (result: any, model: any) => {
  result.rows = result.rows.map(model.fromJson)
  return result
}
const getRowsOnly = (result: any) => result.rows
const getFirstOnly = (result: any) =>
  result.rows.length ? getRowsOnly(result)[0] : null

export const getTableRowsBuilder = (eos: any, contractAccount: string) => {
  return (table: string, options: any = {}) => {
    // OPTION DEFAULTS
    const scope = options.scope || contractAccount
    const index = options.index || null
    const upperBound = options.upper_bound || null
    const search = options.search || null
    const limit = options.limit || 10
    const nobound = options.nobound || null
    const keyType = options.key_type || null
    const indexPosition = options.index_position || null
    const model = options.model || null
    const firstOnly = options.firstOnly || null
    const rowsOnly = options.rowsOnly || null

    let additions =
      index !== null
        ? {
            lower_bound: index,
            upper_bound: upperBound
              ? upperBound
              : Long.fromValue(index)
                  .add(search !== null ? search : limit)
                  .toString()
          }
        : {}
    if (nobound) {
      delete additions.upper_bound
    }
    if (keyType) {
      additions = Object.assign({ key_type: keyType }, additions)
    }
    if (indexPosition) {
      additions = Object.assign({ index_position: indexPosition }, additions)
    }
    const body = Object.assign(
      { json: true, code: contractAccount, scope, table, limit },
      additions
    )
    return eos.getTableRows(body).then((result: any) => {
      if (model) {
        result = formatRow(result, model)
      }
      if (firstOnly) {
        return getFirstOnly(result)
      }
      if (rowsOnly) {
        return getRowsOnly(result)
      }
      return result
    })
  }
}

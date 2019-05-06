import {Long} from 'bytebuffer';

export const encodeName = name => {
    if(typeof name !== 'string') throw new TypeError('name parameter is a required string')
    if(name.length > 12) throw new TypeError('A name can be up to 12 characters long')

    let bitstr = ''
    for(let i = 0; i <= 12; i++) { // process all 64 bits (even if name is short)
        const c = i < name.length ? charidx(name[i]) : 0
        const bitlen = i < 12 ? 5 : 4
        let bits = Number(c).toString(2)
        if(bits.length > bitlen) {
            throw new TypeError('Invalid name ' + name)
        }
        bits = (<any>'0').repeat(bitlen - bits.length) + bits
        bitstr += bits
    }

    const value = Long.fromString(bitstr, true, 2)

    let leHex = ''
    const bytes = value.toBytesBE()
    for(const b of bytes) {
        const n = Number(b).toString(16)
        leHex += (n.length === 1 ? '0' : '') + n
    }

    const ulName = Long.fromString(leHex, true, 16).toString()
    return ulName.toString()
}

const charmap = '.12345abcdefghijklmnopqrstuvwxyz'
const charidx = ch => {
    const idx = charmap.indexOf(ch)
    if(idx === -1) throw new TypeError(`Invalid character: '${ch}'`)

    return idx
}
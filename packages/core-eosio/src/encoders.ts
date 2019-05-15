import * as Long from 'long'

export const encodeName = (name: string) => {
  if (typeof name !== 'string') {
    throw new TypeError('name parameter is a required string')
  }
  if (name.length > 12) {
    throw new TypeError('A name can be up to 12 characters long')
  }

  let bitStr = ''
  for (let i = 0; i <= 12; i++) {
    // Process all 64 bits (even if name is short)
    const c = i < name.length ? charIndex(name[i]) : 0
    const bitLen = i < 12 ? 5 : 4
    let bits = Number(c).toString(2)
    if (bits.length > bitLen) {
      throw new TypeError('Invalid name ' + name)
    }
    bits = ('0' as any).repeat(bitLen - bits.length) + bits
    bitStr += bits
  }

  const value = Long.fromString(bitStr, true, 2)

  let leHex = ''
  const bytes = value.toBytesBE()
  for (const b of bytes) {
    const n = Number(b).toString(16)
    leHex += (n.length === 1 ? '0' : '') + n
  }

  const ulName = Long.fromString(leHex, true, 16).toString()
  return ulName.toString()
}

const charMap = '.12345abcdefghijklmnopqrstuvwxyz'
function charIndex(ch: string) {
  const idx = charMap.indexOf(ch)
  if (idx === -1) {
    throw new TypeError(`Invalid character: '${ch}'`)
  }
  return idx
}

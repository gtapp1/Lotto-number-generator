import { describe, expect, it } from 'vitest'
import { generateEntry, validateEntry } from './generator'
import type { PcsoGame } from './pcso'

const superLotto: PcsoGame = {
  id: 'super-lotto-6-49',
  displayName: 'Super Lotto 6/49',
  category: 'lotto',
  picks: 6,
  min: 1,
  max: 49,
  unique: true,
  ordered: true,
  padWidth: 2,
  verificationStatus: 'confirmed',
}

const twoDLotto: PcsoGame = {
  id: '2d-lotto',
  displayName: '2D Lotto',
  category: 'digit',
  picks: 2,
  min: 1,
  max: 31,
  unique: false,
  ordered: true,
  padWidth: 2,
  verificationStatus: 'confirmed',
}

describe('generateEntry', () => {
  it('generates sorted unique values for lotto games', () => {
    const result = generateEntry(superLotto)

    expect(result.raw).toHaveLength(6)
    expect(new Set(result.raw).size).toBe(6)
    expect(result.raw.every((value) => value >= 1 && value <= 49)).toBe(true)

    const sorted = [...result.raw].sort((a, b) => a - b)
    expect(result.raw).toEqual(sorted)
  })

  it('generates in-range values for 2D game using 1..31', () => {
    const result = generateEntry(twoDLotto)

    expect(result.raw).toHaveLength(2)
    expect(result.raw.every((value) => value >= 1 && value <= 31)).toBe(true)
    expect(result.formatted.every((value) => value.length === 2)).toBe(true)
  })
})

describe('validateEntry', () => {
  it('flags duplicates for unique lotto games', () => {
    const errors = validateEntry(superLotto, [1, 2, 3, 4, 5, 5])
    expect(errors).toContain('Duplicate values found in unique game')
  })

  it('flags out-of-range values', () => {
    const errors = validateEntry(twoDLotto, [0, 50])
    expect(errors).toContain('Value out of allowed range')
  })
})

import { afterEach, describe, expect, it, vi } from 'vitest'
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
  orderMode: 'ascending',
  padWidth: 2,
  verificationStatus: 'confirmed',
}

const sixDLotto: PcsoGame = {
  id: '6d-lotto'
  ,displayName: '6D Lotto',
  category: 'digit',
  picks: 6,
  min: 0,
  max: 9,
  unique: false,
  orderMode: 'exact',
  padWidth: 1,
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
  orderMode: 'generated',
  padWidth: 2,
  verificationStatus: 'confirmed',
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('generateEntry', () => {
  it('generates unique lotto values in ascending order', () => {
    const result = generateEntry(superLotto)

    expect(result.raw).toHaveLength(6)
    expect(new Set(result.raw).size).toBe(6)
    expect(result.raw.every((value) => value >= 1 && value <= 49)).toBe(true)
    expect(result.raw).toEqual([...result.raw].sort((a, b) => a - b))
  })

  it('preserves the exact generated order for 6D lotto', () => {
    const randomValues = [0.95, 0.45, 0.01, 0.85, 0.51, 0.79]
    const randomSpy = vi.spyOn(Math, 'random')
    randomSpy.mockImplementation(() => randomValues.shift() ?? 0)

    const result = generateEntry(sixDLotto)

    expect(result.raw).toEqual([9, 4, 0, 8, 5, 7])
    expect(result.formatted).toEqual(['9', '4', '0', '8', '5', '7'])
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

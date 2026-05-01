import type { GeneratedEntry, PcsoGame } from './pcso'

const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const pickUniqueNumbers = (game: PcsoGame): number[] => {
  const pool: number[] = []

  for (let value = game.min; value <= game.max; value += 1) {
    pool.push(value)
  }

  for (let i = pool.length - 1; i > 0; i -= 1) {
    const swapIndex = randomInt(0, i)
    const temp = pool[i]
    pool[i] = pool[swapIndex]
    pool[swapIndex] = temp
  }

  return pool.slice(0, game.picks)
}

const pickWithReplacement = (game: PcsoGame): number[] => {
  const result: number[] = []

  for (let i = 0; i < game.picks; i += 1) {
    result.push(randomInt(game.min, game.max))
  }

  return result
}

const formatValue = (value: number, padWidth: number): string => {
  return value.toString().padStart(padWidth, '0')
}

export const validateEntry = (game: PcsoGame, values: number[]): string[] => {
  const errors: string[] = []

  if (values.length !== game.picks) {
    errors.push('Invalid pick count')
  }

  if (values.some((value) => value < game.min || value > game.max)) {
    errors.push('Value out of allowed range')
  }

  if (game.unique && new Set(values).size !== values.length) {
    errors.push('Duplicate values found in unique game')
  }

  if (game.orderMode === 'ascending') {
    const sorted = [...values].sort((a, b) => a - b)
    const isSorted = sorted.every((value, index) => value === values[index])

    if (!isSorted) {
      errors.push('Lotto numbers must be sorted')
    }
  }

  return errors
}

export const generateEntry = (game: PcsoGame): GeneratedEntry => {
  const generated = game.unique ? pickUniqueNumbers(game) : pickWithReplacement(game)

  const raw = game.orderMode === 'ascending' ? [...generated].sort((a, b) => a - b) : generated
  const validationErrors = validateEntry(game, raw)

  if (validationErrors.length > 0) {
    throw new Error(`Generated entry is invalid: ${validationErrors.join(', ')}`)
  }

  return {
    raw,
    formatted: raw.map((value) => formatValue(value, game.padWidth)),
    gameId: game.id,
    createdAt: new Date().toISOString(),
  }
}

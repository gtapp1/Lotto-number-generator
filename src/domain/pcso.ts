import { z } from 'zod'

export const gameSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  category: z.enum(['lotto', 'digit']),
  picks: z.number().int().positive(),
  min: z.number().int(),
  max: z.number().int(),
  unique: z.boolean(),
  orderMode: z.enum(['ascending', 'generated', 'exact']),
  padWidth: z.number().int().positive(),
  verificationStatus: z.string(),
  ruleNotes: z.array(z.string()).min(1),
})

export const pcsoConfigSchema = z.object({
  version: z.string(),
  updatedAt: z.string(),
  source: z.object({
    references: z.array(z.string()),
    notes: z.string(),
  }),
  games: z.array(gameSchema).min(1),
})

export type PcsoGame = z.infer<typeof gameSchema>
export type PcsoConfig = z.infer<typeof pcsoConfigSchema>

export type GeneratedEntry = {
  raw: number[]
  formatted: string[]
  gameId: string
  createdAt: string
}

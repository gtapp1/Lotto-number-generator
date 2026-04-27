import { pcsoConfigSchema, type PcsoConfig } from './pcso'

export const loadPcsoConfig = async (): Promise<PcsoConfig> => {
  const response = await fetch('/pcso-games.json')

  if (!response.ok) {
    throw new Error('Failed to load PCSO game configuration')
  }

  const payload: unknown = await response.json()
  const parsed = pcsoConfigSchema.safeParse(payload)

  if (!parsed.success) {
    throw new Error('PCSO configuration shape is invalid')
  }

  return parsed.data
}

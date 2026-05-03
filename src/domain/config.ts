import rawConfig from '../../config/pcso-games.json'
import { pcsoConfigSchema, type PcsoConfig } from './pcso'

export const loadPcsoConfig = async (): Promise<PcsoConfig> => {
  const parsed = pcsoConfigSchema.safeParse(rawConfig)

  if (!parsed.success) {
    throw new Error('PCSO configuration shape is invalid. Check config/pcso-games.json for required rule fields and notes.')
  }

  return parsed.data
}

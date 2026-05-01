import rawConfig from '../../config/pcso-games.json'
import { pcsoConfigSchema, type PcsoConfig } from './pcso'

export const loadPcsoConfig = async (): Promise<PcsoConfig> => {
  const parsed = pcsoConfigSchema.safeParse(rawConfig)

  if (!parsed.success) {
    throw new Error('PCSO configuration shape is invalid')
  }

  return parsed.data
}

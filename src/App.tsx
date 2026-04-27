import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { loadPcsoConfig } from './domain/config'
import { generateEntry } from './domain/generator'
import type { GeneratedEntry, PcsoConfig, PcsoGame } from './domain/pcso'
import './App.css'

function App() {
  const [config, setConfig] = useState<PcsoConfig | null>(null)
  const [configError, setConfigError] = useState<string | null>(null)
  const [selectedGameId, setSelectedGameId] = useState<string>('super-lotto-6-49')
  const [entry, setEntry] = useState<GeneratedEntry | null>(null)
  const [entryError, setEntryError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const result = await loadPcsoConfig()
        setConfig(result)

        if (!result.games.some((game) => game.id === selectedGameId)) {
          setSelectedGameId(result.games[0]?.id ?? '')
        }
      } catch (error) {
        setConfigError(error instanceof Error ? error.message : 'Unable to load game data')
      }
    }

    void load()
  }, [selectedGameId])

  const selectedGame = useMemo<PcsoGame | null>(() => {
    if (!config) {
      return null
    }

    return config.games.find((game) => game.id === selectedGameId) ?? null
  }, [config, selectedGameId])

  const handleGenerate = () => {
    if (!selectedGame) {
      return
    }

    try {
      setEntryError(null)
      const next = generateEntry(selectedGame)
      setEntry(next)
    } catch (error) {
      setEntryError(error instanceof Error ? error.message : 'Failed to generate entry')
    }
  }

  const jumpToGenerator = () => {
    const target = document.getElementById('generator-panel')
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const ruleSummary = selectedGame
    ? `${selectedGame.displayName}: pick ${selectedGame.picks} values from ${selectedGame.min} to ${selectedGame.max}${selectedGame.unique ? ', no duplicates' : ''}`
    : ''

  return (
    <div className="page-shell">
      <motion.header
        className="hero"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <p className="hero-tag">Independent PCSO-style generator</p>
        <h1>Juan-to-Six</h1>
        <p className="hero-subcopy">
          Brutalist energy, strict game rules. Generate valid entries for official PCSO game types in one click.
        </p>

        <div className="hero-actions">
          <button type="button" className="action action-primary" onClick={jumpToGenerator}>
            Generate My Numbers
          </button>
          <a className="action action-ghost" href="#game-catalog">
            View Game Matrix
          </a>
        </div>

        <p className="hero-legal">
          Not affiliated with PCSO. This app is a formatting and randomization helper only.
        </p>
      </motion.header>

      <motion.section
        id="game-catalog"
        className="catalog"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
      >
        <h2>PCSO Game Catalog</h2>
        <p className="catalog-subcopy">All games and limits are loaded from the project source-of-truth config.</p>

        <div className="chips">
          {config?.games.map((game) => (
            <motion.button
              key={game.id}
              className={`chip ${game.id === selectedGameId ? 'chip-active' : ''}`}
              type="button"
              onClick={() => setSelectedGameId(game.id)}
              whileHover={{ y: -4 }}
              whileTap={{ y: 1 }}
            >
              {game.displayName}
            </motion.button>
          ))}
        </div>
      </motion.section>

      <motion.section
        id="generator-panel"
        className="generator"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
      >
        <div className="generator-head">
          <h2>Rule-Driven Generator</h2>
          <p>{ruleSummary || 'Loading game rules...'}</p>
        </div>

        <div className="controls">
          <label htmlFor="game-select">Select game</label>
          <select
            id="game-select"
            value={selectedGameId}
            onChange={(event) => setSelectedGameId(event.target.value)}
            disabled={!config}
          >
            {config?.games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.displayName}
              </option>
            ))}
          </select>

          <button type="button" className="action action-primary" onClick={handleGenerate} disabled={!selectedGame}>
            Generate Entry
          </button>
        </div>

        <AnimatePresence mode="wait">
          {entry && selectedGame ? (
            <motion.div
              key={entry.createdAt}
              className="ticket"
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <p className="ticket-title">{selectedGame.displayName}</p>
              <div className="balls" role="list" aria-label="Generated values">
                {entry.formatted.map((value, index) => (
                  <motion.span
                    key={`${entry.createdAt}-${value}-${index}`}
                    className="ball"
                    role="listitem"
                    initial={{ opacity: 0, y: 10, rotate: -6 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {value}
                  </motion.span>
                ))}
              </div>
              <p className="ticket-meta">Generated: {new Date(entry.createdAt).toLocaleString()}</p>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              className="ticket ticket-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Tap generate to create your first entry.
            </motion.div>
          )}
        </AnimatePresence>

        {(configError || entryError) && <p className="error-msg">{configError || entryError}</p>}
      </motion.section>

      <motion.section
        className="feature-grid"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
      >
        {[
          {
            title: 'PCSO Matrix Aware',
            text: 'Every game constraint is loaded from the config and validated before display.',
          },
          {
            title: 'Neobrutal UI Language',
            text: 'Hard borders, loud accents, and tactile card motion shape the whole interface.',
          },
          {
            title: 'Motion with Discipline',
            text: 'Animations are expressive but respect reduced-motion and readability.',
          },
        ].map((item, index) => (
          <motion.article
            key={item.title}
            className="feature"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: index * 0.08 }}
          >
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </motion.article>
        ))}
      </motion.section>
    </div>
  )
}

export default App

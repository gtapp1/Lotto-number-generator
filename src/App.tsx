import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { loadPcsoConfig } from './domain/config'
import { generateEntry } from './domain/generator'
import type { GeneratedEntry, PcsoConfig, PcsoGame } from './domain/pcso'
import './App.css'

const HISTORY_STORAGE_KEY = 'juan-to-six:history:v1'
const HISTORY_LIMIT = 20
const MAX_BATCH_SIZE = 10

const heroOrnaments = [
  { className: 'ornament ornament-circle ornament-blue', label: 'decorative circle' },
  { className: 'ornament ornament-square ornament-yellow', label: 'decorative square' },
  { className: 'ornament ornament-pill ornament-orange', label: 'decorative pill' },
]

const railOrnaments = [
  { className: 'ornament ornament-diamond ornament-cyan', label: 'decorative diamond' },
  { className: 'ornament ornament-circle ornament-yellow ornament-small', label: 'decorative circle' },
  { className: 'ornament ornament-square ornament-orange ornament-small', label: 'decorative square' },
]

const getOrderLabel = (game: PcsoGame): string => {
  if (game.orderMode === 'ascending') {
    return 'Ascending display'
  }

  if (game.orderMode === 'exact') {
    return 'Exact order'
  }

  return 'Generated order'
}

const escapeCsvValue = (value: string): string => {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }

  return value
}

const formatTimestampForFile = (value: string): string => {
  return value.replace(/[:.]/g, '-').replace('T', '_').replace('Z', '')
}

const formatVerificationStatus = (status: string): string => {
  if (status === 'verified-from-pcso-draw-results') {
    return 'Verified from PCSO draw results'
  }

  if (status === 'confirmed-from-pcso-name-matrix') {
    return 'Verified from PCSO game matrix'
  }

  if (status === 'digit-rule-needs-manual-pcso-page-check') {
    return 'Manual PCSO review needed'
  }

  return status
}

const isStoredEntry = (value: unknown): value is GeneratedEntry => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const entry = value as GeneratedEntry

  return (
    Array.isArray(entry.raw) &&
    Array.isArray(entry.formatted) &&
    typeof entry.gameId === 'string' &&
    typeof entry.createdAt === 'string'
  )
}

const loadStoredHistory = (): GeneratedEntry[] => {
  const stored = localStorage.getItem(HISTORY_STORAGE_KEY)

  if (!stored) {
    return []
  }

  try {
    const parsed: unknown = JSON.parse(stored)

    if (Array.isArray(parsed)) {
      return parsed.filter(isStoredEntry).slice(0, HISTORY_LIMIT)
    }
  } catch {
    return []
  }

  return []
}

function App() {
  const [config, setConfig] = useState<PcsoConfig | null>(null)
  const [configError, setConfigError] = useState<string | null>(null)
  const [selectedGameId, setSelectedGameId] = useState<string>('super-lotto-6-49')
  const [latestBatch, setLatestBatch] = useState<GeneratedEntry[]>([])
  const [entryError, setEntryError] = useState<string | null>(null)
  const [history, setHistory] = useState<GeneratedEntry[]>(() => loadStoredHistory())
  const [batchSize, setBatchSize] = useState<number>(1)
  const [copyStatus, setCopyStatus] = useState<string | null>(null)
  const copyTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
  }, [history])

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current)
      }
    }
  }, [])

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

  const sessionStats = useMemo(() => {
    const uniqueGames = new Set(history.map((item) => item.gameId))
    const latestHistory = history[0] ?? null

    return {
      generatedCount: history.length,
      gameCount: uniqueGames.size,
      latestHistory,
    }
  }, [history])

  const gameNameMap = useMemo(() => {
    const map = new Map<string, string>()
    config?.games.forEach((game) => map.set(game.id, game.displayName))
    return map
  }, [config])

  const getGameLabel = (gameId: string): string => {
    return gameNameMap.get(gameId) ?? gameId
  }

  const formatEntryText = (target: GeneratedEntry): string => {
    return `${getGameLabel(target.gameId)}: ${target.formatted.join(' ')}`
  }

  const exportHistoryToCsv = () => {
    if (history.length === 0) {
      showCopyStatus('No history to export yet.')
      return
    }

    const rows = [
      ['Created At', 'Game', 'Numbers', 'Raw Numbers'],
      ...history.map((item) => [
        new Date(item.createdAt).toLocaleString(),
        getGameLabel(item.gameId),
        item.formatted.join(' '),
        item.raw.join(' '),
      ]),
    ]

    const csv = rows
      .map((row) => row.map((cell) => escapeCsvValue(cell)).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    const fileStamp = formatTimestampForFile(new Date().toISOString())

    anchor.href = url
    anchor.download = `juan-to-six-history-${fileStamp}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
    showCopyStatus('CSV history exported.')
  }

  const handlePrintBatch = () => {
    window.print()
  }

  const showCopyStatus = (message: string) => {
    setCopyStatus(message)

    if (copyTimeoutRef.current !== null) {
      window.clearTimeout(copyTimeoutRef.current)
    }

    copyTimeoutRef.current = window.setTimeout(() => {
      setCopyStatus(null)
    }, 2200)
  }

  const handleCopy = async (target: GeneratedEntry) => {
    if (!navigator.clipboard?.writeText) {
      showCopyStatus('Clipboard access is unavailable in this browser.')
      return
    }

    try {
      await navigator.clipboard.writeText(formatEntryText(target))
      showCopyStatus('Copied to clipboard.')
    } catch {
      showCopyStatus('Copy failed. Try again.')
    }
  }

  const handleShare = async (target: GeneratedEntry) => {
    const payload = {
      title: 'Juan-to-Six Quick Pick',
      text: formatEntryText(target),
    }

    if (navigator.share) {
      try {
        await navigator.share(payload)
        showCopyStatus('Share sheet opened.')
        return
      } catch {
        showCopyStatus('Share was cancelled or failed.')
        return
      }
    }

    await handleCopy(target)
  }

  const clampBatchSize = (value: number): number => {
    return Math.min(MAX_BATCH_SIZE, Math.max(1, Math.floor(value)))
  }

  const handleGenerate = (count: number = batchSize) => {
    if (!selectedGame) {
      return
    }

    try {
      setEntryError(null)
      const safeCount = clampBatchSize(count)
      const generated: GeneratedEntry[] = []

      for (let i = 0; i < safeCount; i += 1) {
        generated.push(generateEntry(selectedGame))
      }

      const ordered = [...generated].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      setLatestBatch(generated)
      setHistory((prev) => [...ordered, ...prev].slice(0, HISTORY_LIMIT))
      setBatchSize(safeCount)
    } catch (error) {
      setEntryError(error instanceof Error ? error.message : 'Failed to generate entry')
    }
  }

  const handleBatchSizeChange = (value: string) => {
    const parsed = Number.parseInt(value, 10)

    if (Number.isNaN(parsed)) {
      setBatchSize(1)
      return
    }

    setBatchSize(clampBatchSize(parsed))
  }

  const clearHistory = () => {
    setHistory([])
  }

  const jumpToGenerator = () => {
    const target = document.getElementById('generator-panel')
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const ruleSummary = selectedGame
    ? `${selectedGame.displayName}: random picks from ${selectedGame.min} to ${selectedGame.max}${selectedGame.unique ? ', no duplicates' : ''}, ${getOrderLabel(selectedGame).toLowerCase()}`
    : ''

  const selectedGameFacts = selectedGame
    ? [
        { label: 'Pick count', value: selectedGame.picks.toString() },
        { label: 'Range', value: `${selectedGame.min} to ${selectedGame.max}` },
        { label: 'Unique', value: selectedGame.unique ? 'Yes' : 'No' },
        { label: 'Display order', value: getOrderLabel(selectedGame) },
        { label: 'Verification', value: formatVerificationStatus(selectedGame.verificationStatus) },
      ]
    : []

  return (
    <div className="page-shell">
      <motion.header
        className="hero"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="ornament-group ornament-group-hero" aria-hidden="true">
          {heroOrnaments.map((ornament, index) => (
            <motion.span
              key={ornament.label}
              className={ornament.className}
              initial={{ opacity: 0, scale: 0.88, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: index % 2 === 0 ? 8 : -6 }}
              transition={{ duration: 0.7, delay: index * 0.08 }}
            />
          ))}
        </div>
        <p className="hero-tag">Independent PCSO-style generator</p>
        <h1>Juan-to-Six</h1>
        <p className="hero-subcopy">
          Random pick generation for PCSO-style games, with valid ranges, correct counts, and local history in one place.
        </p>

        <div className="hero-pills" aria-label="Core behaviors">
          <span className="hero-pill">Random selection</span>
          <span className="hero-pill">Ascending lotto display</span>
          <span className="hero-pill">Browser-local history</span>
        </div>

        <div className="hero-actions">
          <button type="button" className="action action-primary" onClick={jumpToGenerator}>
            Generate a Slip
          </button>
          <a className="action action-ghost" href="#game-catalog">
            Browse Game Rules
          </a>
        </div>

        <p className="hero-legal">
          Independent utility. Not an official PCSO service.
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
        <p className="catalog-subcopy">Each game card comes from the canonical config used by the generator.</p>

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

      <div className="dashboard-grid">
        <motion.aside
          className="side-rail side-rail-left"
          initial={{ opacity: 0, x: -18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        >
          <section className="rail-card rail-card-accent">
            <div className="ornament-group ornament-group-rail" aria-hidden="true">
              {railOrnaments.map((ornament, index) => (
                <motion.span
                  key={ornament.label}
                  className={ornament.className}
                  initial={{ opacity: 0, y: 8, rotate: -10 }}
                  whileInView={{ opacity: 1, y: 0, rotate: index % 2 === 0 ? 10 : -8 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.6, delay: index * 0.06 }}
                />
              ))}
            </div>
            <p className="rail-kicker">Rule sheet</p>
            <h2>{selectedGame?.displayName ?? 'Choose a game'}</h2>
            <p className="rail-copy">
              {ruleSummary || 'Pick a game to reveal its rule sheet and output format.'}
            </p>
            {selectedGame && (
              <dl className="fact-list">
                {selectedGameFacts.map((item) => (
                  <div key={item.label} className="fact-row">
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {selectedGame && (
              <div className="rule-notes">
                <p className="rule-notes-kicker">Rule notes</p>
                <ul className="rule-notes-list">
                  {selectedGame.ruleNotes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className="rail-card">
            <p className="rail-kicker">How it works</p>
            <ul className="rail-list">
              <li>6/x lotto games are randomized, then shown in ascending order.</li>
              <li>6D keeps the exact order of the generated digits.</li>
              <li>4D, 3D, and 2D keep their generated digit sequence and padding rules.</li>
              <li>All rules come from the canonical config file.</li>
            </ul>
          </section>
        </motion.aside>

        <main className="center-stack">
          <motion.section
            id="generator-panel"
            className="generator"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <div className="generator-head">
              <h2>Random Slip Generator</h2>
              <p>{ruleSummary || 'Choose a game to load its rule sheet.'}</p>
            </div>

            {selectedGame && (
              <div className="generator-status">
                <span className={`status-pill status-pill-${selectedGame.verificationStatus.includes('manual') ? 'warning' : 'verified'}`}>
                  {formatVerificationStatus(selectedGame.verificationStatus)}
                </span>
                <p>
                  {selectedGame.verificationStatus === 'verified-from-pcso-draw-results'
                    ? 'Digit rules were checked against PCSO draw-result listings and kept as sequence-based outputs.'
                    : 'This game uses the canonical matrix config and the generator validates the output before display.'}
                </p>
              </div>
            )}

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

              <button
                type="button"
                className="action action-primary"
                onClick={() => handleGenerate(batchSize)}
                disabled={!selectedGame}
              >
                {batchSize > 1 ? `Generate ${batchSize}` : 'Generate Entry'}
              </button>
            </div>

            <div className="batch-panel">
              <div>
                <h3>Batch mode</h3>
                <p>Generate up to {MAX_BATCH_SIZE} slips at once and save them locally.</p>
              </div>
              <div className="batch-actions">
                <div className="batch-field">
                  <label htmlFor="batch-size">Batch size</label>
                  <input
                    id="batch-size"
                    type="number"
                    min={1}
                    max={MAX_BATCH_SIZE}
                    value={batchSize}
                    onChange={(event) => handleBatchSizeChange(event.target.value)}
                  />
                </div>
                <div className="batch-buttons">
                  {[1, 5, 10].map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`action ${batchSize === size ? 'action-primary' : ''}`}
                      onClick={() => handleGenerate(size)}
                      disabled={!selectedGame}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="batch-summary">
              {latestBatch.length > 0 ? (
                <>
                  <div>
                    <p className="batch-summary-kicker">Latest batch</p>
                    <p className="batch-summary-text">Use the print action to open a clean layout for this batch.</p>
                  </div>
                  <button type="button" className="action action-ghost" onClick={handlePrintBatch}>
                    Print batch
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <p className="batch-summary-kicker">Before you generate</p>
                    <p className="batch-summary-text">Pick a game, choose a batch size, and generate a fresh slip set.</p>
                  </div>
                  <button type="button" className="action action-ghost" onClick={jumpToGenerator}>
                    Jump to generator
                  </button>
                </>
              )}
            </div>

            {latestBatch.length > 0 ? (
              <div className="ticket-grid" role="list" aria-label="Generated entries">
                {latestBatch.map((item, index) => (
                  <motion.div
                    key={`${item.createdAt}-${item.gameId}-${index}`}
                    className="ticket"
                    role="listitem"
                    initial={{ opacity: 0, scale: 0.96, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut', delay: index * 0.05 }}
                  >
                    <div className="ticket-head">
                      <p className="ticket-title">{getGameLabel(item.gameId)}</p>
                      {latestBatch.length > 1 && (
                        <span className="ticket-tag">
                          Set {index + 1} / {latestBatch.length}
                        </span>
                      )}
                    </div>
                    <div className="balls" role="list" aria-label="Generated values">
                      {item.formatted.map((value, valueIndex) => (
                        <motion.span
                          key={`${item.createdAt}-${value}-${valueIndex}`}
                          className="ball"
                          role="listitem"
                          initial={{ opacity: 0, y: 10, rotate: -6 }}
                          animate={{ opacity: 1, y: 0, rotate: 0 }}
                          transition={{ delay: valueIndex * 0.05 }}
                        >
                          {value}
                        </motion.span>
                      ))}
                    </div>
                    <p className="ticket-meta">Generated: {new Date(item.createdAt).toLocaleString()}</p>
                    <div className="ticket-actions">
                      <button type="button" className="action action-ghost" onClick={() => handleCopy(item)}>
                        Copy
                      </button>
                      <button type="button" className="action" onClick={() => handleShare(item)}>
                        Share
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                key="empty"
                className="ticket ticket-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="ticket-empty-title">No batch generated yet.</p>
                <p className="ticket-empty-copy">Select a game and generate a batch to preview the slips here.</p>
              </motion.div>
            )}

            <div className="history-panel">
              <div className="history-head">
                <div>
                  <h3>Slip history</h3>
                  <p className="history-subcopy">Saved in this browser only.</p>
                </div>
                <div className="history-actions-row">
                  <button
                    type="button"
                    className="action action-ghost"
                    onClick={exportHistoryToCsv}
                    disabled={history.length === 0}
                  >
                    Export CSV
                  </button>
                  <button
                    type="button"
                    className="action action-ghost"
                    onClick={clearHistory}
                    disabled={history.length === 0}
                  >
                    Clear history
                  </button>
                </div>
              </div>

              {history.length === 0 ? (
                <div className="history-empty-card">
                  <p className="history-empty-title">History is empty for now.</p>
                  <p className="history-empty-copy">
                    Generated slips will stay here on this device, ready to export or copy later.
                  </p>
                </div>
              ) : (
                <ul className="history-list">
                  {history.map((item, index) => (
                    <li key={`${item.createdAt}-${item.gameId}-${index}`} className="history-item">
                      <p className="history-title">{getGameLabel(item.gameId)}</p>
                      <p className="history-numbers">{item.formatted.join(' ')}</p>
                      <p className="history-meta">{new Date(item.createdAt).toLocaleString()}</p>
                      <div className="history-actions">
                        <button type="button" className="action action-ghost" onClick={() => handleCopy(item)}>
                          Copy
                        </button>
                        <button type="button" className="action" onClick={() => handleShare(item)}>
                          Share
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {copyStatus && <p className="copy-status">{copyStatus}</p>}

            {(configError || entryError) && <p className="error-msg">{configError || entryError}</p>}
          </motion.section>
        </main>

        <motion.aside
          className="side-rail side-rail-right"
          initial={{ opacity: 0, x: 18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        >
          <section className="rail-card rail-card-accent">
            <div className="ornament-group ornament-group-rail" aria-hidden="true">
              {railOrnaments.map((ornament, index) => (
                <motion.span
                  key={`${ornament.label}-stats`}
                  className={ornament.className}
                  initial={{ opacity: 0, y: 8, rotate: 8 }}
                  whileInView={{ opacity: 1, y: 0, rotate: index % 2 === 0 ? -10 : 8 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.6, delay: index * 0.06 }}
                />
              ))}
            </div>
            <p className="rail-kicker">Session stats</p>
            <div className="stat-stack">
              <div className="stat-item">
                <span className="stat-value">{sessionStats.generatedCount}</span>
                <span className="stat-label">Slips generated</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{sessionStats.gameCount}</span>
                <span className="stat-label">Games used</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{MAX_BATCH_SIZE}</span>
                <span className="stat-label">Batch cap</span>
              </div>
            </div>
          </section>

          <section className="rail-card">
            <p className="rail-kicker">Latest slip</p>
            {sessionStats.latestHistory ? (
              <>
                <h3>{getGameLabel(sessionStats.latestHistory.gameId)}</h3>
                <p className="rail-copy rail-mono">{sessionStats.latestHistory.formatted.join(' ')}</p>
                <p className="rail-copy rail-muted">
                  {new Date(sessionStats.latestHistory.createdAt).toLocaleString()}
                </p>
              </>
            ) : (
              <p className="rail-copy">No slip has been generated yet. Use the center panel to start.</p>
            )}
          </section>

          <section className="rail-card">
            <p className="rail-kicker">Fast actions</p>
            <div className="quick-actions">
              <button type="button" className="action action-primary" onClick={() => handleGenerate(5)} disabled={!selectedGame}>
                Generate 5
              </button>
              <button type="button" className="action" onClick={() => handleGenerate(10)} disabled={!selectedGame}>
                Generate 10
              </button>
              <button
                type="button"
                className="action action-ghost"
                onClick={() => latestBatch[0] && handleCopy(latestBatch[0])}
                disabled={latestBatch.length === 0}
              >
                Copy latest
              </button>
            </div>
          </section>
        </motion.aside>
      </div>

      <motion.section
        className="feature-grid"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
      >
        {[
          {
            title: 'Catalog first',
            text: 'Every game, range, and pick count comes from the same canonical config file.',
          },
          {
            title: 'Ascending lotto output',
            text: 'Lotto slips are randomized, then presented in a clean ascending display.',
          },
          {
            title: 'Local session memory',
            text: 'Recent slips stay in this browser so the generator feels continuous.',
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

      <footer className="page-footer">
        <span>Juan-to-Six v{__APP_VERSION__}</span>
        <span>Random slips, local history, rule-locked output</span>
      </footer>

      <div className="print-header" aria-hidden="true">
        <h1>Juan-to-Six</h1>
        <p>Printable slip batch export</p>
      </div>
    </div>
  )
}

export default App

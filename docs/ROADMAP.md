# Juan-to-Six Roadmap

This document tracks future phases and planned updates for the Juan-to-Six PCSO lotto generator. It is intended to preserve context across chats and handoffs.

## Release Phases

### Phase 1.1 (Quick Wins) - Complete
- Batch generation (1/5/10) with grid display.
- Local history (last 20 entries) with clear action.
- Copy/share actions for each entry.
- Version display in the footer.

### Phase 1.2 (Quality + UX) - Complete
- Export history to CSV.
- Print-friendly view for generated batches.
- Optional compact layout for mobile batch grids.
- Empty-state improvements (history + generator).

### Phase 1.3 (Rules + Validation)
- Manual verification of digit-game rules from PCSO sources.
- Add game-specific rule notes to config (if needed).
- Config validation messaging improvements for users.

### Phase 2.0 (Data + Insights)
- Winning numbers integration (API or manual upload).
- Match checker for saved entries.
- Session frequency stats (per game and per number).

### Phase 3.0 (Platform)
- Progressive Web App (offline support + install prompt).
- Multi-language UI (English/Tagalog).
- Optional backend for saved profiles and history sync.

## Backlog Ideas
- Draw schedule reminders (calendar export).
- Theme toggle (alternate colorways).
- QR or shareable link for a generated set.
- Admin panel for config updates (optional backend).

## Open Questions
- Which sources should be used for official winning numbers?
- Should history be global or per game?

## Notes
- Keep `config/pcso-games.json` as the source of truth for game rules.
- Lotto output is sorted ascending; 6D Lotto is marked exact order; other digit games keep generated order.
- Update this roadmap whenever a phase is completed or reprioritized.

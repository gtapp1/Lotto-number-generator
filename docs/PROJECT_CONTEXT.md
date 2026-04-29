# PROJECT_CONTEXT

## Core Idea

Build a complete PCSO-style number generator, not a generic random picker.

The generator must enforce each game's exact structure:

- how many values are generated
- valid value range per game
- uniqueness rules
- ordering and display format

## Important Domain Clarification

For games written as "6/49", "6/58", etc.:

- the first number (6) means how many numbers are picked
- the second number (49, 58, etc.) is the max ball number
- valid range is 1 to max (example: Super Lotto 6/49 => 1..49), not 6..49

## Official References

Primary references used to lock scope:

- https://www.pcso.gov.ph/SearchLottoResult.aspx
- https://www.pcso.gov.ph/Games/ScheduleOfDrawsAndHorseRaces.aspx

Notes:

- Some PCSO pages are anti-bot protected, so this repo stores a local game catalog in `config/pcso-games.json`.
- When official game rules change, update the local catalog and version the change.

## Canonical Game Catalog (V1)

The following games are in the current product scope:

1. Ultra Lotto 6/58
2. Grand Lotto 6/55
3. Super Lotto 6/49
4. Mega Lotto 6/45
5. Lotto 6/42
6. 6D Lotto
7. 4D Lotto
8. 3D Lotto
9. 2D Lotto

## Rule Model

Each game in the catalog must define:

- id
- displayName
- category (lotto | digit)
- picks
- min
- max
- unique
- ordered
- padWidth
- verificationStatus

## Product Constraints

- Never generate values outside allowed range.
- Never generate duplicate values for 6/x lotto games.
- Keep output format consistent per game.
- Use a single generator engine reading from the game catalog.
- No hardcoded game logic in UI components.

## UX Direction

- Bold creative landing page
- Neobrutalist visual language
- Motion-driven section transitions and generator reveal
- Accessibility and clarity preserved despite visual intensity

## Success Criteria

- A user can pick any scoped PCSO game and generate a valid entry in one click.
- Every generated entry passes rule validation from the same source-of-truth config.
- UI clearly explains each game rule before generation.

## Planning Reference

Future phases, upgrades, and backlog items are tracked in [docs/ROADMAP.md](docs/ROADMAP.md). Update that file whenever the product plan changes so the current direction stays available even if the chat history is lost.

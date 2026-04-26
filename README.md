# Juan-to-Six: PCSO Lotto Number Generator

Juan-to-Six is a PCSO-based lotto number generator web app.

The goal is not a generic randomizer. The app must generate entries using the same game structure used by PCSO games (pick count, number range, and formatting per game).

## Product Context

- Primary use case: generate valid number sets per selected PCSO game.
- Example: Super Lotto 6/49 generates exactly 6 unique numbers from 1 to 49.
- Game rules are centralized in a source-of-truth config so logic and UI stay consistent.
- The app focuses on game-rule correctness first, then visual experience.

## Official Source Reference

The game catalog is based on PCSO pages:

- Search Results page (game list visibility):
	https://www.pcso.gov.ph/SearchLottoResult.aspx
- Schedule and Lotto game navigation:
	https://www.pcso.gov.ph/Games/ScheduleOfDrawsAndHorseRaces.aspx

Because parts of the PCSO site are bot-protected, this project keeps a local source-of-truth file that can be updated when PCSO changes games or mechanics.

## Scope

The generator supports the core PCSO Lotto game list currently visible from official navigation:

- Ultra Lotto 6/58
- Grand Lotto 6/55
- Super Lotto 6/49
- Mega Lotto 6/45
- Lotto 6/42
- 6D Lotto
- 4D Lotto
- 3D Lotto
- 2D Lotto

Rules are documented in:

- `config/pcso-games.json`
- `docs/PROJECT_CONTEXT.md`
- `docs/WORKFLOWS.md`
- `docs/TECH_STACK_DECISION.md`

## Non-Goals

- This project is not affiliated with PCSO.
- This project does not publish or predict official draw outcomes.
- This project does not replace official PCSO rules or announcements.

## Implementation Direction

- Build a bold, motion-forward landing page with neobrutalism influence.
- Keep generation logic deterministic in shape (correct length/range), but random in output values.
- Add accessibility and performance checks early as part of the workflow.

## Next Step

After context lock, implementation starts with:

1. frontend scaffold
2. game-rule engine from `config/pcso-games.json`
3. UI game selector + generator panel
4. validation and test coverage for game constraints

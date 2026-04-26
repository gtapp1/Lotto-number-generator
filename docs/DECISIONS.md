# DECISIONS

## Locked Decisions

1. This app is a PCSO-structured generator, not a generic random number tool.
2. All generation rules come from `config/pcso-games.json`.
3. No UI component should hardcode game constraints.
4. 6/x lotto games generate 6 unique values from 1..x and display as 2-digit tokens.
5. The project uses a local source-of-truth because parts of PCSO pages are anti-bot protected.
6. 2D Lotto range is set to 1..31 for V1.
7. Digit games (2D/3D/4D/6D) preserve generated order.
8. V1 stack is React + Vite + TypeScript (see `docs/TECH_STACK_DECISION.md`).

## Open Questions To Confirm Before Full Build

1. Include draw schedule metadata in UI now or later.
2. Include non-lotto products (for example STL) in scope or keep lotto-only app.

## Naming

- Product working title: Juan-to-Six
- Repository: Lotto-number-generator

## Product Honesty

The app must include a clear notice that it is independent and not an official PCSO service.

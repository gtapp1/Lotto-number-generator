# TECH_STACK_DECISION

## Decision Summary

Chosen stack for Juan-to-Six:

- React 19
- Vite 7
- TypeScript 5 (strict mode)
- CSS (custom tokens and component-level styles)
- Motion for React (`motion`) for high-impact animation choreography
- Vitest + React Testing Library for unit/component tests
- Playwright for end-to-end regression tests
- ESLint + Prettier for code quality

## Why This Stack

This product is a highly interactive frontend with strict game-rule logic and bold visual identity. It does not require server-rendered data on first release.

React + Vite fits best because:

1. Fast iteration loop
   - Vite is optimized for near-instant dev startup and fast HMR.
2. Strong UI composition model
   - React component architecture is ideal for reusable game cards, generator modules, and animated sections.
3. Controlled complexity
   - Next.js is powerful but adds routing and server conventions we do not need for V1.
4. Smooth animation path
   - Motion integrates naturally with React state-driven UI.
5. Excellent testing fit
   - Vitest is Vite-native and lightweight for rapid iteration.

## Evidence Snapshot

- Vite docs describe fast dev server behavior with ESM + HMR and optimized production builds.
- Next.js docs position Next as a full-stack framework with server rendering and route conventions.
- Motion docs emphasize React-native animation API with production performance and progressive complexity.
- Vitest docs show Vite-powered test setup and direct reuse of Vite config.

## Option Comparison

### Option A: React + Vite (Selected)

Pros:

- Fast local development and rebuild loop
- Minimal framework overhead for a frontend-first product
- Easier custom visual architecture for neobrutalist style
- Cleaner separation of game-rule engine from UI

Cons:

- No built-in server routes (add backend later if needed)
- SEO requires basic static optimization strategy instead of framework-level SSR defaults

### Option B: Next.js (Not selected for V1)

Pros:

- Built-in SSR/SSG and API routes
- Great for content-heavy SEO-driven sites and backend integration

Cons:

- Adds server/client mental model overhead for this phase
- Slower to move on a design-heavy MVP where most value is client-side interaction

## V1 Architecture

- `config/pcso-games.json`: source-of-truth game constraints
- `src/domain/generator/*`: generation and validation engine
- `src/features/generator/*`: game selection + output UI
- `src/features/landing/*`: hero and storytelling sections
- `src/styles/*`: tokens, global styles, component styles

## Library Choices and Roles

- `react`, `react-dom`: app runtime
- `motion`: section transitions, reveal animations, card interactions
- `zod`: runtime validation for game config and generated outputs
- `vitest`, `@testing-library/react`, `@testing-library/jest-dom`: core tests
- `playwright`: browser-level verification of critical flows

## Performance and Accessibility Guardrails

- Prefer CSS transitions for simple interactions.
- Use Motion for high-impact choreography only.
- Respect `prefers-reduced-motion` for all animated flows.
- Keep first-load payload lean; avoid large UI frameworks.

## Security and Integrity Notes

- V1 can be frontend-only because generation is local and non-sensitive.
- If live draw ingestion is added, move network fetch and normalization to backend.
- Never present generated numbers as official PCSO results.

## Final Recommendation

Proceed with React + Vite + TypeScript for V1.

Re-evaluate Next.js only if we add:

- heavy SEO content requirements,
- authenticated user dashboards,
- server-side data orchestration, or
- backend-heavy features tightly coupled to routes.

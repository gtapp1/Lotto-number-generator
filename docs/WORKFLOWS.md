# WORKFLOWS

## 1) Scope Lock Workflow

1. Confirm game list against PCSO references.
2. Update `config/pcso-games.json` only if official changes are confirmed.
3. Record what changed and why in commit message.

Output: one canonical, reviewable game catalog.

## 2) Rule-Driven Generation Workflow

1. User selects a game.
2. UI reads rule object from `config/pcso-games.json`.
3. Generator engine creates values using only that rule object.
4. Validator rechecks the generated output before display.

Output: every shown ticket is valid for the selected game.

## 3) Validation Workflow

For each generated entry, run these checks:

- count check: length equals `picks`
- range check: every value is between `min` and `max`
- uniqueness check: enforce when `unique=true`
- ordering check: enforce when `ordered=true`
- formatting check: zero-padding by `padWidth` when defined

Output: pass/fail result with reason codes.

## 4) UI Workflow

1. User lands on hero section with game-aware messaging.
2. User selects game card or dropdown.
3. User clicks generate.
4. Result animates in with clear labels and rule summary.
5. Optional: regenerate and copy result.

Output: fast and understandable interaction loop.

## 5) Security and Integrity Workflow

1. Keep generation logic client-safe and deterministic in constraints.
2. Never claim official draw affiliation or predictions.
3. If backend is added later, rate limit generate endpoints.
4. Log only aggregate usage metrics (no sensitive user data by default).

Output: low-risk architecture with honest product framing.

## 6) Accessibility Workflow

1. Ensure keyboard navigation for all controls.
2. Keep color contrast readable under bold theme choices.
3. Respect reduced-motion preference.
4. Keep heading structure and labels semantic.

Output: visually bold but usable interface.

## 7) Performance Workflow

1. Keep generator calculations small and synchronous.
2. Avoid heavy animation libraries unless needed.
3. Use CSS-first animations with reduced-motion fallback.
4. Budget LCP and JS payload from first commit.

Output: motion-rich page without sluggish startup.

## Definition of Done (Per Feature)

- Reads game constraints from source-of-truth config
- Includes validation tests for at least one valid and one invalid case
- Works on desktop and mobile
- Includes accessibility sanity checks
- Includes clear user-facing rule text

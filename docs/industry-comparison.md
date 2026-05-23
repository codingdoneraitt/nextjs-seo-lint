# Industry Comparison

This repo was checked against established lint/plugin projects:

- `jsx-eslint/eslint-plugin-react`
- `jsx-eslint/eslint-plugin-jsx-a11y`
- `typescript-eslint/typescript-eslint`
- `vercel/next.js`

## Practices Adopted

- RuleTester-based rule tests with valid and invalid examples.
- Per-rule documentation under `docs/rules`.
- Package export validation with `publint` and `arethetypeswrong`.
- CI coverage across Node versions and ESLint 8/9 compatibility.
- Pre-commit formatting/linting with Husky and lint-staged.
- Changesets-based release workflow.
- Issue templates for bug reports and rule requests.

## Later Candidates

- Generated rule table checks so README and plugin exports cannot drift.
- Coverage thresholds once rule behavior stabilizes.
- More parser compatibility tests if the plugin supports non-TypeScript parsers later.
- A docs website when rule docs grow beyond Markdown.

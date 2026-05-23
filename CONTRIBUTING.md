# Contributing

## Local Setup

```bash
npm install
npm run check
```

## Quality Bar

Every change should keep these passing:

- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm test`
- `npm run audit`

Rule changes should include focused tests that show both the failing and accepted Next.js pattern.

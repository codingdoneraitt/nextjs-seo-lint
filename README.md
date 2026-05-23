<p align="center">
  <img src="./assets/seo-lint-next-icon-512.png" width="132" height="132" alt="seo-lint-next icon">
</p>

<h1 align="center">seo-lint-next</h1>

<p align="center">
  Build-time, App Router-aware SEO linting for Next.js metadata.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/seo-lint-next"><img alt="npm" src="https://img.shields.io/npm/v/seo-lint-next?color=0f766e"></a>
  <img alt="node" src="https://img.shields.io/badge/node-%3E%3D18.18-0f766e">
  <img alt="eslint" src="https://img.shields.io/badge/eslint-8.57%2B%20%7C%209-4b32c3">
  <img alt="license" src="https://img.shields.io/badge/license-MIT-111827">
</p>

`seo-lint-next` catches the SEO bugs that usually escape to production: missing titles, broken canonicals, unsafe `metadataBase`, bad OG tags, accidental `noindex`, sitemap gaps, invalid JSON-LD, heading skips, weak image alt text, broken locale metadata, bad App Router patterns, and crawl-blocking config.

## Install

```bash
npm install --save-dev seo-lint-next
```

Requires Node.js 18.18+ and works with ESLint 8.57+ or 9.

## ESLint

```js
// eslint.config.mjs
import seoLint from 'seo-lint-next/eslint'

export default [...seoLint.configs.recommended]
```

## CLI

```bash
npx seo-lint-next
npx seo-lint-next --dir src/app
npx seo-lint-next --format json
npx seo-lint-next --strict
```

## Rule Set

| Rule                                     | Default | Catches                                                          |
| ---------------------------------------- | ------: | ---------------------------------------------------------------- |
| `no-missing-title`                       |   error | Missing, empty, duplicate, or weak dynamic titles                |
| `no-missing-metadata-base`               |   error | Missing, localhost, or non-HTTPS root `metadataBase`             |
| `no-missing-description`                 |    warn | Missing, duplicate, too short, or too long descriptions          |
| `no-missing-canonical`                   |   error | Missing canonicals and hardcoded dynamic-route canonicals        |
| `no-missing-og-tags`                     |    warn | Missing Open Graph/Twitter tags                                  |
| `no-broken-heading-hierarchy`            |    warn | Missing/multiple H1s and skipped heading levels                  |
| `no-img-missing-alt`                     |    warn | Raw `<img>`, missing/generic alt text, layout-shifting images    |
| `no-accidental-noindex`                  |   error | Public `noindex`, blanket robots blocks, risky X-Robots headers  |
| `no-missing-sitemap`                     |    warn | Missing sitemap, relative URLs, missing robots sitemap reference |
| `no-invalid-json-ld`                     |   error | Invalid JSON-LD syntax, bad context, missing schema fields       |
| `no-missing-lang-attribute`              |   error | Missing or invalid `<html lang>` in App Router layouts           |
| `no-missing-viewport`                    |   error | Broken viewport overrides and disabled user zoom                 |
| `no-use-client-on-page`                  |    warn | Top-level client pages and ignored metadata exports              |
| `no-missing-hreflang`                    |    warn | Locale routes without `alternates.languages`                     |
| `no-generic-anchor-text`                 |    warn | Empty or generic link text                                       |
| `no-missing-404-page`                    |    warn | Missing or weak `app/not-found.tsx` recovery pages               |
| `no-missing-og-image-dimensions`         |    warn | OG images without width, height, or alt text                     |
| `no-blocking-next-static`                |   error | Robots rules blocking `/_next/` rendering assets                 |
| `no-missing-breadcrumb-schema`           |    warn | Deep pages without `BreadcrumbList` JSON-LD                      |
| `no-title-in-pages-head`                 |   error | `next/head` metadata patterns inside `app/`                      |
| `no-dynamic-import-ssr-false-on-content` |    warn | `dynamic(..., { ssr: false })` around likely content             |
| `no-missing-next-font`                   |    warn | External Google Fonts instead of `next/font`                     |
| `no-redirect-chain-in-next-config`       |    warn | Redirect chains and temporary redirects in `next.config`         |
| `no-missing-article-dates`               |    warn | Article pages missing freshness metadata                         |
| `no-missing-error-boundary-metadata`     |    warn | Missing error boundaries or weak recovery links                  |

## Configuration

```js
import seoLint from 'seo-lint-next/eslint'

export default [
  ...seoLint.configs.recommended,
  {
    rules: {
      'seo-lint-next/no-missing-description': ['warn', { descriptionLength: { min: 120, max: 160 } }],
      'seo-lint-next/no-accidental-noindex': [
        'error',
        { privateRoutes: ['/admin', '/api', '/auth', '/private'] },
      ],
    },
  },
]
```

## CI

```yaml
- run: npm ci
- run: npm run check
```

The package has no production bundle impact. It statically inspects App Router source files, JSX, `metadata` exports, `generateMetadata()` returns, `next.config.*`, `app/robots.ts`, `public/robots.txt`, and `app/sitemap.ts`.

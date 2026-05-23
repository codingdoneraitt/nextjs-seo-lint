# Changelog

## 0.2.2

### Patch Changes

- 1e01b27: Treat private routes nested under locale segments or route groups as private, and skip hreflang checks for those private routes.

## 0.2.1

### Patch Changes

- 914c840: Avoid false positives for links whose accessible text is provided by dynamic JSX expressions.

## 0.2.0

### Minor Changes

- 7c9eba8: Add rules 11-25 covering language, viewport, client pages, hreflang, anchor text, 404/error boundaries, OG image dimensions, robots access to Next.js assets, breadcrumbs, next/head usage, SSR-disabled dynamic imports, next/font, redirect chains, and article dates.

### Patch Changes

- 9e63161: Reduce false positives from real Next.js App Router projects by treating dynamic metadata as present, skipping private/noindex pages for public SEO rules, recognizing JSON-LD wrapper components, and avoiding metadata asset `X-Robots-Tag` warnings.

## 0.1.0

- Initial v1 package with the ESLint plugin, standalone CLI, and 10 App Router SEO rules.

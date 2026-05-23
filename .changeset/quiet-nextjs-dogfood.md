---
'seo-lint-next': patch
---

Reduce false positives from real Next.js App Router projects by treating dynamic metadata as present, skipping private/noindex pages for public SEO rules, recognizing JSON-LD wrapper components, and avoiding metadata asset `X-Robots-Tag` warnings.

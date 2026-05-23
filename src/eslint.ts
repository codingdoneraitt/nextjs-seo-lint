import { noAccidentalNoindex } from './rules/no-accidental-noindex'
import { noBrokenHeadingHierarchy } from './rules/no-broken-heading-hierarchy'
import { noImgMissingAlt } from './rules/no-img-missing-alt'
import { noInvalidJsonLd } from './rules/no-invalid-json-ld'
import { noMissingCanonical } from './rules/no-missing-canonical'
import { noMissingDescription } from './rules/no-missing-description'
import { noMissingMetadataBase } from './rules/no-missing-metadata-base'
import { noMissingOgTags } from './rules/no-missing-og-tags'
import { noMissingSitemap } from './rules/no-missing-sitemap'
import { noMissingTitle } from './rules/no-missing-title'

const rules = {
  'no-missing-title': noMissingTitle,
  'no-missing-metadata-base': noMissingMetadataBase,
  'no-missing-description': noMissingDescription,
  'no-missing-canonical': noMissingCanonical,
  'no-missing-og-tags': noMissingOgTags,
  'no-broken-heading-hierarchy': noBrokenHeadingHierarchy,
  'no-img-missing-alt': noImgMissingAlt,
  'no-accidental-noindex': noAccidentalNoindex,
  'no-missing-sitemap': noMissingSitemap,
  'no-invalid-json-ld': noInvalidJsonLd,
}

const recommendedRules = {
  'seo-lint-next/no-missing-title': 'error',
  'seo-lint-next/no-missing-metadata-base': 'error',
  'seo-lint-next/no-missing-description': 'warn',
  'seo-lint-next/no-missing-canonical': 'error',
  'seo-lint-next/no-missing-og-tags': 'warn',
  'seo-lint-next/no-broken-heading-hierarchy': 'warn',
  'seo-lint-next/no-img-missing-alt': 'warn',
  'seo-lint-next/no-accidental-noindex': 'error',
  'seo-lint-next/no-missing-sitemap': 'warn',
  'seo-lint-next/no-invalid-json-ld': 'error',
} as const

const plugin = {
  meta: {
    name: 'seo-lint-next',
    version: '0.1.0',
  },
  rules,
  configs: {
    recommended: [
      {
        plugins: {
          'seo-lint-next': null as unknown,
        },
        rules: recommendedRules,
      },
    ],
    legacyRecommended: {
      plugins: ['seo-lint-next'],
      rules: recommendedRules,
    },
  },
}

plugin.configs.recommended[0].plugins['seo-lint-next'] = plugin

export default plugin

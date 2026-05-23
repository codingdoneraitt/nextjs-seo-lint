import { noAccidentalNoindex } from './rules/no-accidental-noindex'
import { noBlockingNextStatic } from './rules/no-blocking-next-static'
import { noBrokenHeadingHierarchy } from './rules/no-broken-heading-hierarchy'
import { noDynamicImportSsrFalseOnContent } from './rules/no-dynamic-import-ssr-false-on-content'
import { noGenericAnchorText } from './rules/no-generic-anchor-text'
import { noImgMissingAlt } from './rules/no-img-missing-alt'
import { noInvalidJsonLd } from './rules/no-invalid-json-ld'
import { noMissing404Page } from './rules/no-missing-404-page'
import { noMissingArticleDates } from './rules/no-missing-article-dates'
import { noMissingBreadcrumbSchema } from './rules/no-missing-breadcrumb-schema'
import { noMissingCanonical } from './rules/no-missing-canonical'
import { noMissingDescription } from './rules/no-missing-description'
import { noMissingErrorBoundaryMetadata } from './rules/no-missing-error-boundary-metadata'
import { noMissingHreflang } from './rules/no-missing-hreflang'
import { noMissingLangAttribute } from './rules/no-missing-lang-attribute'
import { noMissingMetadataBase } from './rules/no-missing-metadata-base'
import { noMissingNextFont } from './rules/no-missing-next-font'
import { noMissingOgTags } from './rules/no-missing-og-tags'
import { noMissingOgImageDimensions } from './rules/no-missing-og-image-dimensions'
import { noMissingSitemap } from './rules/no-missing-sitemap'
import { noMissingTitle } from './rules/no-missing-title'
import { noMissingViewport } from './rules/no-missing-viewport'
import { noRedirectChainInNextConfig } from './rules/no-redirect-chain-in-next-config'
import { noTitleInPagesHead } from './rules/no-title-in-pages-head'
import { noUseClientOnPage } from './rules/no-use-client-on-page'

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
  'no-missing-lang-attribute': noMissingLangAttribute,
  'no-missing-viewport': noMissingViewport,
  'no-use-client-on-page': noUseClientOnPage,
  'no-missing-hreflang': noMissingHreflang,
  'no-generic-anchor-text': noGenericAnchorText,
  'no-missing-404-page': noMissing404Page,
  'no-missing-og-image-dimensions': noMissingOgImageDimensions,
  'no-blocking-next-static': noBlockingNextStatic,
  'no-missing-breadcrumb-schema': noMissingBreadcrumbSchema,
  'no-title-in-pages-head': noTitleInPagesHead,
  'no-dynamic-import-ssr-false-on-content': noDynamicImportSsrFalseOnContent,
  'no-missing-next-font': noMissingNextFont,
  'no-redirect-chain-in-next-config': noRedirectChainInNextConfig,
  'no-missing-article-dates': noMissingArticleDates,
  'no-missing-error-boundary-metadata': noMissingErrorBoundaryMetadata,
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
  'seo-lint-next/no-missing-lang-attribute': 'error',
  'seo-lint-next/no-missing-viewport': 'error',
  'seo-lint-next/no-use-client-on-page': 'warn',
  'seo-lint-next/no-missing-hreflang': 'warn',
  'seo-lint-next/no-generic-anchor-text': 'warn',
  'seo-lint-next/no-missing-404-page': 'warn',
  'seo-lint-next/no-missing-og-image-dimensions': 'warn',
  'seo-lint-next/no-blocking-next-static': 'error',
  'seo-lint-next/no-missing-breadcrumb-schema': 'warn',
  'seo-lint-next/no-title-in-pages-head': 'error',
  'seo-lint-next/no-dynamic-import-ssr-false-on-content': 'warn',
  'seo-lint-next/no-missing-next-font': 'warn',
  'seo-lint-next/no-redirect-chain-in-next-config': 'warn',
  'seo-lint-next/no-missing-article-dates': 'warn',
  'seo-lint-next/no-missing-error-boundary-metadata': 'warn',
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

import path from 'node:path'
import { createRequire } from 'node:module'
import tsParser from '@typescript-eslint/parser'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'
import plugin from '../src/eslint'

const require = createRequire(import.meta.url)
const eslintMajor = Number(require('eslint/package.json').version.split('.')[0])

;(RuleTester as any).describe = describe
;(RuleTester as any).it = it
;(RuleTester as any).itOnly = it.only

const tester = new RuleTester(
  eslintMajor >= 9
    ? {
        languageOptions: {
          parser: tsParser as never,
          parserOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            ecmaFeatures: { jsx: true },
          },
        },
      }
    : ({
        parser: require.resolve('@typescript-eslint/parser'),
        parserOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module',
          ecmaFeatures: { jsx: true },
        },
      } as never),
)

function appFile(relative: string) {
  return path.join(process.cwd(), 'app', relative)
}

tester.run('no-missing-title', plugin.rules['no-missing-title'] as never, {
  valid: [
    {
      code: "export const metadata = { title: 'Home' }",
      filename: appFile('page.tsx'),
    },
    {
      code: 'export default function Layout({ children }) { return children }',
      filename: appFile('pricing/layout.tsx'),
    },
    {
      code: 'export async function generateMetadata() { return { title: product.title } }',
      filename: appFile('dynamic-title/page.tsx'),
    },
  ],
  invalid: [
    {
      code: "export const metadata = { title: '' }",
      filename: appFile('empty-title/page.tsx'),
      errors: [{ message: 'metadata.title must not be empty or whitespace.' }],
    },
  ],
})

tester.run('no-missing-metadata-base', plugin.rules['no-missing-metadata-base'] as never, {
  valid: [
    {
      code: "export const metadata = { metadataBase: new URL('https://acme.com') }",
      filename: appFile('layout.tsx'),
    },
  ],
  invalid: [
    {
      code: "export const metadata = { metadataBase: new URL('http://localhost:3000') }",
      filename: appFile('layout.tsx'),
      errors: [{ message: /https:\/\/ production URL/ }, { message: /localhost/ }],
    },
  ],
})

tester.run('no-missing-description', plugin.rules['no-missing-description'] as never, {
  valid: [
    {
      code: `export const metadata = {
        title: 'Home',
        description: 'A practical platform for finding complete metadata issues in Next.js applications before they reach production and hurt search visibility.'
      }`,
      filename: appFile('description/page.tsx'),
    },
    {
      code: 'export async function generateMetadata() { return { description: `${post.title} certification practice questions and study guidance.` } }',
      filename: appFile('description-dynamic/page.tsx'),
    },
    {
      code: 'export default function Layout({ children }) { return children }',
      filename: appFile('pricing/layout.tsx'),
    },
  ],
  invalid: [
    {
      code: "export const metadata = { title: 'Home', description: 'short' }",
      filename: appFile('description-short/page.tsx'),
      errors: [{ message: /120-160/ }],
    },
  ],
})

tester.run('no-missing-canonical', plugin.rules['no-missing-canonical'] as never, {
  valid: [
    {
      code: "export const metadata = { alternates: { canonical: 'https://acme.com/about' } }",
      filename: appFile('about/page.tsx'),
    },
    {
      code: 'export const metadata = { robots: { index: false } }',
      filename: appFile('quiz/[id]/page.tsx'),
    },
  ],
  invalid: [
    {
      code: "export const metadata = { alternates: { canonical: 'https://acme.com/blog' } }",
      filename: appFile('blog/[slug]/page.tsx'),
      errors: [{ message: /Dynamic routes/ }],
    },
  ],
})

tester.run('no-missing-og-tags', plugin.rules['no-missing-og-tags'] as never, {
  valid: [
    {
      code: `export const metadata = {
        openGraph: {
          title: 'Post',
          description: 'A complete social preview description',
          type: 'article',
          images: [{ url: 'https://acme.com/og.png', width: 1200, height: 630 }]
        },
        twitter: { card: 'summary_large_image', images: ['https://acme.com/og.png'] }
      }`,
      filename: appFile('og-valid/page.tsx'),
    },
    {
      code: 'export const metadata = { robots: { index: false } }',
      filename: appFile('dashboard/page.tsx'),
    },
  ],
  invalid: [
    {
      code: "export const metadata = { openGraph: { title: 'Post', images: [] } }",
      filename: appFile('og/page.tsx'),
      errors: [
        { message: 'twitter metadata is missing; set twitter.card and twitter.images for share previews.' },
        { message: 'openGraph.description is missing.' },
        { message: 'openGraph.type is missing.' },
        { message: /openGraph\.images/ },
      ],
    },
  ],
})

tester.run('no-broken-heading-hierarchy', plugin.rules['no-broken-heading-hierarchy'] as never, {
  valid: [
    {
      code: 'export default function Page() { return <main><h1>Title</h1><h2>Details</h2></main> }',
      filename: appFile('headings-valid/page.tsx'),
    },
    {
      code: 'export default function Page() { return <PricingClient /> }',
      filename: appFile('pricing/page.tsx'),
    },
    {
      code: 'export const metadata = { robots: { index: false } }; export default function Page() { return <main><h1>A</h1><h1>B</h1></main> }',
      filename: appFile('quiz/page.tsx'),
    },
  ],
  invalid: [
    {
      code: 'export default function Page() { return <main><h1>Title</h1><h3>Details</h3></main> }',
      filename: appFile('headings/page.tsx'),
      errors: [{ message: 'Heading level jumps from h1 to h3.' }],
    },
  ],
})

tester.run('no-img-missing-alt', plugin.rules['no-img-missing-alt'] as never, {
  valid: [
    {
      code: 'export default function Page() { return <Image src="/hero.jpg" alt="Team using a dashboard" width={1200} height={630} priority /> }',
      filename: appFile('images-valid/page.tsx'),
    },
  ],
  invalid: [
    {
      code: 'export default function Page() { return <img src="/hero.jpg" /> }',
      filename: appFile('images/page.tsx'),
      errors: [{ message: /raw <img>/ }, { message: /missing an alt/ }],
    },
  ],
})

tester.run('no-accidental-noindex', plugin.rules['no-accidental-noindex'] as never, {
  valid: [
    {
      code: 'export const metadata = { robots: { index: true, follow: true } }',
      filename: appFile('indexable/page.tsx'),
    },
    {
      code: 'export const metadata = { robots: { index: false, follow: false } }',
      filename: appFile('sign-in/[[...sign-in]]/page.tsx'),
    },
    {
      code: `export async function generateMetadata({ searchParams }) {
        if (searchParams.provider) return { robots: { index: false, follow: true } }
        return { title: 'Exams', description: 'Browse certification exams.', alternates: { canonical: '/exams' } }
      }`,
      filename: appFile('exams/page.tsx'),
    },
  ],
  invalid: [
    {
      code: 'export const metadata = { robots: { index: false } }',
      filename: appFile('public-page/page.tsx'),
      errors: [{ message: 'Public page sets robots.index to false.' }],
    },
  ],
})

tester.run('no-missing-sitemap', plugin.rules['no-missing-sitemap'] as never, {
  valid: [],
  invalid: [
    {
      code: 'export default function Page() { return null }',
      filename: appFile('site/page.tsx'),
      errors: [{ message: /Missing app\/sitemap\.ts/ }],
    },
  ],
})

tester.run('no-invalid-json-ld', plugin.rules['no-invalid-json-ld'] as never, {
  valid: [
    {
      code: `export default function Page() {
        return <script type="application/ld+json">{'{ "@context": "https://schema.org", "@type": "Article", "headline": "Post", "author": "Ada", "datePublished": "2026-01-01" }'}</script>
      }`,
      filename: appFile('blog/jsonld-valid/page.tsx'),
    },
    {
      code: `export default function Page() {
        return <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Blog', name: 'Blog' }} />
      }`,
      filename: appFile('blog/page.tsx'),
    },
  ],
  invalid: [
    {
      code: `export default function Page() {
        return <script type="application/ld+json">{'{ "@context": "schema.org", "@type": "Article", "headline": "Post" }'}</script>
      }`,
      filename: appFile('blog/jsonld/page.tsx'),
      errors: [{ message: /@context/ }, { message: /author, datePublished/ }],
    },
  ],
})

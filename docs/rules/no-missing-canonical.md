# no-missing-canonical

Requires `alternates.canonical` on App Router pages.

## Why

Canonical URLs consolidate ranking signals across query strings, trailing slash variants, and duplicate dynamic pages.

## Bad

```ts
export const metadata = { title: 'Post' }
```

```ts
export const metadata = {
  alternates: { canonical: 'https://acme.com/blog' },
}
```

## Good

```ts
export async function generateMetadata({ params }) {
  return {
    alternates: { canonical: `https://acme.com/blog/${params.slug}` },
  }
}
```

## Notes

Dynamic routes such as `[slug]` should use a param-specific canonical.

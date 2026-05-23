# no-missing-title

Requires every App Router page or layout metadata source to provide a non-empty title.

## Why

Titles are the primary search-result label and one of the most important on-page SEO signals.

## Bad

```ts
export const metadata = { title: '' }
```

## Good

```ts
export const metadata = { title: 'Pricing' }
```

```ts
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug)
  return { title: post?.title ?? 'Post Not Found' }
}
```

## Notes

The rule also flags duplicate static titles seen during a lint run and recommends `title.template` in layouts.

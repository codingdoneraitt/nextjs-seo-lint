# no-missing-description

Requires a useful `metadata.description` or `generateMetadata()` description.

## Why

Descriptions influence search-result click-through and social snippets, even when they are not a direct ranking factor.

## Bad

```ts
export const metadata = { description: 'A blog post.' }
```

## Good

```ts
export const metadata = {
  description: 'Learn how to implement SEO metadata checks in a Next.js App Router project before deploy.',
}
```

## Options

```js
{
  descriptionLength: { min: 120, max: 160 }
}
```

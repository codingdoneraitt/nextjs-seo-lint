# no-missing-sitemap

Requires a sitemap source and a robots sitemap reference.

## Why

Sitemaps help search engines discover canonical URLs and understand changed content.

## Bad

```ts
export default function sitemap() {
  return [{ url: '/blog/post' }]
}
```

## Good

```ts
export default function sitemap() {
  return [{ url: 'https://acme.com/blog/post', lastModified: new Date() }]
}
```

## Notes

The rule accepts `app/sitemap.ts` or `next-sitemap.config.js`.

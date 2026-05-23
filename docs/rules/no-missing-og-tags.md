# no-missing-og-tags

Requires useful Open Graph and Twitter metadata for share previews.

## Why

Slack, LinkedIn, X, WhatsApp, and iMessage rely on OG/Twitter metadata for link cards.

## Bad

```ts
export const metadata = {
  openGraph: { images: [] },
}
```

## Good

```ts
export const metadata = {
  openGraph: {
    title: 'Guide',
    description: 'A practical guide to Next.js SEO metadata.',
    type: 'article',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', images: ['/og.png'] },
}
```

## Notes

An `opengraph-image.tsx` or image file in the route segment satisfies the image requirement.

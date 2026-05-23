# no-invalid-json-ld

Validates JSON-LD syntax, context, type, and required fields.

## Why

Invalid structured data is silently ignored by search engines and can prevent rich-result eligibility.

## Bad

```tsx
<script type="application/ld+json">
  {'{ "@context": "schema.org", "@type": "Article", "headline": "Post" }'}
</script>
```

## Good

```tsx
<script type="application/ld+json">
  {JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    author: post.author,
    datePublished: post.publishedAt,
  })}
</script>
```

## Notes

The built-in field map covers common types including `Article`, `Product`, `FAQPage`, `BreadcrumbList`, `Organization`, `WebSite`, `Person`, and `Event`.

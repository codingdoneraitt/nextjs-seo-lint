# no-missing-metadata-base

Requires the root `app/layout` metadata export to define a safe production `metadataBase`.

## Why

Next.js uses `metadataBase` to resolve relative canonicals and social image URLs. Missing or localhost values can leak broken preview URLs.

## Bad

```ts
export const metadata = {
  metadataBase: new URL('http://localhost:3000'),
}
```

## Good

```ts
export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://acme.com'),
}
```

## Notes

The rule only runs on the root App Router layout.

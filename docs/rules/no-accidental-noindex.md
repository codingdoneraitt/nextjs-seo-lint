# no-accidental-noindex

Prevents public pages and robots files from disabling indexing.

## Why

Accidental `noindex` is one of the fastest ways to remove production pages from search results.

## Bad

```ts
export const metadata = {
  robots: { index: false },
}
```

## Good

```ts
export const metadata = {
  robots: { index: true, follow: true },
}
```

## Options

```js
{
  privateRoutes: ['/admin', '/api', '/auth', '/private']
}
```

# no-broken-heading-hierarchy

Requires one `<h1>` and sequential heading levels in page JSX.

## Why

Heading structure helps search engines and assistive technologies understand page hierarchy.

## Bad

```tsx
<main>
  <h1>Dashboard</h1>
  <h3>Recent Posts</h3>
</main>
```

## Good

```tsx
<main>
  <h1>Dashboard</h1>
  <h2>Recent Posts</h2>
</main>
```

## Notes

This is a static JSX check. Composed heading output can differ at runtime.

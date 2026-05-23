# no-img-missing-alt

Requires useful image alt text and stable sizing for Next.js images.

## Why

Alt text supports accessibility and image SEO. Width and height prevent layout shift.

## Bad

```tsx
<img src="/hero.jpg" />
<Image src="/hero.jpg" alt="image" />
```

## Good

```tsx
<Image src="/hero.jpg" alt="Team reviewing analytics in a dashboard" width={1200} height={630} priority />
```

## Notes

Decorative images may use `alt=""`.

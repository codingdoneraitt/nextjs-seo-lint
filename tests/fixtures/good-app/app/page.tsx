export const metadata = {
  title: 'Home',
  description:
    'Audit Next.js App Router metadata before production with checks for titles, canonicals, social previews, and indexability.',
  alternates: { canonical: 'https://acme.com/' },
  openGraph: {
    title: 'Home',
    description: 'Acme metadata checks for Next.js App Router projects before production.',
    type: 'website',
    images: [{ url: 'https://acme.com/og.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['https://acme.com/og.png'],
  },
  robots: { index: true, follow: true },
}

export default function Page() {
  return (
    <main>
      <h1>Home</h1>
      <Image src="/hero.jpg" alt="Team reviewing metadata checks" width={1200} height={630} priority />
      <script type="application/ld+json">
        {
          '{ "@context": "https://schema.org", "@type": "WebSite", "name": "Acme", "url": "https://acme.com" }'
        }
      </script>
    </main>
  )
}

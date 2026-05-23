export const metadata = {
  metadataBase: new URL('https://acme.com'),
  title: { default: 'Acme', template: '%s | Acme' },
  description:
    'Acme helps teams audit Next.js metadata before production with practical checks for search previews, indexability, and structured data.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

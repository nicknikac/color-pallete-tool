import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Color Palette Generator',
  description: 'Create a randomly generated color palette',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

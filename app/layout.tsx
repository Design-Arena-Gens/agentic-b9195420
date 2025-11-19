import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NoCode Website Builder',
  description: 'Professional drag-and-drop website builder',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

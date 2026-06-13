import type { Metadata } from "next"
import "./globals.css"
import { Navbar } from "@/components/layout/navbar"

export const metadata: Metadata = {
  title: {
    default: "FutureOS",
    template: "%s | FutureOS",
  },
  description:
    "AI-powered probabilistic forecasting platform. Structure questions, gather evidence, and track probability estimates for future events.",
  openGraph: {
    title: "FutureOS",
    description:
      "AI-powered probabilistic forecasting platform. Structure questions, gather evidence, and track probability estimates.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "FutureOS",
    description:
      "AI-powered probabilistic forecasting platform. Structure questions, gather evidence, and track probability estimates.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <Navbar />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  )
}

import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { DataPersistenceIndicator } from "@/components/data-persistence-indicator"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Live Polling System",
  description: "Interactive real-time polling system for classrooms",
  keywords: ["polling", "education", "real-time", "classroom", "interactive"],
  authors: [{ name: "Live Polling System" }],
  openGraph: {
    title: "Live Polling System",
    description: "Interactive real-time polling system for classrooms",
    type: "website",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <DataPersistenceIndicator />
      </body>
    </html>
  )
}

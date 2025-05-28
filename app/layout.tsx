import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Header } from "@/components/header"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { QueryProvider } from "@/components/query-provider"
import { Toaster } from "@/components/ui/toaster"
import { DataInitializer } from "@/components/data-initializer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PC Builder - Arma tu PC a medida",
  description: "Configura y compra tu PC personalizada con nuestro asistente paso a paso",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <QueryProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
              <DataInitializer />
              <Header />
              <main className="min-h-screen bg-background pt-16">{children}</main>
              <Toaster />
            </ThemeProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

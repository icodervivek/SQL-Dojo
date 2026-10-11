import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { Suspense } from "react";
import { Celebrations } from "@/components/Celebrations";
import { ClerkBridge } from "@/components/ClerkBridge";
import { Nav } from "@/components/Nav";
import { clerkAppearance } from "@/lib/clerkAppearance";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SQL Dojo",
  description: "SQL Dojo: learn and practice SQL with real PostgreSQL in your browser. Hands-on problems, lessons, streaks and an AI tutor.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jakarta.variable} ${geistMono.variable} h-full antialiased`}>
      {/* Browser extensions (e.g. Grammarly) add attributes to <body> before hydration. */}
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        {/* Inside <body>, not around <html>: required with Cache Components. */}
        <ClerkProvider
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          appearance={clerkAppearance}
        >
          <ClerkBridge />
          {/* The nav reads the current URL, which some routes (e.g. /sign-in/...) only know at request time. */}
          <Suspense fallback={<div className="h-16 shrink-0 border-b border-border" />}>
            <Nav />
          </Suspense>
          <main className="flex-1 flex flex-col">{children}</main>
          <Celebrations />
        </ClerkProvider>
      </body>
    </html>
  );
}

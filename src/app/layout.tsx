import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { Suspense } from "react";
import { Celebrations } from "@/components/Celebrations";
import { ClerkBridge } from "@/components/ClerkBridge";
import { Nav } from "@/components/Nav";
import { clerkAppearance } from "@/lib/clerkAppearance";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DESCRIPTION =
  "Learn and practice SQL with a real PostgreSQL database in your browser. Hands-on problems with instant grading, step-by-step lessons, streaks, badges and an AI tutor.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Pages set just their own name ("Problems"); the template adds " · SQL Dojo".
  title: { default: `${SITE_NAME} · Learn SQL by writing SQL`, template: `%s · ${SITE_NAME}` },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ["SQL", "learn SQL", "SQL practice", "PostgreSQL", "SQL interview questions", "SQL exercises", "joins", "window functions"],
  // Shared preview settings only: each page sets its own preview title and description.
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_IN" },
  twitter: { card: "summary" },
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

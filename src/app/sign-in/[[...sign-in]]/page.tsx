import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/AuthShell";
import { authPageAppearance } from "@/lib/clerkAppearance";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to SQL Dojo to run queries, track your progress and keep your streak going.",
  robots: { index: false, follow: true },
  openGraph: { title: "Sign in · SQL Dojo" },
};

export default function Page() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to keep practicing"
      subtitle="Pick up right where you left off: your progress, streak and badges are waiting."
      switchText="New here?"
      switchHref="/sign-up"
      switchLabel="Create a free account"
    >
      <Suspense fallback={<FormSkeleton />}>
        <SignIn appearance={authPageAppearance} />
      </Suspense>
    </AuthShell>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-11 animate-pulse rounded-xl bg-panel-2" />
      <div className="h-11 animate-pulse rounded-xl bg-panel-2" />
      <div className="h-24 animate-pulse rounded-xl bg-panel-2" />
    </div>
  );
}

import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/AuthShell";
import { authPageAppearance } from "@/lib/clerkAppearance";

export const metadata: Metadata = {
  title: "Create a free account",
  description: "Join SQL Dojo for free: practice SQL on real datasets, get graded instantly, and earn XP, streaks and badges.",
  robots: { index: false, follow: true },
  openGraph: { title: "Create a free account · SQL Dojo" },
};

export default function Page() {
  return (
    <AuthShell
      eyebrow="Join for free"
      title="Create your account"
      subtitle="Free forever. Run queries, get graded instantly and track your progress."
      switchText="Already have an account?"
      switchHref="/sign-in"
      switchLabel="Sign in"
    >
      <Suspense fallback={<FormSkeleton />}>
        <SignUp appearance={authPageAppearance} />
      </Suspense>
    </AuthShell>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-11 animate-pulse rounded-xl bg-panel-2" />
      <div className="h-11 animate-pulse rounded-xl bg-panel-2" />
      <div className="h-32 animate-pulse rounded-xl bg-panel-2" />
    </div>
  );
}

import { AuthGate } from "@/components/AuthGate";

/** Everything in this section requires signing in. */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}

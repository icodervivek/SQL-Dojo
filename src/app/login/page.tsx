import { redirect } from "next/navigation";

/** Kept so old links keep working: sign-in now lives at /sign-in (Clerk). */
export default function LoginPage() {
  redirect("/sign-in");
}

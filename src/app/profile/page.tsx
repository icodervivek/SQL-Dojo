import type { Metadata } from "next";
import { ProfileView } from "@/components/ProfileView";

export const metadata: Metadata = { title: "Profile · SQL Dojo" };

export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <p className="text-gradient text-sm font-bold tracking-widest uppercase">Your journey</p>
      <ProfileView />
    </div>
  );
}

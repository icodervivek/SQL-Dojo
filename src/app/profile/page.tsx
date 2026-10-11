import type { Metadata } from "next";
import { ProfileView } from "@/components/ProfileView";

export const metadata: Metadata = {
  title: "Your journey",
  description: "Your SQL Dojo progress: level, XP, streaks, activity and badges.",
  robots: { index: false, follow: false }, // private page
};

export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <p className="text-gradient text-sm font-bold tracking-widest uppercase">Your journey</p>
      <ProfileView />
    </div>
  );
}

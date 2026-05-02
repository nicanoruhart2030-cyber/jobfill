import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { LandingHero } from "@/components/landing/Hero";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "JobFill — Apply to jobs while you sleep",
  description:
    "Swipe on jobs. JobFill auto-fills and submits every application with your real resume PDF injected, not reconstructed.",
};

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/swipe");

  return <LandingHero />;
}

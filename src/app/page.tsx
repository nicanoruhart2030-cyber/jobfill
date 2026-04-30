import type { Metadata } from "next";
import { LandingHero } from "@/components/landing/Hero";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "JobFill — Apply to jobs while you sleep",
  description:
    "Swipe on jobs. JobFill auto-fills and submits every application with your real resume PDF injected, not reconstructed.",
};

export default function HomePage() {
  return <LandingHero />;
}

import { NextResponse } from "next/server";
import { getSwipeJobs } from "@/lib/jobSources";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const jobs = await getSwipeJobs();
    return NextResponse.json({ jobs });
  } catch {
    return NextResponse.json({ jobs: [] }, { status: 500 });
  }
}

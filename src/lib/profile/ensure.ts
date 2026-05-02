import { auth, currentUser } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/** Internal profiles.user_id UUID for a Clerk user (DB row must exist). */
export async function getProfileUserIdByClerk(clerkUserId: string): Promise<string | null> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("profiles")
    .select("user_id")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();
  if (error) return null;
  return (data?.user_id as string) ?? null;
}

/**
 * Ensures a profile row exists for the signed-in Clerk user.
 * Call from API routes or POST /api/profile/ensure after sign-in.
 */
export async function ensureProfileForClerkUser(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await getProfileUserIdByClerk(userId);
  if (existing) return existing;

  const admin = getSupabaseAdmin();
  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    null;

  const newUserId = randomUUID();

  const { error } = await admin.from("profiles").insert({
    user_id: newUserId,
    clerk_user_id: userId,
    email,
    first_name: user?.firstName ?? null,
    last_name: user?.lastName ?? null,
  });

  if (error) {
    const retry = await getProfileUserIdByClerk(userId);
    return retry;
  }

  return newUserId;
}

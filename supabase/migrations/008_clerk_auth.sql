-- Clerk authentication: profiles no longer reference auth.users
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS clerk_user_id text UNIQUE;

-- Applications reference profile user_id only
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_user_id_fkey;

ALTER TABLE public.applications
  ADD CONSTRAINT applications_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Profiles RLS (JWT sub = Clerk user id; requires Supabase third-party auth + Clerk JWT template)
DROP POLICY IF EXISTS "users_select_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;

CREATE POLICY "profiles_select_own_clerk"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (clerk_user_id = (auth.jwt()->>'sub'));

CREATE POLICY "profiles_insert_own_clerk"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (clerk_user_id = (auth.jwt()->>'sub'));

CREATE POLICY "profiles_update_own_clerk"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (clerk_user_id = (auth.jwt()->>'sub'))
  WITH CHECK (clerk_user_id = (auth.jwt()->>'sub'));

-- Applications RLS
DROP POLICY IF EXISTS "users_select_own_applications" ON public.applications;
DROP POLICY IF EXISTS "users_insert_own_applications" ON public.applications;
DROP POLICY IF EXISTS "users_update_own_applications" ON public.applications;

CREATE POLICY "applications_select_clerk"
  ON public.applications FOR SELECT
  TO authenticated
  USING (
    user_id IN (SELECT user_id FROM public.profiles WHERE clerk_user_id = (auth.jwt()->>'sub'))
  );

CREATE POLICY "applications_insert_clerk"
  ON public.applications FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (SELECT user_id FROM public.profiles WHERE clerk_user_id = (auth.jwt()->>'sub'))
  );

CREATE POLICY "applications_update_clerk"
  ON public.applications FOR UPDATE
  TO authenticated
  USING (
    user_id IN (SELECT user_id FROM public.profiles WHERE clerk_user_id = (auth.jwt()->>'sub'))
  )
  WITH CHECK (
    user_id IN (SELECT user_id FROM public.profiles WHERE clerk_user_id = (auth.jwt()->>'sub'))
  );

-- Storage: resumes (folder = profiles.user_id)
DROP POLICY IF EXISTS "users_upload_own_resumes" ON storage.objects;
DROP POLICY IF EXISTS "users_read_own_resumes" ON storage.objects;

CREATE POLICY "users_upload_own_resumes_clerk"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] IN (
      SELECT user_id::text FROM public.profiles WHERE clerk_user_id = (auth.jwt()->>'sub')
    )
  );

CREATE POLICY "users_read_own_resumes_clerk"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] IN (
      SELECT user_id::text FROM public.profiles WHERE clerk_user_id = (auth.jwt()->>'sub')
    )
  );

DROP POLICY IF EXISTS "users_read_own_application_proofs" ON storage.objects;

CREATE POLICY "users_read_own_application_proofs_clerk"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'application-proofs'
    AND (storage.foldername(name))[1] IN (
      SELECT user_id::text FROM public.profiles WHERE clerk_user_id = (auth.jwt()->>'sub')
    )
  );

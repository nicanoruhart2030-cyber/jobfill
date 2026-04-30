-- Object paths may be userId/... or screenshots/userId/...

drop policy if exists "users_read_own_application_proofs" on storage.objects;

create policy "users_read_own_application_proofs"
  on storage.objects for select
  using (
    bucket_id = 'application-proofs'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or (
        (storage.foldername(name))[1] = 'screenshots'
        and auth.uid()::text = (storage.foldername(name))[2]
      )
    )
  );

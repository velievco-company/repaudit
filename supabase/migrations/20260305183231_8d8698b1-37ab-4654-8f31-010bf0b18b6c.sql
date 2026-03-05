
-- Add profile fields for enhanced registration
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS job_title text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_size text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country text;

-- Add share_id to audits for shareable links
ALTER TABLE public.audits ADD COLUMN IF NOT EXISTS share_id uuid DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS audits_share_id_idx ON public.audits(share_id);

-- Allow anyone to read audits by share_id (public report viewing)
CREATE POLICY "Anyone can read shared audits" ON public.audits
FOR SELECT TO anon, authenticated
USING (share_id IS NOT NULL);

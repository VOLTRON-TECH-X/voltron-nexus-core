CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  tag TEXT,
  description TEXT NOT NULL DEFAULT '',
  icon TEXT DEFAULT 'Shield',
  features TEXT[] NOT NULL DEFAULT '{}',
  cover_image TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active services"
ON public.services FOR SELECT
USING (is_active = true OR public.is_staff(auth.uid()));

CREATE POLICY "Staff can insert services"
ON public.services FOR INSERT
TO authenticated
WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can update services"
ON public.services FOR UPDATE
TO authenticated
USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can delete services"
ON public.services FOR DELETE
TO authenticated
USING (public.is_staff(auth.uid()));

CREATE TRIGGER trg_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
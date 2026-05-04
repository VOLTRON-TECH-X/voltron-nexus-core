
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'editor');
CREATE TYPE public.vpn_type AS ENUM ('HTTP_CUSTOM', 'SSH_CUSTOM', 'HTTP_INJECTOR');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles readable by authenticated"
  ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security-definer role check (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin', 'editor')
  )
$$;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admin manages roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- ============ POSTS ============
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL DEFAULT '',
  cover_image TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  read_minutes INT DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_posts_published ON public.posts(published, published_at DESC);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads published posts"
  ON public.posts FOR SELECT TO anon, authenticated
  USING (published = true OR public.is_staff(auth.uid()));
CREATE POLICY "Staff manage posts"
  ON public.posts FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

-- ============ VPN CONFIGS ============
CREATE TABLE public.vpn_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type public.vpn_type NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  config_text TEXT,
  file_url TEXT,
  file_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  download_count INT NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_vpn_active ON public.vpn_configs(is_active, type, sort_order);
ALTER TABLE public.vpn_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads active configs"
  ON public.vpn_configs FOR SELECT TO anon, authenticated
  USING (is_active = true OR public.is_staff(auth.uid()));
CREATE POLICY "Staff manage configs"
  ON public.vpn_configs FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

-- ============ VISITORS (analytics) ============
CREATE TABLE public.visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  page TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  country TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_visitors_created ON public.visitors(created_at DESC);
CREATE INDEX idx_visitors_session ON public.visitors(session_id, created_at DESC);
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone records a visit"
  ON public.visitors FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff reads visitors"
  ON public.visitors FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

ALTER PUBLICATION supabase_realtime ADD TABLE public.visitors;

-- ============ NEWSLETTER ============
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone subscribes"
  ON public.newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff reads subscribers"
  ON public.newsletter_subscribers FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

-- ============ CONTACT MESSAGES ============
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone sends a message"
  ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff reads/updates messages"
  ON public.contact_messages FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff updates messages"
  ON public.contact_messages FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()));

-- ============ updated_at trigger ============
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER trg_posts_updated BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_vpn_updated BEFORE UPDATE ON public.vpn_configs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ Profile auto-create on signup ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ STORAGE BUCKETS ============
INSERT INTO storage.buckets (id, name, public)
VALUES ('vpn-files', 'vpn-files', true), ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public reads vpn-files"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'vpn-files');
CREATE POLICY "Staff writes vpn-files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'vpn-files' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff updates vpn-files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'vpn-files' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff deletes vpn-files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'vpn-files' AND public.is_staff(auth.uid()));

CREATE POLICY "Public reads post-images"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'post-images');
CREATE POLICY "Staff writes post-images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'post-images' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff updates post-images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'post-images' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff deletes post-images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'post-images' AND public.is_staff(auth.uid()));

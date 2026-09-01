-- PART 3 — safety_contacts alignment + learn schema reconciliation + seeds

-- ── safety_contacts: add columns the app code uses ──
ALTER TABLE public.safety_contacts ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE public.safety_contacts ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.safety_contacts ADD COLUMN IF NOT EXISTS contact_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.safety_contacts ADD COLUMN IF NOT EXISTS notify_on_timer_expire BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.safety_contacts ADD COLUMN IF NOT EXISTS notify_on_leave_now BOOLEAN NOT NULL DEFAULT TRUE;
UPDATE public.safety_contacts SET contact_name = name WHERE contact_name IS NULL AND name IS NOT NULL;
UPDATE public.safety_contacts SET contact_phone = phone WHERE contact_phone IS NULL AND phone IS NOT NULL;

-- ── learn_paths: reconcile OLD (001) schema → 003 schema the code expects ──
ALTER TABLE public.learn_paths ADD COLUMN IF NOT EXISTS helper_name TEXT NOT NULL DEFAULT 'Guide';
ALTER TABLE public.learn_paths ADD COLUMN IF NOT EXISTS color TEXT NOT NULL DEFAULT '#6366f1';
ALTER TABLE public.learn_paths ADD COLUMN IF NOT EXISTS target_audience TEXT NOT NULL DEFAULT 'everyone';
ALTER TABLE public.learn_paths ADD COLUMN IF NOT EXISTS duration_weeks TEXT NOT NULL DEFAULT 'Self-paced';
ALTER TABLE public.learn_paths ADD COLUMN IF NOT EXISTS completion_badge TEXT NOT NULL DEFAULT 'Completion';
ALTER TABLE public.learn_paths ADD COLUMN IF NOT EXISTS module_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.learn_paths ADD COLUMN IF NOT EXISTS enrolled_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.learn_paths ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.learn_paths ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.learn_paths ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE public.learn_paths ALTER COLUMN description DROP NOT NULL;

-- ── learn_modules: reconcile → 003 schema ──
ALTER TABLE public.learn_modules ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';
ALTER TABLE public.learn_modules ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'lesson';
ALTER TABLE public.learn_modules ADD COLUMN IF NOT EXISTS content_markdown TEXT NOT NULL DEFAULT '';
ALTER TABLE public.learn_modules ADD COLUMN IF NOT EXISTS duration_minutes INTEGER NOT NULL DEFAULT 30;
ALTER TABLE public.learn_modules ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.learn_modules ADD COLUMN IF NOT EXISTS assessment_type TEXT DEFAULT 'completion';
ALTER TABLE public.learn_modules ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.learn_modules ADD COLUMN IF NOT EXISTS offline_available BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.learn_modules ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
-- unique constraint for ON CONFLICT (path_id, slug)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'learn_modules_path_slug_key') THEN
    ALTER TABLE public.learn_modules ADD CONSTRAINT learn_modules_path_slug_key UNIQUE (path_id, slug);
  END IF;
END $$;

-- ── learn_badges: create (code reads it, missing) ──
CREATE TABLE IF NOT EXISTS public.learn_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  path_id UUID NOT NULL REFERENCES public.learn_paths(id),
  badge_name TEXT NOT NULL,
  badge_description TEXT NOT NULL,
  badge_icon TEXT NOT NULL DEFAULT '🏅',
  evidence_summary TEXT,
  issued_by TEXT NOT NULL DEFAULT 'system',
  portable BOOLEAN NOT NULL DEFAULT TRUE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.learn_badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own learn_badges" ON public.learn_badges;
CREATE POLICY "own learn_badges" ON public.learn_badges FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE INDEX IF NOT EXISTS idx_learn_badges_user ON public.learn_badges(user_id, earned_at DESC);

-- ── SEED paths ──
INSERT INTO public.learn_paths (slug, title, description, helper_name, icon, color, target_audience, duration_weeks, completion_badge, sort_order) VALUES
  ('rights-and-papers', 'Rights and Papers', 'Navigate legal systems, understand your rights, prepare documents, and access legal aid resources.', 'Rue', '⚖️', '#dc2626', 'Anyone needing legal navigation', '4-12 weeks', 'Rights Navigator', 1),
  ('parenting', 'Parenting', 'Build parenting skills, coordinate childcare, find resources, and connect with other parents.', 'Kin', '👨‍👩‍👧', '#ea580c', 'Parents, guardians, caregivers', 'Ongoing', 'Community Parent', 2),
  ('reentry', 'Reentry', 'Build your path from incarceration to community integration. Housing, work, documents, support.', 'Tide', '🌅', '#0891b2', 'Formerly incarcerated, probation', '12 weeks', 'New Chapter', 3),
  ('peace', 'Peace', 'Learn conflict resolution, de-escalation, mediation, and community protection through service.', 'Bridge', '🕊️', '#7c3aed', 'Gang/crew members, conflict-involved', '16 weeks', 'Peacemaker', 4),
  ('food-and-first-aid', 'Food and First Aid', 'Master cooking, food safety, nutrition, basic first aid, and emergency response skills.', 'Terra', '🍎', '#16a34a', 'Everyone (essential skills)', '6 weeks', 'Community First Responder', 5),
  ('repair', 'Repair', 'Fix things instead of replacing them. Electronics, plumbing, carpentry, bikes, and clothes.', 'Spark', '🔧', '#ca8a04', 'Anyone wanting to fix things', '8 weeks', 'Repair Specialist', 6),
  ('money-not-casino', 'Money (Not a Casino)', 'Understand money, budgeting, debt, savings, and community economics without the gambling mindset.', 'Nia', '💰', '#059669', 'Everyone (financial literacy)', '4 weeks', 'Money Navigator', 7),
  ('literacy', 'Read / Write / Numbers / Languages', 'Build reading, writing, math, and language skills at your own pace with patient support.', 'Sage', '📖', '#2563eb', 'Literacy learners, ESL', 'Self-paced', 'Literate', 8),
  ('the-trade', 'The Trade This Place Lacks', 'Learn a skilled trade that your community needs. Apprenticeship-based, real projects.', 'Forge', '🏗️', '#9333ea', 'Workers, career changers', '12-24 weeks', 'Tradesperson', 9),
  ('run-a-street', 'How to Run a Street', 'Learn community organizing, governance, facilitation, and stewardship.', 'Vox', '🏘️', '#e11d48', 'Community leaders, organizers', '8 weeks', 'Street Steward', 10)
ON CONFLICT (slug) DO NOTHING;

-- ── SEED modules for Rights and Papers ──
INSERT INTO public.learn_modules (path_id, slug, title, description, type, duration_minutes, sort_order, assessment_type) VALUES
  ((SELECT id FROM public.learn_paths WHERE slug = 'rights-and-papers'), 'know-your-rights', 'Know Your Rights', 'Understand your fundamental rights in everyday situations: police encounters, housing, employment, healthcare.', 'lesson', 45, 1, 'completion'),
  ((SELECT id FROM public.learn_paths WHERE slug = 'rights-and-papers'), 'documents-checklist', 'Documents Checklist', 'What documents you need, how to get them, and how to keep them safe.', 'exercise', 60, 2, 'completion'),
  ((SELECT id FROM public.learn_paths WHERE slug = 'rights-and-papers'), 'court-preparation', 'Court Preparation', 'What to expect, how to dress, what to say, and your rights in court.', 'lesson', 30, 3, 'completion'),
  ((SELECT id FROM public.learn_paths WHERE slug = 'rights-and-papers'), 'legal-aid-resources', 'Finding Legal Aid', 'How to find free legal help, what legal aid covers, and when you need a paid lawyer.', 'exercise', 45, 4, 'completion'),
  ((SELECT id FROM public.learn_paths WHERE slug = 'rights-and-papers'), 'housing-rights', 'Housing Rights', 'Tenant rights, eviction process, fair housing, Section 8, and illegal lockouts.', 'lesson', 60, 5, 'quiz'),
  ((SELECT id FROM public.learn_paths WHERE slug = 'rights-and-papers'), 'employment-rights', 'Employment Rights', 'Worker rights, wage theft, discrimination, OSHA, unemployment.', 'lesson', 45, 6, 'completion'),
  ((SELECT id FROM public.learn_paths WHERE slug = 'rights-and-papers'), 'benefits-navigation', 'Benefits Navigation', 'SNAP, Medicaid, SSI/SSDI, TANF, WIC. Eligibility, applications, appeals.', 'exercise', 60, 7, 'portfolio'),
  ((SELECT id FROM public.learn_paths WHERE slug = 'rights-and-papers'), 'community-project', 'Rights Navigator Project', 'Help one person navigate a legal or documents challenge. Document the process.', 'project', 120, 8, 'project')
ON CONFLICT (path_id, slug) DO NOTHING;

-- ── update module_count ──
UPDATE public.learn_paths p SET module_count = (SELECT count(*) FROM public.learn_modules m WHERE m.path_id = p.id);

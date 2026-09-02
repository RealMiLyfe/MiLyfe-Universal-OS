-- ============================================================================
-- MiLyfe Phase 4 — Learn → full LMS
-- Migration 021 (extends existing learn_paths/modules/enrollments/progress/badges/classes)
--
-- Quizzes, assignments, certificates, cohorts, instructor tools.
-- ============================================================================

-- Quizzes attached to a module
CREATE TABLE public.learn_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.learn_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  time_limit_minutes INTEGER,             -- null = untimed
  passing_score INTEGER NOT NULL DEFAULT 70,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  is_practice BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Questions (8 types) + a question bank
CREATE TABLE public.learn_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.learn_quizzes(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('mcq_single','mcq_multi','match','sort','fill_blank','dropdown','free_text','essay')),
  prompt TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,   -- [{id,text}]
  correct JSONB NOT NULL DEFAULT '[]'::jsonb,   -- correct option ids / answer(s)
  points INTEGER NOT NULL DEFAULT 1,
  auto_graded BOOLEAN NOT NULL DEFAULT TRUE,    -- essay/free_text = manual
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_learn_questions_quiz ON public.learn_questions(quiz_id, position);

-- Quiz attempts + answers
CREATE TABLE public.learn_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.learn_quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,   -- {question_id: answer}
  score NUMERIC,
  passed BOOLEAN,
  needs_manual_grade BOOLEAN NOT NULL DEFAULT FALSE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ
);
CREATE INDEX idx_learn_attempts_user ON public.learn_quiz_attempts(user_id, quiz_id);

-- Assignments (file upload -> instructor review -> graded)
CREATE TABLE public.learn_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.learn_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  instructions TEXT,
  max_points INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE public.learn_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.learn_assignments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_url TEXT,
  text_body TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','reviewed','returned')),
  grade NUMERIC,
  instructor_remarks TEXT,
  corrected_file_url TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  UNIQUE(assignment_id, user_id)
);

-- Certificates (issued on completion, unique validation code)
CREATE TABLE public.learn_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  path_id UUID REFERENCES public.learn_paths(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  validation_code TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_learn_certs_user ON public.learn_certificates(user_id);

-- Cohorts / batches (group enrollment with start/end)
CREATE TABLE public.learn_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID NOT NULL REFERENCES public.learn_paths(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  starts_on DATE,
  ends_on DATE,
  instructor_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE public.learn_cohort_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID NOT NULL REFERENCES public.learn_cohorts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(cohort_id, user_id)
);

-- ============================================================================
-- RLS
-- ============================================================================
ALTER TABLE public.learn_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learn_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learn_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learn_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learn_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learn_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learn_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learn_cohort_members ENABLE ROW LEVEL SECURITY;

-- Quizzes/questions/assignments/cohorts: public read (content); admin-managed writes handled server-side.
CREATE POLICY "learn_quizzes_read" ON public.learn_quizzes FOR SELECT USING (TRUE);
-- Questions: hide the correct answers by reading through a view in app; row-read allowed for authed.
CREATE POLICY "learn_questions_read" ON public.learn_questions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "learn_assignments_read" ON public.learn_assignments FOR SELECT USING (TRUE);
CREATE POLICY "learn_cohorts_read" ON public.learn_cohorts FOR SELECT USING (TRUE);

-- Attempts / submissions / certificates / cohort membership: owner-scoped.
CREATE POLICY "learn_attempts_own" ON public.learn_quiz_attempts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "learn_submissions_own" ON public.learn_submissions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "learn_certs_own" ON public.learn_certificates
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "learn_cohort_members_own" ON public.learn_cohort_members
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Public certificate validation (verify a code without exposing user).
CREATE OR REPLACE VIEW public.learn_certificate_validation AS
  SELECT validation_code, title, issued_at FROM public.learn_certificates;

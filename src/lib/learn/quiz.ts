/**
 * Learn LMS — quiz types + deterministic auto-grading.
 * Essay/free_text are flagged for manual grading, never auto-scored.
 */
export type QuestionKind =
  | 'mcq_single' | 'mcq_multi' | 'match' | 'sort' | 'fill_blank' | 'dropdown' | 'free_text' | 'essay';

export interface QuizOption { id: string; text: string; }
export interface Question {
  id: string;
  kind: QuestionKind;
  prompt: string;
  options: QuizOption[];
  correct: string[];        // correct option ids / accepted answers (lowercased for text)
  points: number;
  auto_graded: boolean;
}

export interface GradeResult {
  score: number;            // 0-100
  earned: number;
  possible: number;
  passed: boolean;
  needsManual: boolean;
}

/** Grade a set of answers. answers: { [questionId]: string | string[] } */
export function gradeQuiz(
  questions: Question[],
  answers: Record<string, string | string[]>,
  passingScore = 70
): GradeResult {
  let earned = 0;
  let possible = 0;
  let needsManual = false;

  for (const q of questions) {
    possible += q.points;
    if (!q.auto_graded || q.kind === 'essay' || q.kind === 'free_text') {
      needsManual = true;
      continue;
    }
    const a = answers[q.id];
    if (a == null) continue;
    if (q.kind === 'mcq_multi' || q.kind === 'sort' || q.kind === 'match') {
      const given = Array.isArray(a) ? [...a] : [a];
      const correct = [...q.correct];
      // order-sensitive for sort, set-equal for multi/match
      const ok = q.kind === 'sort'
        ? JSON.stringify(given) === JSON.stringify(correct)
        : given.length === correct.length && given.every((x) => correct.includes(x));
      if (ok) earned += q.points;
    } else {
      // single answer types
      const given = (Array.isArray(a) ? a[0] : a)?.toString().trim().toLowerCase();
      if (q.correct.map((c) => c.toLowerCase()).includes(given)) earned += q.points;
    }
  }

  const score = possible > 0 ? Math.round((earned / possible) * 100) : 0;
  return {
    score,
    earned,
    possible,
    passed: !needsManual && score >= passingScore,
    needsManual,
  };
}

export function generateValidationCode(): string {
  return 'MI-' + Math.random().toString(36).slice(2, 8).toUpperCase() + '-' + Date.now().toString(36).toUpperCase().slice(-4);
}

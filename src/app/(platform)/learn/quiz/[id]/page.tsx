'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, XCircle, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { socialDb } from '@/lib/social/db';
import { gradeQuiz, type Question, type GradeResult } from '@/lib/learn/quiz';
import { rewardContribution } from '@/lib/economy/reward';

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [quiz, setQuiz] = useState<{ title: string; passing_score: number } | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [result, setResult] = useState<GradeResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const db = socialDb();
      const [{ data: q }, { data: qs }] = await Promise.all([
        db.from('learn_quizzes').select('title, passing_score').eq('id', id).maybeSingle(),
        db.from('learn_questions').select('*').eq('quiz_id', id).order('position', { ascending: true }),
      ]);
      setQuiz(q ?? null);
      setQuestions(qs ?? []);
      setLoading(false);
    })();
  }, [id]);

  function setAnswer(qid: string, val: string | string[]) {
    setAnswers((a) => ({ ...a, [qid]: val }));
  }

  async function submit() {
    const r = gradeQuiz(questions, answers, quiz?.passing_score ?? 70);
    setResult(r);
    try {
      const db = socialDb();
      const { data: userData } = await db.auth.getUser();
      const uid = userData.user?.id;
      if (uid) {
        await db.from('learn_quiz_attempts').insert({
          quiz_id: id, user_id: uid, answers, score: r.score, passed: r.passed,
          needs_manual_grade: r.needsManual, submitted_at: new Date().toISOString(),
        });
      }
    } catch { /* attempt logging best-effort */ }
    if (r.passed) {
      const awarded = await rewardContribution(socialDb() as never, {
        kind: 'quiz_pass', surface: 'learn', facet: 'teacher',
        title: `Passed quiz: ${quiz?.title ?? ''}`, mly: 20, reference: id,
      });
      toast.success(awarded > 0 ? `Passed with ${r.score}%! +${awarded} $MLY.` : `Passed with ${r.score}%!`);
    }
    else if (r.needsManual) toast.info('Submitted — an instructor will grade the written parts.');
    else toast.error(`Scored ${r.score}%. Try again.`);
  }

  if (loading) return <div className="h-40 animate-pulse rounded-xl bg-gray-100" />;
  if (!quiz) return <p className="text-center text-sm text-gray-500">Quiz not found.</p>;

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/learn" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Learn
      </Link>
      <h1 className="flex items-center gap-2 text-2xl font-bold text-harbor-800"><GraduationCap className="h-6 w-6 text-indigo-600" /> {quiz.title}</h1>

      {result ? (
        <div className="rounded-xl border border-gray-100 bg-white p-6 text-center">
          {result.passed ? <CheckCircle2 className="mx-auto mb-2 h-10 w-10 text-green-600" /> : <XCircle className="mx-auto mb-2 h-10 w-10 text-red-500" />}
          <p className="text-2xl font-bold text-harbor-800">{result.score}%</p>
          <p className="text-sm text-gray-500">
            {result.passed ? 'Passed' : result.needsManual ? 'Awaiting instructor grade for written answers' : 'Not yet — keep going'}
          </p>
          <Button variant="outline" className="mt-4" onClick={() => { setResult(null); setAnswers({}); }}>Retake</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={q.id} className="rounded-xl border border-gray-100 bg-white p-4">
              <p className="mb-3 font-medium text-harbor-800">{i + 1}. {q.prompt}</p>
              {(q.kind === 'mcq_single' || q.kind === 'dropdown') && (
                <div className="space-y-2">
                  {q.options.map((o) => (
                    <label key={o.id} className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-sm ${answers[q.id] === o.id ? 'border-teal-500 bg-teal-50' : 'border-gray-200'}`}>
                      <input type="radio" name={q.id} checked={answers[q.id] === o.id} onChange={() => setAnswer(q.id, o.id)} className="accent-teal-600" />
                      {o.text}
                    </label>
                  ))}
                </div>
              )}
              {q.kind === 'mcq_multi' && (
                <div className="space-y-2">
                  {q.options.map((o) => {
                    const arr = (answers[q.id] as string[]) ?? [];
                    return (
                      <label key={o.id} className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-sm ${arr.includes(o.id) ? 'border-teal-500 bg-teal-50' : 'border-gray-200'}`}>
                        <input type="checkbox" checked={arr.includes(o.id)}
                          onChange={(e) => setAnswer(q.id, e.target.checked ? [...arr, o.id] : arr.filter((x) => x !== o.id))} className="accent-teal-600" />
                        {o.text}
                      </label>
                    );
                  })}
                </div>
              )}
              {(q.kind === 'fill_blank' || q.kind === 'free_text') && (
                <Input value={(answers[q.id] as string) ?? ''} onChange={(e) => setAnswer(q.id, e.target.value)} placeholder="Your answer" />
              )}
              {q.kind === 'essay' && (
                <textarea rows={4} value={(answers[q.id] as string) ?? ''} onChange={(e) => setAnswer(q.id, e.target.value)}
                  placeholder="Write your response (graded by an instructor)"
                  className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-teal-500" />
              )}
            </div>
          ))}
          <Button variant="harbor" size="lg" className="w-full" onClick={submit} disabled={questions.length === 0}>Submit quiz</Button>
        </div>
      )}
    </div>
  );
}

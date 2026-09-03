import { describe, it, expect } from 'vitest';
import { gradeQuiz, generateValidationCode, type Question } from './quiz';

const mcq: Question = {
  id: 'q1', kind: 'mcq_single', prompt: '2+2?',
  options: [{ id: 'a', text: '3' }, { id: 'b', text: '4' }],
  correct: ['b'], points: 1, auto_graded: true,
};
const multi: Question = {
  id: 'q2', kind: 'mcq_multi', prompt: 'evens?',
  options: [{ id: 'a', text: '2' }, { id: 'b', text: '3' }, { id: 'c', text: '4' }],
  correct: ['a', 'c'], points: 1, auto_graded: true,
};
const essay: Question = {
  id: 'q3', kind: 'essay', prompt: 'explain', options: [], correct: [], points: 1, auto_graded: false,
};

describe('gradeQuiz', () => {
  it('scores a correct single-choice as 100 and passes', () => {
    const r = gradeQuiz([mcq], { q1: 'b' }, 70);
    expect(r.score).toBe(100);
    expect(r.passed).toBe(true);
    expect(r.needsManual).toBe(false);
  });

  it('scores a wrong answer as 0 and fails', () => {
    const r = gradeQuiz([mcq], { q1: 'a' }, 70);
    expect(r.score).toBe(0);
    expect(r.passed).toBe(false);
  });

  it('requires all correct options for multi (set-equal)', () => {
    expect(gradeQuiz([multi], { q2: ['a', 'c'] }, 70).score).toBe(100);
    expect(gradeQuiz([multi], { q2: ['a'] }, 70).score).toBe(0);
    expect(gradeQuiz([multi], { q2: ['a', 'b'] }, 70).score).toBe(0);
  });

  it('flags essays for manual grading and never auto-passes', () => {
    const r = gradeQuiz([mcq, essay], { q1: 'b' }, 70);
    expect(r.needsManual).toBe(true);
    expect(r.passed).toBe(false); // manual grading pending
  });
});

describe('generateValidationCode', () => {
  it('produces a MI-prefixed unique-ish code', () => {
    const a = generateValidationCode();
    const b = generateValidationCode();
    expect(a).toMatch(/^MI-/);
    expect(a).not.toBe(b);
  });
});

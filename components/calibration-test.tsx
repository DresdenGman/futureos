'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, RefreshCcw, ShieldCheck } from 'lucide-react';
import { recordPublicEvent } from '@/lib/public-events';

const questions = [
  { statement: 'Venus is hotter at its surface than Mercury.', answer: true },
  {
    statement:
      'The Great Wall of China is visible from the Moon with the naked eye.',
    answer: false,
  },
  { statement: 'Australia is wider than the Moon.', answer: true },
  {
    statement: 'Antibiotics are effective against viral infections.',
    answer: false,
  },
  { statement: 'Sharks existed before the first trees.', answer: true },
  {
    statement: 'Water boils at a lower temperature at higher altitude.',
    answer: true,
  },
  {
    statement:
      'The human body has more bacterial cells than human cells by a ratio above 100 to 1.',
    answer: false,
  },
  {
    statement: 'A lightning bolt can be hotter than the surface of the Sun.',
    answer: true,
  },
  {
    statement: 'The Pacific Ocean is larger than all land on Earth combined.',
    answer: true,
  },
  {
    statement: 'Sound travels faster through air than through water.',
    answer: false,
  },
];

type Answer = { choice: boolean; confidence: number };

export function CalibrationTest() {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<boolean | null>(null);
  const [confidence, setConfidence] = useState(70);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [complete, setComplete] = useState(false);
  const started = useRef(false);

  function submitAnswer() {
    if (choice === null) return;
    if (!started.current) {
      started.current = true;
      void recordPublicEvent('tool_started', 'calibration');
    }
    const nextAnswers = [...answers, { choice, confidence }];
    setAnswers(nextAnswers);
    if (index === questions.length - 1) {
      setComplete(true);
      void recordPublicEvent('tool_completed', 'calibration');
      return;
    }
    setIndex((current) => current + 1);
    setChoice(null);
    setConfidence(70);
  }

  function reset() {
    setIndex(0);
    setChoice(null);
    setConfidence(70);
    setAnswers([]);
    setComplete(false);
    started.current = false;
  }

  if (complete) {
    const correct = answers.filter(
      (answer, answerIndex) => answer.choice === questions[answerIndex].answer,
    ).length;
    const accuracy = (correct / questions.length) * 100;
    const averageConfidence =
      answers.reduce((sum, answer) => sum + answer.confidence, 0) /
      answers.length;
    const brier =
      answers.reduce((sum, answer, answerIndex) => {
        const isCorrect =
          answer.choice === questions[answerIndex].answer ? 1 : 0;
        return sum + (answer.confidence / 100 - isCorrect) ** 2;
      }, 0) / answers.length;
    const gap = Math.round(averageConfidence - accuracy);
    const label =
      brier <= 0.08
        ? 'Well calibrated'
        : brier <= 0.16
          ? 'Promising calibration'
          : gap > 8
            ? 'Overconfidence detected'
            : 'Calibration needs more evidence';

    return (
      <section className="grid overflow-hidden border border-ink/20 bg-[#fbfaf6] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="field-grid p-7 sm:p-12 lg:p-16">
          <p className="measure-label">Calibration result</p>
          <h2 className="mt-8 text-5xl font-medium leading-[0.92] tracking-[-0.055em] text-ink sm:text-7xl">
            {label}
          </h2>
          <div className="mt-10 grid grid-cols-3 border-l border-t border-ink/20">
            <ResultMetric value={`${correct}/10`} label="Accuracy" />
            <ResultMetric
              value={`${Math.round(averageConfidence)}%`}
              label="Avg. confidence"
            />
            <ResultMetric value={brier.toFixed(3)} label="Brier score" />
          </div>
          <p className="mt-8 max-w-xl text-sm leading-7 text-ink/60">
            Your confidence was {Math.abs(gap)} points{' '}
            {gap > 0 ? 'above' : 'below'} your accuracy. A Brier score of 0 is
            perfect; answering every question at 50% confidence produces 0.25.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            <Link
              href="/decisions/new"
              className="field-button field-button-primary"
            >
              Forecast a real decision <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={reset}
              className="field-button field-button-secondary"
            >
              <RefreshCcw className="h-4 w-4" /> Try again
            </button>
          </div>
        </div>
        <div className="flex flex-col justify-between bg-ink p-7 text-bone sm:p-12">
          <p className="font-editorial text-8xl italic leading-none text-signal">
            BS
          </p>
          <div className="mt-16">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-signal">
              What this measures
            </p>
            <p className="mt-4 text-2xl font-semibold leading-8 tracking-[-0.03em]">
              Accuracy rewards being right. Calibration also asks whether your
              confidence deserved to be that high.
            </p>
            <p className="mt-5 text-sm leading-7 text-white/52">
              One short test is noisy. The useful signal appears when many
              forecasts are resolved over time.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const question = questions[index];
  return (
    <section className="grid overflow-hidden border border-ink/20 bg-[#fbfaf6] lg:grid-cols-[0.72fr_1.28fr]">
      <div className="flex flex-col justify-between border-ink/20 bg-ink p-7 text-bone sm:p-12 lg:border-r">
        <div>
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-signal">
            Question {index + 1} / {questions.length}
          </p>
          <div className="mt-6 h-1 overflow-hidden bg-white/10">
            <div
              className="h-full bg-signal transition-all"
              style={{ width: `${((index + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="my-16">
          <p className="font-editorial text-7xl italic leading-none text-signal">
            {confidence}%
          </p>
          <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.1em] text-white/40">
            confidence in your selected answer
          </p>
        </div>
        <p className="flex items-center gap-2 text-xs text-white/42">
          <ShieldCheck className="h-4 w-4 text-signal" /> Answers are calculated
          locally and never stored.
        </p>
      </div>
      <div className="field-grid p-7 sm:p-12 lg:p-16">
        <p className="measure-label">True or false?</p>
        <h2 className="mt-8 max-w-3xl text-4xl font-medium leading-[1.02] tracking-[-0.045em] text-ink sm:text-6xl">
          {question.statement}
        </h2>
        <div className="mt-10 grid grid-cols-2 gap-2">
          {[true, false].map((value) => (
            <button
              key={String(value)}
              type="button"
              onClick={() => setChoice(value)}
              aria-pressed={choice === value}
              className={`focus-ring h-16 border text-sm font-black uppercase tracking-[0.04em] transition ${
                choice === value
                  ? 'border-ink bg-ink text-signal'
                  : 'border-ink/20 bg-bone text-ink hover:border-ink'
              }`}
            >
              {value ? 'True' : 'False'}
            </button>
          ))}
        </div>
        <div className="mt-10">
          <div className="flex items-center justify-between font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-ink/45">
            <label htmlFor="calibration-confidence">
              How confident are you?
            </label>
            <span>{confidence}%</span>
          </div>
          <input
            id="calibration-confidence"
            type="range"
            min="50"
            max="100"
            step="5"
            value={confidence}
            onChange={(event) => setConfidence(Number(event.target.value))}
            className="mt-5 w-full"
          />
          <span className="mt-2 flex justify-between font-mono text-[8px] uppercase tracking-[0.08em] text-ink/35">
            <span>50 / pure uncertainty</span>
            <span>100 / certain</span>
          </span>
        </div>
        <button
          type="button"
          onClick={submitAnswer}
          disabled={choice === null}
          className="field-button field-button-primary mt-10 w-full disabled:cursor-not-allowed disabled:opacity-35 sm:w-auto"
        >
          Lock answer <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

function ResultMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-b border-r border-ink/20 p-4 sm:p-6">
      <p className="font-editorial text-3xl italic text-ink sm:text-4xl">
        {value}
      </p>
      <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.08em] text-ink/40">
        {label}
      </p>
    </div>
  );
}

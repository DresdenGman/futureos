'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Clipboard,
  RefreshCcw,
  ShieldCheck,
} from 'lucide-react';
import { recordPublicEvent } from '@/lib/public-events';

const questions = [
  {
    label: 'Outcome clarity',
    prompt: 'Could an outside observer tell you whether this decision worked?',
    low: 'The outcome is mostly subjective',
    high: 'A metric and threshold make it resolvable',
  },
  {
    label: 'Baseline belief',
    prompt:
      'Have you recorded what you believe before collecting more evidence?',
    low: 'No probability or baseline',
    high: 'A probability and reason are written down',
  },
  {
    label: 'Real alternatives',
    prompt:
      'Are you comparing genuinely available options—not just yes versus no?',
    low: 'Only one path is being considered',
    high: 'At least three viable paths are explicit',
  },
  {
    label: 'Value and downside',
    prompt:
      'Have you made the upside, cost and worst credible outcome explicit?',
    low: 'The tradeoff is mostly intuitive',
    high: 'Value and downside are comparable',
  },
  {
    label: 'Reversibility',
    prompt:
      'Do you know what can be undone, delayed or tested at smaller scale?',
    low: 'The commitment is treated as binary',
    high: 'A reversible experiment is available',
  },
  {
    label: 'Update trigger',
    prompt: 'Have you named evidence that would materially change your mind?',
    low: 'No evidence would change the plan',
    high: 'A specific signal and threshold are written',
  },
  {
    label: 'Resolution discipline',
    prompt: 'Is there a date when you will return and judge the decision?',
    low: 'No scheduled resolution',
    high: 'A date, owner and review are committed',
  },
];

const options = [
  { value: 0, label: 'Not yet' },
  { value: 1, label: 'Partly' },
  { value: 2, label: 'Mostly' },
  { value: 3, label: 'Explicitly' },
];

export function DecisionQualityTool() {
  const [answers, setAnswers] = useState(() => questions.map(() => -1));
  const [complete, setComplete] = useState(false);
  const [shared, setShared] = useState(false);
  const started = useRef(false);

  const answered = answers.filter((answer) => answer >= 0).length;
  const score = Math.round(
    (answers.reduce((sum, answer) => sum + Math.max(0, answer), 0) /
      (questions.length * 3)) *
      100,
  );
  const weakest = useMemo(() => {
    const minimum = Math.min(...answers.filter((answer) => answer >= 0));
    return questions.find((_, index) => answers[index] === minimum);
  }, [answers]);

  function answer(index: number, value: number) {
    if (!started.current) {
      started.current = true;
      void recordPublicEvent('tool_started', 'decision_quality');
    }
    setAnswers((current) =>
      current.map((answerValue, answerIndex) =>
        answerIndex === index ? value : answerValue,
      ),
    );
  }

  function finish() {
    if (answered !== questions.length) return;
    setComplete(true);
    void recordPublicEvent('tool_completed', 'decision_quality');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function share() {
    const text = `My FutureOS Decision Quality Score is ${score}/100. Test one of your decisions:`;
    const url = 'https://futureos.space/tools/decision-quality';
    try {
      if (navigator.share) await navigator.share({ title: text, text, url });
      else await navigator.clipboard.writeText(`${text} ${url}`);
      setShared(true);
      void recordPublicEvent('share_clicked', 'decision_quality');
    } catch {
      // The user may cancel the native share sheet.
    }
  }

  function reset() {
    setAnswers(questions.map(() => -1));
    setComplete(false);
    setShared(false);
    started.current = false;
  }

  if (complete) {
    const grade =
      score >= 85
        ? 'Decision-ready'
        : score >= 65
          ? 'Promising, with blind spots'
          : score >= 40
            ? 'Under-specified'
            : 'Not yet testable';
    return (
      <section className="grid overflow-hidden border border-ink/20 bg-[#fbfaf6] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="field-grid p-7 sm:p-12 lg:p-16">
          <p className="measure-label">Your result</p>
          <p className="mt-10 font-editorial text-[clamp(6rem,16vw,11rem)] italic leading-[0.72] tracking-[-0.07em] text-ink">
            {score}
          </p>
          <p className="mt-8 text-2xl font-semibold tracking-[-0.035em] text-ink">
            {grade}
          </p>
          <p className="mt-4 max-w-xl text-sm leading-7 text-ink/60">
            This is a structure score, not a prediction of whether your choice
            will succeed. It measures how well the decision can learn from
            evidence and eventually be resolved.
          </p>
          <div className="mt-9 flex flex-wrap gap-2">
            <Link
              href="/decisions/new"
              className="field-button field-button-primary"
            >
              Build the decision record <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={share}
              className="field-button field-button-secondary"
            >
              <Clipboard className="h-4 w-4" />
              {shared ? 'Copied' : 'Share score'}
            </button>
          </div>
        </div>
        <div className="flex flex-col justify-between bg-ink p-7 text-bone sm:p-12">
          <div>
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-signal">
              Highest-leverage next step
            </p>
            <h2 className="mt-5 text-4xl font-medium leading-[0.98] tracking-[-0.045em]">
              Strengthen your
              <span className="font-editorial font-normal italic text-signal">
                {' '}
                {weakest?.label.toLowerCase()}.
              </span>
            </h2>
            <p className="mt-6 text-sm leading-7 text-white/55">
              {weakest?.high}. Write it before new information or the final
              outcome can rewrite the story.
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="mt-16 inline-flex items-center gap-2 self-start border-b border-white/35 pb-1 text-xs font-bold text-white/60 hover:text-white"
          >
            <RefreshCcw className="h-3.5 w-3.5" /> Test another decision
          </button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-8 flex items-center justify-between gap-4 border-b border-ink/20 pb-4">
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-ink/45">
          {answered} / {questions.length} dimensions answered
        </p>
        <div className="h-1 w-32 overflow-hidden bg-ink/10 sm:w-56">
          <div
            className="h-full bg-signal-dark transition-all"
            style={{ width: `${(answered / questions.length) * 100}%` }}
          />
        </div>
      </div>
      <div className="border-l border-t border-ink/20">
        {questions.map((question, index) => (
          <fieldset
            key={question.label}
            className="grid gap-7 border-b border-r border-ink/20 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"
          >
            <div>
              <legend className="text-xl font-semibold tracking-[-0.03em] text-ink">
                <span className="mr-3 font-mono text-[9px] text-signal-dark">
                  0{index + 1}
                </span>
                {question.label}
              </legend>
              <p className="mt-3 max-w-xl text-sm leading-6 text-ink/58">
                {question.prompt}
              </p>
              <div className="mt-4 flex justify-between gap-4 font-mono text-[8px] uppercase tracking-[0.08em] text-ink/35">
                <span>{question.low}</span>
                <span className="hidden text-right sm:block">
                  {question.high}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {options.map((option) => {
                const active = answers[index] === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => answer(index, option.value)}
                    aria-pressed={active}
                    className={`focus-ring flex h-12 items-center justify-center gap-2 border px-3 text-xs font-bold transition ${
                      active
                        ? 'border-ink bg-ink text-signal'
                        : 'border-ink/20 bg-bone text-ink/55 hover:border-ink hover:text-ink'
                    }`}
                  >
                    {active && <Check className="h-3.5 w-3.5" />}
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
      <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-xs text-ink/45">
          <ShieldCheck className="h-4 w-4 text-signal-dark" /> Answers stay in
          your browser and are never stored.
        </p>
        <button
          type="button"
          onClick={finish}
          disabled={answered !== questions.length}
          className="field-button field-button-primary disabled:cursor-not-allowed disabled:opacity-35"
        >
          Calculate my score <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

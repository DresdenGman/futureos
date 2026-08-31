'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleDot,
  GitBranch,
  Lightbulb,
  LoaderCircle,
  ShieldCheck,
  Sigma,
  Sparkles,
  Target,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { decisionScore } from '@/lib/decision-math';

const steps = ['Frame', 'Compare', 'Commit'];
const options = [
  {
    id: 'controlled',
    name: 'Run a controlled experiment',
    expectedValue: 180000,
    reversibility: 90,
    probability: 64,
    note: 'Limits downside and preserves the option to expand.',
  },
  {
    id: 'full',
    name: 'Commit to the full change',
    expectedValue: 300000,
    reversibility: 35,
    probability: 68,
    note: 'Higher upside, but trust and rollback costs compound.',
  },
  {
    id: 'hold',
    name: 'Keep the current course',
    expectedValue: 45000,
    reversibility: 100,
    probability: 38,
    note: 'Preserves stability while opportunity cost accumulates.',
  },
];

function defaultDeadline() {
  const date = new Date();
  date.setDate(date.getDate() + 45);
  return date.toISOString().slice(0, 10);
}

export function NewDecisionForm({ initialPrompt }: { initialPrompt: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState(initialPrompt);
  const [successCriteria, setSuccessCriteria] = useState('');
  const [deadline, setDeadline] = useState(defaultDeadline);
  const [optionId, setOptionId] = useState('controlled');
  const [probability, setProbability] = useState(64);
  const [expectedValue, setExpectedValue] = useState(180000);
  const [reversibility, setReversibility] = useState(90);
  const [reversalTrigger, setReversalTrigger] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const selected = options.find((item) => item.id === optionId) ?? options[0];
  const score = decisionScore(probability, expectedValue, reversibility);
  const frameReady =
    title.trim().length >= 4 &&
    question.trim().length >= 12 &&
    successCriteria.trim().length >= 8 &&
    Boolean(deadline);
  const commitReady = reversalTrigger.trim().length >= 8;
  const canContinue = step === 0 ? frameReady : step === 1 ? true : commitReady;

  const confidenceLabel = useMemo(
    () =>
      probability >= 75
        ? 'High confidence'
        : probability >= 55
          ? 'Moderate confidence'
          : 'Meaningful uncertainty',
    [probability],
  );

  function chooseOption(id: string) {
    const option = options.find((item) => item.id === id);
    if (!option) return;
    setOptionId(id);
    setProbability(option.probability);
    setExpectedValue(option.expectedValue);
    setReversibility(option.reversibility);
  }

  async function createDecision() {
    if (!commitReady || saving) return;
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          question,
          successCriteria,
          deadline,
          selectedOption: selected.name,
          expectedValue,
          reversibility,
          probability,
          reversalTrigger,
        }),
      });
      const data = (await response.json()) as { id?: string; error?: string };
      if (!response.ok || !data.id)
        throw new Error(data.error ?? 'The decision could not be saved.');
      router.push(`/decisions/${data.id}?created=1`);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'The decision could not be saved.',
      );
      setSaving(false);
    }
  }

  return (
    <div className="page-shell py-8 pb-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/workspace"
            className="focus-ring inline-flex items-center gap-2 rounded-lg text-sm font-bold text-slate-500 hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" /> Workspace
          </Link>
          <p className="eyebrow mt-6">New decision contract</p>
          <h1 className="mt-2 font-editorial text-4xl tracking-[-0.045em] text-[#0b1511] sm:text-5xl">
            Make the choice testable.
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Capture what you believe before the outcome can rewrite the story.
          </p>
        </div>
        <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-800">
          Auto-saved when created
        </span>
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)_320px]">
        <aside className="panel h-fit p-4">
          <div className="space-y-1">
            {steps.map((label, index) => (
              <button
                key={label}
                onClick={() => index <= step && setStep(index)}
                disabled={index > step}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${index === step ? 'bg-[#0b1511] text-white' : index < step ? 'text-slate-700 hover:bg-slate-50' : 'cursor-not-allowed text-slate-300'}`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black ${index === step ? 'bg-[#d4ff4f] text-[#0b1511]' : index < step ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}
                >
                  {index < step ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </span>
                <span className="text-sm font-black">{label}</span>
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-xl bg-orange-50 p-3 text-xs leading-5 text-orange-800">
            <Lightbulb className="mb-2 h-4 w-4" />
            Strong decisions are specific, measurable and reversible where
            possible.
          </div>
        </aside>

        <section className="panel min-h-[610px] p-6 sm:p-8">
          {step === 0 && (
            <div className="space-y-6">
              <StepHeader
                icon={Target}
                eyebrow="01 · Frame"
                title="What decision are you actually making?"
                description="Separate the action you control from the outcome you hope to influence."
              />
              <Field label="Decision title" hint="Use an action, not a topic.">
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={120}
                  placeholder="e.g. Launch the team plan"
                  className="h-11 rounded-xl bg-white"
                />
              </Field>
              <Field
                label="Question reality can answer"
                hint="Include the action, measurable result and time horizon."
              >
                <Textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  maxLength={600}
                  placeholder="If we take this action, will this observable result happen by this date?"
                  className="min-h-[120px] rounded-xl bg-white leading-6"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
                <Field
                  label="Success means"
                  hint="What must be observably true?"
                >
                  <Textarea
                    value={successCriteria}
                    onChange={(event) => setSuccessCriteria(event.target.value)}
                    maxLength={500}
                    placeholder="A metric crosses a threshold without violating a guardrail."
                    className="min-h-[100px] rounded-xl bg-white"
                  />
                </Field>
                <Field label="Resolve by" hint="Set the feedback date.">
                  <Input
                    type="date"
                    value={deadline}
                    onChange={(event) => setDeadline(event.target.value)}
                    className="h-11 rounded-xl bg-white"
                  />
                </Field>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <StepHeader
                icon={GitBranch}
                eyebrow="02 · Compare"
                title="Which path earns the right to be tried?"
                description="Estimate the outcome conditional on each action—not only what you hope will happen."
              />
              <div className="space-y-3">
                {options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => chooseOption(option.id)}
                    aria-label={`Choose ${option.name}`}
                    className={`w-full rounded-2xl border p-4 text-left transition ${optionId === option.id ? 'border-emerald-400 bg-emerald-50 ring-2 ring-emerald-100' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${optionId === option.id ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-slate-300'}`}
                      >
                        {optionId === option.id && (
                          <Check className="h-3 w-3" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-slate-900">
                          {option.name}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {option.note}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-editorial text-2xl text-slate-950">
                          {decisionScore(
                            option.probability,
                            option.expectedValue,
                            option.reversibility,
                          )}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400">
                          SCORE
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="grid gap-4 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-900/5 sm:grid-cols-3">
                <NumberField
                  label="Expected value"
                  prefix="$"
                  value={expectedValue}
                  onChange={setExpectedValue}
                  max={1000000000}
                />
                <NumberField
                  label="Reversibility"
                  suffix="%"
                  value={reversibility}
                  onChange={setReversibility}
                  max={100}
                />
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="probability"
                      className="text-xs font-black text-slate-700"
                    >
                      Probability
                    </label>
                    <span className="font-editorial text-2xl text-slate-950">
                      {probability}%
                    </span>
                  </div>
                  <input
                    id="probability"
                    type="range"
                    min="1"
                    max="99"
                    value={probability}
                    onChange={(event) =>
                      setProbability(Number(event.target.value))
                    }
                    className="mt-3 w-full"
                  />
                  <p className="mt-2 text-[10px] text-slate-400">
                    {confidenceLabel}
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
                <Sigma className="mr-2 inline h-4 w-4 text-orange-600" />
                Decision score combines probability, logarithmic value and
                option value. It guides attention; it does not replace judgment.
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <StepHeader
                icon={ShieldCheck}
                eyebrow="03 · Commit"
                title="Pre-commit to how evidence will change the action."
                description="The best time to define an exit condition is before sunk cost and identity enter the room."
              />
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">
                  Selected path
                </p>
                <p className="mt-2 text-lg font-black text-emerald-950">
                  {selected.name}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <CommitFact label="Probability" value={`${probability}%`} />
                  <CommitFact label="Reversible" value={`${reversibility}%`} />
                  <CommitFact label="Score" value={String(score)} />
                </div>
              </div>
              <Field
                label="Reversal trigger"
                hint="What evidence forces you to stop, pause or change course?"
              >
                <Textarea
                  value={reversalTrigger}
                  onChange={(event) => setReversalTrigger(event.target.value)}
                  maxLength={500}
                  placeholder="Rollback if the guardrail metric falls below X for Y consecutive days…"
                  className="min-h-[120px] rounded-xl bg-white leading-6"
                />
              </Field>
              <div className="rounded-2xl border border-slate-200 p-5">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Contract checks
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    ['Action is explicit', true],
                    ['Outcome is measurable', successCriteria.length >= 8],
                    ['Deadline is fixed', Boolean(deadline)],
                    ['Exit condition exists', commitReady],
                  ].map(([label, ready]) => (
                    <div
                      key={String(label)}
                      className={`flex items-center gap-2 text-sm font-bold ${ready ? 'text-slate-700' : 'text-slate-300'}`}
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full ${ready ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}`}
                      >
                        {ready && <Check className="h-3 w-3" />}
                      </span>
                      {label}
                    </div>
                  ))}
                </div>
              </div>
              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800"
                >
                  {error}
                </p>
              )}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
            <button
              disabled={step === 0 || saving}
              onClick={() => setStep((value) => Math.max(0, value - 1))}
              className="focus-ring rounded-xl px-4 py-2 text-sm font-black text-slate-500 hover:bg-slate-50 disabled:opacity-30"
            >
              Back
            </button>
            {step < 2 ? (
              <button
                disabled={!canContinue}
                onClick={() => setStep((value) => value + 1)}
                className="focus-ring inline-flex h-10 items-center gap-2 rounded-xl bg-[#0b1511] px-5 text-sm font-black text-white disabled:opacity-35"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                disabled={!canContinue || saving}
                onClick={createDecision}
                className="focus-ring inline-flex h-10 items-center gap-2 rounded-xl bg-[#0b1511] px-5 text-sm font-black text-white disabled:opacity-35"
              >
                {saving ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 text-[#d4ff4f]" />
                )}
                {saving ? 'Creating…' : 'Create contract'}
              </button>
            )}
          </div>
        </section>

        <aside className="panel h-fit overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Live contract preview
            </p>
          </div>
          <div className="space-y-5 p-5">
            <div>
              <p className="text-sm font-black leading-5 text-slate-900">
                {title || 'Untitled decision'}
              </p>
              <p className="mt-2 line-clamp-5 text-xs leading-5 text-slate-500">
                {question || 'Your testable outcome question will appear here.'}
              </p>
            </div>
            <div className="rounded-2xl bg-[#0b1511] p-4 text-white">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#d4ff4f]">
                Current belief
              </p>
              <div className="mt-2 flex items-end justify-between">
                <span className="font-editorial text-4xl">{probability}%</span>
                <CircleDot className="mb-1 h-4 w-4 text-white/40" />
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#d4ff4f]"
                  style={{ width: `${probability}%` }}
                />
              </div>
            </div>
            <PreviewRow label="Chosen action" value={selected.name} />
            <PreviewRow label="Resolve by" value={deadline} />
            <PreviewRow
              label="Success means"
              value={successCriteria || 'Not set'}
            />
            <div className="rounded-xl bg-orange-50 p-3 text-[11px] leading-5 text-orange-800">
              FutureOS will version every later probability update so hindsight
              cannot rewrite this original belief.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StepHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: typeof Target;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
        <Icon className="h-4 w-4" />
        {eyebrow}
      </div>
      <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-slate-950">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}
function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-800">{label}</span>
      <span className="ml-2 text-xs text-slate-400">{hint}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  max,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  max: number;
}) {
  return (
    <label>
      <span className="text-xs font-black text-slate-700">{label}</span>
      <div className="mt-2 flex h-10 items-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-400">
        {prefix}
        <input
          type="number"
          min="0"
          max={max}
          value={value}
          onChange={(event) =>
            onChange(Math.max(0, Math.min(max, Number(event.target.value))))
          }
          className="min-w-0 flex-1 bg-transparent px-1 text-slate-900 outline-none"
        />
        {suffix}
      </div>
    </label>
  );
}
function CommitFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/70 p-3 text-center">
      <p className="text-[9px] font-bold uppercase text-emerald-700">{label}</p>
      <p className="mt-1 text-sm font-black text-emerald-950">{value}</p>
    </div>
  );
}
function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-slate-100 pt-4">
      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-1.5 text-xs leading-5 text-slate-600">{value}</p>
    </div>
  );
}

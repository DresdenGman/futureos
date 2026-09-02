'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BrainCircuit,
  CalendarClock,
  Check,
  CheckCircle2,
  CircleDot,
  Gauge,
  GitBranch,
  LoaderCircle,
  RefreshCcw,
  ShieldCheck,
  Sigma,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DeleteDecisionDialog } from '@/components/delete-decision-dialog';
import { decisionScore } from '@/lib/decision-math';
import type { Decision } from '@/lib/types';

export function DecisionDetail({
  id,
  justCreated,
}: {
  id: string;
  justCreated: boolean;
}) {
  const [decision, setDecision] = useState<Decision | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [probability, setProbability] = useState(50);
  const [evidence, setEvidence] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showResolve, setShowResolve] = useState(false);
  const [outcome, setOutcome] = useState(true);
  const [outcomeMetric, setOutcomeMetric] = useState('');
  const [outcomeNote, setOutcomeNote] = useState('');
  const [now] = useState(() => Date.now());

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/decisions/${id}`, {
        cache: 'no-store',
      });
      const data = (await response.json()) as {
        decision?: Decision;
        error?: string;
      };
      if (!response.ok || !data.decision)
        throw new Error(data.error ?? 'Unable to load this decision.');
      setDecision(data.decision);
      setProbability(data.decision.probability);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'Unable to load this decision.',
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  const firstProbability =
    decision?.updates?.find((update) => update.baseline)?.probability ??
    decision?.probability ??
    0;
  const delta = decision ? decision.probability - firstProbability : 0;
  const score = decision
    ? decisionScore(
        decision.probability,
        decision.expectedValue,
        decision.reversibility,
      )
    : 0;
  const daysLeft = useMemo(
    () =>
      decision
        ? Math.ceil(
            (new Date(`${decision.deadline}T12:00:00`).getTime() - now) /
              86400000,
          )
        : 0,
    [decision, now],
  );

  async function submitUpdate() {
    if (!evidence.trim() || updating) return;
    setUpdating(true);
    setError('');
    try {
      const response = await fetch(`/api/decisions/${id}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ probability, evidence }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok)
        throw new Error(data.error ?? 'The update could not be saved.');
      setEvidence('');
      setShowUpdate(false);
      await load();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'The update could not be saved.',
      );
    } finally {
      setUpdating(false);
    }
  }

  async function resolveDecision() {
    if (!outcomeMetric.trim() || !outcomeNote.trim() || updating) return;
    setUpdating(true);
    setError('');
    try {
      const response = await fetch(`/api/decisions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcome, outcomeMetric, outcomeNote }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok)
        throw new Error(data.error ?? 'The result could not be saved.');
      setShowResolve(false);
      await load();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'The result could not be saved.',
      );
    } finally {
      setUpdating(false);
    }
  }

  if (loading)
    return (
      <div className="page-shell flex min-h-[60vh] items-center justify-center gap-3 text-sm font-bold text-slate-400">
        <LoaderCircle className="h-5 w-5 animate-spin" /> Loading decision
        contract…
      </div>
    );
  if (!decision)
    return (
      <div className="page-shell py-20 text-center">
        <X className="mx-auto h-8 w-8 text-rose-400" />
        <h1 className="mt-4 text-xl font-black text-slate-950">
          {error || 'Decision not found.'}
        </h1>
        <Link
          href="/workspace"
          className="mt-5 inline-flex items-center gap-2 text-sm font-black text-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to workspace
        </Link>
      </div>
    );

  return (
    <div className="page-shell space-y-5 py-8 pb-20">
      {justCreated && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-950">
          <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-700" />
          <div>
            <p className="text-sm font-black">Decision contract created.</p>
            <p className="mt-1 text-xs text-emerald-800/70">
              Your original belief is now preserved. Return when material
              evidence arrives.
            </p>
          </div>
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-bold text-rose-800"
        >
          <span>{error}</span>
          <button onClick={() => setError('')} aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/workspace"
            className="focus-ring inline-flex items-center gap-2 rounded-lg text-sm font-bold text-slate-500 hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" /> Workspace
          </Link>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${decision.status === 'open' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}
            >
              {decision.status}
            </span>
            {decision.status === 'open' && (
              <span
                className={`rounded-full px-2.5 py-1 text-[9px] font-black ${daysLeft < 0 ? 'bg-rose-100 text-rose-800' : daysLeft <= 14 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'}`}
              >
                {daysLeft < 0
                  ? `${Math.abs(daysLeft)}D OVERDUE`
                  : `${daysLeft}D TO RESOLUTION`}
              </span>
            )}
          </div>
          <h1 className="mt-3 max-w-4xl font-editorial text-4xl leading-tight tracking-[-0.045em] text-[#0b1511] sm:text-5xl">
            {decision.title}
          </h1>
        </div>
        {decision.status === 'open' && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowUpdate(true);
                setShowResolve(false);
              }}
              className="focus-ring inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700 hover:border-slate-300"
            >
              <TrendingUp className="h-4 w-4 text-emerald-600" /> Add evidence
            </button>
            <button
              onClick={() => {
                setShowResolve(true);
                setShowUpdate(false);
              }}
              className="focus-ring inline-flex h-10 items-center gap-2 rounded-xl bg-[#0b1511] px-4 text-xs font-black text-white"
            >
              <Check className="h-4 w-4 text-[#d4ff4f]" /> Resolve
            </button>
          </div>
        )}
      </header>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[14px] bg-[#0b1511] p-6 text-white shadow-[0_24px_60px_rgba(23,32,29,0.16)] sm:p-8">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#d4ff4f]">
                Question reality will answer
              </p>
              <h2 className="mt-4 text-2xl font-black leading-9">
                {decision.question}
              </h2>
              <div className="mt-8 grid grid-cols-2 gap-3">
                <DarkFact
                  label="Chosen action"
                  value={decision.selectedOption}
                  icon={GitBranch}
                />
                <DarkFact
                  label="Success means"
                  value={decision.successCriteria}
                  icon={Target}
                />
              </div>
            </div>
            <div className="panel p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="eyebrow">Current belief</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {delta === 0
                      ? 'Original forecast'
                      : `${delta > 0 ? '+' : ''}${delta} points from first estimate`}
                  </p>
                </div>
                <CircleDot className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="mt-7 flex items-end gap-2">
                <span className="font-editorial text-7xl leading-none tracking-[-0.06em] text-slate-950">
                  {decision.probability}
                </span>
                <span className="mb-1 text-2xl text-slate-300">%</span>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#0b1511] transition-[width]"
                  style={{ width: `${decision.probability}%` }}
                />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <LightFact label="Decision score" value={String(score)} />
                <LightFact
                  label="Reversibility"
                  value={`${decision.reversibility}%`}
                />
              </div>
            </div>
          </div>

          {showUpdate && (
            <section className="panel border-emerald-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="eyebrow">Evidence update</p>
                  <h2 className="mt-2 text-xl font-black text-slate-950">
                    Let reality change the probability.
                  </h2>
                </div>
                <button
                  onClick={() => setShowUpdate(false)}
                  aria-label="Close update"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </div>
              <div className="mt-6 block">
                <div className="flex items-end justify-between">
                  <label
                    htmlFor="updated-probability"
                    className="text-sm font-black text-slate-800"
                  >
                    Updated probability
                  </label>
                  <span className="font-editorial text-3xl text-slate-950">
                    {probability}%
                  </span>
                </div>
                <input
                  id="updated-probability"
                  type="range"
                  min="1"
                  max="99"
                  value={probability}
                  onChange={(event) =>
                    setProbability(Number(event.target.value))
                  }
                  className="mt-3 w-full"
                />
              </div>
              <label htmlFor="evidence-note" className="mt-5 block">
                <span className="text-sm font-black text-slate-800">
                  What material evidence arrived?
                </span>
                <Textarea
                  id="evidence-note"
                  value={evidence}
                  onChange={(event) => setEvidence(event.target.value)}
                  maxLength={500}
                  placeholder="State the observable signal—not a new opinion."
                  className="mt-2 min-h-[100px] rounded-xl bg-white"
                />
              </label>
              <div className="mt-5 flex justify-end">
                <button
                  onClick={submitUpdate}
                  disabled={evidence.trim().length < 4 || updating}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0b1511] px-5 text-xs font-black text-white disabled:opacity-35"
                >
                  {updating ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-[#d4ff4f]" />
                  )}{' '}
                  Save belief update
                </button>
              </div>
            </section>
          )}

          {showResolve && (
            <section className="panel border-orange-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-700">
                    Resolution
                  </p>
                  <h2 className="mt-2 text-xl font-black text-slate-950">
                    What did reality decide?
                  </h2>
                </div>
                <button
                  onClick={() => setShowResolve(false)}
                  aria-label="Close resolution"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setOutcome(true)}
                  className={`rounded-2xl border p-4 text-left ${outcome ? 'border-emerald-400 bg-emerald-50 ring-2 ring-emerald-100' : 'border-slate-200'}`}
                >
                  <CheckCircle2
                    className={`h-5 w-5 ${outcome ? 'text-emerald-700' : 'text-slate-300'}`}
                  />
                  <p className="mt-3 text-sm font-black text-slate-900">Yes</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Success criteria were met.
                  </p>
                </button>
                <button
                  onClick={() => setOutcome(false)}
                  className={`rounded-2xl border p-4 text-left ${!outcome ? 'border-rose-300 bg-rose-50 ring-2 ring-rose-100' : 'border-slate-200'}`}
                >
                  <X
                    className={`h-5 w-5 ${!outcome ? 'text-rose-700' : 'text-slate-300'}`}
                  />
                  <p className="mt-3 text-sm font-black text-slate-900">No</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Success criteria were not met.
                  </p>
                </button>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-[180px_1fr]">
                <label htmlFor="outcome-metric">
                  <span className="text-sm font-black text-slate-800">
                    Observed result
                  </span>
                  <Input
                    id="outcome-metric"
                    value={outcomeMetric}
                    onChange={(event) => setOutcomeMetric(event.target.value)}
                    maxLength={100}
                    placeholder="e.g. +21%"
                    className="mt-2 h-11 rounded-xl"
                  />
                </label>
                <label htmlFor="outcome-note">
                  <span className="text-sm font-black text-slate-800">
                    What should the next decision remember?
                  </span>
                  <Textarea
                    id="outcome-note"
                    value={outcomeNote}
                    onChange={(event) => setOutcomeNote(event.target.value)}
                    maxLength={500}
                    placeholder="Separate process quality from luck and record the reusable lesson."
                    className="mt-2 min-h-[100px] rounded-xl"
                  />
                </label>
              </div>
              <div className="mt-5 flex justify-end">
                <button
                  onClick={resolveDecision}
                  disabled={
                    !outcomeMetric.trim() ||
                    outcomeNote.trim().length < 4 ||
                    updating
                  }
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0b1511] px-5 text-xs font-black text-white disabled:opacity-35"
                >
                  {updating ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 text-[#d4ff4f]" />
                  )}{' '}
                  Resolve and learn
                </button>
              </div>
            </section>
          )}

          <section className="panel overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-5">
              <p className="eyebrow">Belief history</p>
              <h2 className="mt-1 text-lg font-black text-slate-950">
                An audit trail hindsight cannot rewrite.
              </h2>
            </div>
            <div className="p-6">
              <TimelineItem
                probability={firstProbability}
                title="Original forecast"
                note="Captured when the decision contract was created."
                date={decision.createdAt}
                first
              />
              {decision.updates
                ?.filter((update) => !update.baseline)
                .map((update) => (
                  <TimelineItem
                    key={update.id}
                    probability={update.probability}
                    title="Evidence update"
                    note={update.evidence}
                    date={update.createdAt}
                  />
                ))}
              {!decision.updates?.some((update) => !update.baseline) && (
                <div className="ml-5 border-l border-dashed border-slate-200 py-6 pl-8 text-xs leading-5 text-slate-400">
                  No updates yet. Add one only when material evidence should
                  change the belief.
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          {decision.status === 'resolved' ? (
            <div
              className={`rounded-[12px] p-6 ${decision.outcome ? 'bg-emerald-950 text-white' : 'bg-rose-950 text-white'}`}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                Resolved outcome
              </p>
              <div className="mt-3 flex items-end justify-between">
                <span className="font-editorial text-5xl">
                  {decision.outcome ? 'Yes' : 'No'}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black">
                  {decision.outcomeMetric}
                </span>
              </div>
              <p className="mt-5 border-t border-white/10 pt-5 text-sm leading-6 text-white/65">
                {decision.outcomeNote}
              </p>
            </div>
          ) : (
            <div className="rounded-[12px] border border-rose-200 bg-rose-50 p-5">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-rose-700">
                <ShieldCheck className="h-4 w-4" /> Pre-committed exit
              </div>
              <p className="mt-3 text-sm font-black leading-6 text-rose-950">
                {decision.reversalTrigger}
              </p>
              <p className="mt-3 text-xs leading-5 text-rose-800/60">
                This condition was written before the outcome. Treat it as a
                commitment, not a suggestion.
              </p>
            </div>
          )}
          <div className="panel p-5">
            <p className="eyebrow">Decision mathematics</p>
            <div className="mt-4 space-y-4">
              <MathRow
                icon={Sigma}
                label="Expected value"
                value={`$${decision.expectedValue.toLocaleString()}`}
              />
              <MathRow
                icon={RefreshCcw}
                label="Option value"
                value={`${decision.reversibility}%`}
              />
              <MathRow
                icon={Gauge}
                label="Decision score"
                value={`${score}/100`}
              />
              <MathRow
                icon={CalendarClock}
                label="Resolution date"
                value={formatDate(decision.deadline)}
              />
            </div>
            <p className="mt-5 rounded-xl bg-slate-50 p-3 text-[10px] leading-5 text-slate-500">
              Score = confidence × 0.58 + logarithmic value × 0.24 +
              reversibility × 0.18.
            </p>
          </div>
          <div className="rounded-[12px] border border-orange-200 bg-orange-50 p-5">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-orange-700">
              <BrainCircuit className="h-4 w-4" /> Reflection prompt
            </div>
            <p className="mt-3 text-sm font-black leading-6 text-orange-950">
              What evidence would make the opposite action clearly better?
            </p>
            <p className="mt-2 text-xs leading-5 text-orange-800/60">
              If nothing could change the answer, this is a commitment—not a
              forecast.
            </p>
          </div>
          <div className="rounded-[12px] border border-rose-200 bg-rose-50/60 p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-rose-700">
              Data control
            </p>
            <p className="mt-2 text-xs leading-5 text-rose-900/65">
              Remove this record and its complete belief history permanently.
            </p>
            <div className="mt-4">
              <DeleteDecisionDialog id={decision.id} title={decision.title} />
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function DarkFact({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Target;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-white/35">
        <Icon className="h-3.5 w-3.5 text-[#d4ff4f]" />
        {label}
      </div>
      <p className="mt-2 text-xs font-bold leading-5 text-white/75">{value}</p>
    </div>
  );
}
function LightFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[9px] font-bold uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}
function TimelineItem({
  probability,
  title,
  note,
  date,
  first,
}: {
  probability: number;
  title: string;
  note: string;
  date: string;
  first?: boolean;
}) {
  return (
    <div className="relative flex gap-4 pb-6 last:pb-0">
      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0b1511] font-editorial text-sm text-[#d4ff4f]">
        {probability}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-black text-slate-900">{title}</p>
          <span className="text-[10px] font-bold text-slate-400">
            {formatDateTime(date)}
          </span>
        </div>
        <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p>
        {first && (
          <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-1 text-[9px] font-black text-slate-500">
            IMMUTABLE BASELINE
          </span>
        )}
      </div>
      <span className="absolute bottom-0 left-5 top-10 border-l border-dashed border-slate-200 last:hidden" />
    </div>
  );
}
function MathRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Sigma;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-xs font-bold text-slate-500">
        <Icon className="h-4 w-4 text-slate-400" />
        {label}
      </span>
      <span className="text-xs font-black text-slate-900">{value}</span>
    </div>
  );
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00`));
}
function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

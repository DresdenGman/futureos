'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  CircleDot,
  Gauge,
  Lightbulb,
  LoaderCircle,
  RefreshCcw,
  Sigma,
  Sparkles,
  Target,
} from 'lucide-react';
import type { Decision, DecisionInsights } from '@/lib/types';

export function MemoryClient() {
  const [insights, setInsights] = useState<DecisionInsights | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/insights', { cache: 'no-store' });
      const data = (await response.json()) as {
        insights?: DecisionInsights;
        decisions?: Decision[];
        error?: string;
      };
      if (!response.ok || !data.insights)
        throw new Error(data.error ?? 'Unable to build your decision memory.');
      setInsights(data.insights);
      setDecisions(data.decisions ?? []);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'Unable to build your decision memory.',
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  if (loading)
    return (
      <div className="page-shell flex min-h-[60vh] items-center justify-center gap-3 text-sm font-bold text-slate-400">
        <LoaderCircle className="h-5 w-5 animate-spin" /> Building your decision
        memory…
      </div>
    );
  if (!insights)
    return (
      <div className="page-shell py-20 text-center">
        <RefreshCcw className="mx-auto h-8 w-8 text-rose-400" />
        <h1 className="mt-4 text-xl font-black text-slate-950">{error}</h1>
        <button
          onClick={load}
          className="mt-4 rounded-xl bg-slate-950 px-4 py-2 text-xs font-black text-white"
        >
          Try again
        </button>
      </div>
    );

  const resolved = decisions.filter(
    (decision) => decision.status === 'resolved',
  );
  return (
    <div className="page-shell space-y-6 py-8 pb-20">
      <header>
        <p className="eyebrow">Decision memory</p>
        <h1 className="mt-2 font-editorial text-4xl tracking-[-0.045em] text-[#0b1511] sm:text-5xl">
          Know how you decide—not just what happened.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          FutureOS measures calibration, update behavior and process quality
          across resolved decisions. The signal becomes meaningful as your
          history grows.
        </p>
      </header>

      {!insights.total ? (
        <EmptyMemory />
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MemoryMetric
              icon={Gauge}
              label="Calibration"
              value={
                insights.calibrationScore === null
                  ? '—'
                  : `${insights.calibrationScore}/100`
              }
              note={
                insights.resolved
                  ? 'Higher means confidence better matched outcomes'
                  : 'Resolve decisions to calculate'
              }
            />
            <MemoryMetric
              icon={Sigma}
              label="Brier score"
              value={
                insights.brierScore === null
                  ? '—'
                  : insights.brierScore.toFixed(3)
              }
              note="Lower is better · 0 is perfect"
            />
            <MemoryMetric
              icon={RefreshCcw}
              label="Update rate"
              value={`${insights.updateRate}%`}
              note="Evidence updates per decision"
            />
            <MemoryMetric
              icon={CheckCircle2}
              label="Learning cases"
              value={String(insights.resolved)}
              note="Resolved decisions in memory"
            />
          </section>

          <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[14px] bg-[#0b1511] p-6 text-white sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#d4ff4f]">
                    Calibration model
                  </p>
                  <h2 className="mt-2 text-xl font-black">
                    Does your confidence match reality?
                  </h2>
                </div>
                <BrainCircuit className="h-6 w-6 text-white/30" />
              </div>
              <div className="mt-8 grid grid-cols-5 gap-2">
                {[10, 30, 50, 70, 90].map((bucket) => {
                  const count = resolved.filter(
                    (item) => Math.abs(item.probability - bucket) <= 10,
                  ).length;
                  const hit = resolved.filter(
                    (item) =>
                      Math.abs(item.probability - bucket) <= 10 && item.outcome,
                  ).length;
                  const actual = count ? Math.round((hit / count) * 100) : 0;
                  return (
                    <div key={bucket} className="text-center">
                      <div className="flex h-36 items-end justify-center rounded-xl bg-white/5 p-2">
                        <div
                          className="w-full rounded-lg bg-[#d4ff4f] transition-all"
                          style={{
                            height: `${Math.max(8, actual)}%`,
                            opacity: count ? 1 : 0.15,
                          }}
                        />
                      </div>
                      <p className="mt-2 text-xs font-black">{bucket}%</p>
                      <p className="mt-1 text-[9px] text-white/35">
                        {count ? `${actual}% actual` : 'no data'}
                      </p>
                    </div>
                  );
                })}
              </div>
              <p className="mt-6 text-xs leading-5 text-white/45">
                Each bar compares forecast confidence with observed frequency.
                Well-calibrated 70% predictions should resolve “yes” roughly
                seven times out of ten.
              </p>
            </div>
            <div className="space-y-4">
              <InsightCard
                icon={Sparkles}
                label="Strongest habit"
                title={insights.strongestHabit}
                copy="FutureOS inferred this from the structure and resolution behavior in your current decision history."
                tone="green"
              />
              <InsightCard
                icon={Target}
                label="Growth edge"
                title={insights.growthEdge}
                copy="This is the highest-leverage behavior to improve before adding more prediction complexity."
                tone="orange"
              />
              <div className="rounded-[12px] border border-amber-200 bg-amber-50 p-5">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-amber-800">
                  <Lightbulb className="h-4 w-4" /> Interpretation rule
                </div>
                <p className="mt-3 text-sm font-black text-amber-950">
                  Good process can produce a bad outcome.
                </p>
                <p className="mt-2 text-xs leading-5 text-amber-900/65">
                  Judge a decision by what was knowable at the time. Judge
                  calibration only across many comparable forecasts.
                </p>
              </div>
            </div>
          </section>

          <section className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <p className="eyebrow">Resolved lessons</p>
                <h2 className="mt-1 text-lg font-black text-slate-950">
                  What reality added to the system.
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {resolved.length} total
              </span>
            </div>
            {resolved.length ? (
              <div className="divide-y divide-slate-100">
                {resolved.slice(0, 8).map((decision) => (
                  <Link
                    key={decision.id}
                    href={`/decisions/${decision.id}`}
                    className="group grid gap-3 p-5 transition hover:bg-slate-50 sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-lg ${decision.outcome ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
                        >
                          {decision.outcome ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <CircleDot className="h-3.5 w-3.5" />
                          )}
                        </span>
                        <h3 className="text-sm font-black text-slate-900">
                          {decision.title}
                        </h3>
                      </div>
                      <p className="mt-2 line-clamp-1 text-xs text-slate-500">
                        {decision.outcomeNote}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <p className="text-sm font-black text-slate-950">
                          {decision.outcomeMetric}
                        </p>
                        <p className="text-[9px] font-bold uppercase text-slate-400">
                          Observed
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-6 py-14 text-center">
                <p className="text-sm font-black text-slate-700">
                  No resolved decisions yet.
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  When a decision reaches its deadline, resolve it to begin
                  calibration.
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function MemoryMetric({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="panel p-5">
      <Icon className="h-5 w-5 text-slate-400" />
      <p className="mt-5 text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-black tracking-[-0.05em] text-slate-950">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-slate-400">{note}</p>
    </div>
  );
}
function InsightCard({
  icon: Icon,
  label,
  title,
  copy,
  tone,
}: {
  icon: typeof Sparkles;
  label: string;
  title: string;
  copy: string;
  tone: 'green' | 'orange';
}) {
  const colors =
    tone === 'green'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : 'border-orange-200 bg-orange-50 text-orange-700';
  return (
    <div className={`rounded-[12px] border p-5 ${colors}`}>
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em]">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-3 text-sm font-black text-slate-950">{title}</p>
      <p className="mt-2 text-xs leading-5 text-slate-600">{copy}</p>
    </div>
  );
}
function EmptyMemory() {
  return (
    <div className="subtle-grid panel px-6 py-20 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0b1511] text-[#d4ff4f]">
        <BrainCircuit className="h-6 w-6" />
      </span>
      <h2 className="mt-5 text-xl font-black text-slate-950">
        Memory needs decisions.
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Create a decision, update it when evidence arrives and resolve the
        result. FutureOS will turn that trail into calibration insight.
      </p>
      <Link
        href="/decisions/new"
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-[#0b1511] px-5 text-xs font-black text-white"
      >
        Create your first decision <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

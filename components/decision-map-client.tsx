'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CircleDot,
  GitBranch,
  Layers3,
  LoaderCircle,
  Plus,
  RefreshCcw,
  Sigma,
} from 'lucide-react';
import type { Decision } from '@/lib/types';

export function DecisionMapClient() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'all' | 'open' | 'resolved'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/decisions', { cache: 'no-store' });
      const data = (await response.json()) as {
        decisions?: Decision[];
        error?: string;
      };
      if (!response.ok)
        throw new Error(data.error ?? 'Unable to load the map.');
      setDecisions(data.decisions ?? []);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Unable to load the map.',
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);
  const visible = useMemo(
    () =>
      decisions.filter(
        (decision) => status === 'all' || decision.status === status,
      ),
    [decisions, status],
  );

  return (
    <div className="page-shell space-y-6 py-8 pb-20">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Decision map</p>
          <h1 className="mt-2 font-editorial text-4xl tracking-[-0.045em] text-[#0b1511] sm:text-5xl">
            See where uncertainty deserves attention.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Each decision is positioned by uncertainty and expected impact.
            Bubble size reflects reversibility: larger choices preserve more
            option value.
          </p>
        </div>
        <Link
          href="/decisions/new"
          className="focus-ring inline-flex h-10 items-center gap-2 rounded-xl bg-[#0b1511] px-4 text-xs font-black text-white"
        >
          <Plus className="h-4 w-4 text-[#d4ff4f]" /> New decision
        </Link>
      </header>
      <section className="panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs font-black text-slate-700">
            <Layers3 className="h-4 w-4 text-emerald-600" /> Portfolio attention
            map
          </div>
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {(['all', 'open', 'resolved'] as const).map((item) => (
              <button
                key={item}
                onClick={() => setStatus(item)}
                className={`rounded-lg px-3 py-1.5 text-xs font-black capitalize ${status === item ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-400'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="flex min-h-[520px] items-center justify-center gap-3 text-sm font-bold text-slate-400">
            <LoaderCircle className="h-5 w-5 animate-spin" /> Mapping decisions…
          </div>
        ) : error ? (
          <div className="min-h-[520px] px-6 py-20 text-center">
            <RefreshCcw className="mx-auto h-7 w-7 text-rose-400" />
            <p className="mt-3 text-sm font-black text-slate-800">{error}</p>
            <button
              onClick={load}
              className="mt-3 text-xs font-black text-emerald-700"
            >
              Try again
            </button>
          </div>
        ) : !decisions.length ? (
          <EmptyMap />
        ) : (
          <MapPlot decisions={visible} />
        )}
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        <Guide
          icon={CircleDot}
          title="High uncertainty"
          copy="Beliefs near 50% have the widest plausible outcome range and often deserve evidence gathering."
        />
        <Guide
          icon={Sigma}
          title="High impact"
          copy="Expected value is scaled logarithmically so one giant estimate cannot erase the rest of the portfolio."
        />
        <Guide
          icon={GitBranch}
          title="High reversibility"
          copy="Larger bubbles preserve future choices. Small irreversible decisions deserve explicit guardrails."
        />
      </div>
    </div>
  );
}

function MapPlot({ decisions }: { decisions: Decision[] }) {
  if (!decisions.length)
    return (
      <div className="flex min-h-[520px] items-center justify-center text-sm font-bold text-slate-400">
        No decisions in this filter.
      </div>
    );
  const maxLog = Math.max(
    ...decisions.map((item) => Math.log10(Math.max(10, item.expectedValue))),
    1,
  );
  return (
    <div className="relative min-h-[560px] overflow-hidden bg-[#fbfbf7] p-8 sm:p-12">
      <div className="absolute inset-12 border-b border-l border-slate-300">
        <span className="absolute -bottom-8 left-0 text-[10px] font-black uppercase tracking-wider text-slate-400">
          Lower uncertainty
        </span>
        <span className="absolute -bottom-8 right-0 text-[10px] font-black uppercase tracking-wider text-slate-400">
          Higher uncertainty
        </span>
        <span className="absolute -left-10 bottom-0 -rotate-90 origin-bottom-left text-[10px] font-black uppercase tracking-wider text-slate-400">
          Expected impact
        </span>
        <div className="absolute inset-0 subtle-grid opacity-60" />
        {decisions.map((decision, index) => {
          const uncertainty = 100 - Math.abs(decision.probability - 50) * 2;
          const x = Math.max(6, Math.min(92, uncertainty));
          const y = Math.max(
            8,
            Math.min(
              90,
              (Math.log10(Math.max(10, decision.expectedValue)) / maxLog) * 86,
            ),
          );
          const size = 44 + decision.reversibility * 0.42;
          return (
            <Link
              key={decision.id}
              href={`/decisions/${decision.id}`}
              aria-label={`${decision.title}, ${decision.probability}% probability`}
              className={`group absolute flex -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full border-2 text-center shadow-lg transition hover:z-20 hover:scale-110 focus:z-20 focus:outline-none focus:ring-2 focus:ring-emerald-600 ${decision.status === 'open' ? 'border-emerald-700 bg-[#d4ff4f] text-[#0b1511]' : 'border-slate-400 bg-slate-200 text-slate-700'}`}
              style={{
                left: `${x}%`,
                bottom: `${y}%`,
                width: size,
                height: size,
                zIndex: index + 1,
              }}
            >
              <span className="px-2 text-[10px] font-black leading-3">
                <span className="block">{decision.probability}%</span>
                <span className="mt-1 hidden max-w-24 truncate group-hover:block">
                  {decision.title}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
function EmptyMap() {
  return (
    <div className="subtle-grid flex min-h-[520px] flex-col items-center justify-center px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0b1511] text-[#d4ff4f]">
        <Layers3 className="h-6 w-6" />
      </span>
      <h2 className="mt-5 text-xl font-black text-slate-950">
        Your portfolio has no coordinates yet.
      </h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        Create a decision with probability, expected value and reversibility.
        FutureOS will place it where attention is most useful.
      </p>
      <Link
        href="/decisions/new"
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-[#0b1511] px-5 text-xs font-black text-white"
      >
        Create a decision <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
function Guide({
  icon: Icon,
  title,
  copy,
}: {
  icon: typeof Sigma;
  title: string;
  copy: string;
}) {
  return (
    <div className="rounded-[12px] border border-slate-900/8 bg-white p-5">
      <Icon className="h-5 w-5 text-emerald-700" />
      <h2 className="mt-4 text-sm font-black text-slate-950">{title}</h2>
      <p className="mt-2 text-xs leading-5 text-slate-500">{copy}</p>
    </div>
  );
}

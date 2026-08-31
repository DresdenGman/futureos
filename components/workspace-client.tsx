'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  Gauge,
  LoaderCircle,
  Plus,
  RefreshCcw,
  Search,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import type { Decision } from '@/lib/types';

type Filter = 'all' | 'open' | 'resolved';

export function WorkspaceClient({ displayName }: { displayName: string }) {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [now] = useState(() => Date.now());

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/decisions', { cache: 'no-store' });
      if (!response.ok)
        throw new Error('Unable to load your decision workspace.');
      const data = (await response.json()) as { decisions: Decision[] };
      setDecisions(data.decisions);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'Unable to load your decision workspace.',
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
      decisions.filter((decision) => {
        const matchesFilter = filter === 'all' || decision.status === filter;
        const haystack =
          `${decision.title} ${decision.question} ${decision.selectedOption}`.toLowerCase();
        return matchesFilter && haystack.includes(query.toLowerCase());
      }),
    [decisions, filter, query],
  );

  const open = decisions.filter((decision) => decision.status === 'open');
  const dueSoon = open.filter(
    (decision) => new Date(decision.deadline).getTime() - now < 14 * 86400000,
  ).length;
  const average = decisions.length
    ? Math.round(
        decisions.reduce((sum, item) => sum + item.probability, 0) /
          decisions.length,
      )
    : 0;

  return (
    <div className="page-shell space-y-6 py-8 pb-20">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Decision workspace</p>
          <h1 className="mt-2 font-editorial text-4xl tracking-[-0.045em] text-[#0b1511] sm:text-5xl">
            Good to see you, {displayName}.
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Focus attention where uncertainty or time has changed the decision.
          </p>
        </div>
        <Link
          href="/decisions/new"
          className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0b1511] px-5 text-sm font-black text-white transition hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4 text-[#d4ff4f]" /> New decision
        </Link>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Open decisions"
          value={String(open.length)}
          note="Currently exposed to reality"
          icon={CircleDot}
        />
        <Metric
          label="Due in 14 days"
          value={String(dueSoon)}
          note="Need resolution or review"
          icon={CalendarClock}
          tone={dueSoon ? 'amber' : 'green'}
        />
        <Metric
          label="Average confidence"
          value={`${average}%`}
          note="Across your active portfolio"
          icon={Gauge}
        />
        <Metric
          label="Resolved"
          value={String(decisions.length - open.length)}
          note="Contributing to memory"
          icon={CheckCircle2}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="panel overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div
              className="flex gap-1 rounded-xl bg-slate-100 p-1"
              aria-label="Filter decisions"
            >
              {(['all', 'open', 'resolved'] as Filter[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-black capitalize transition ${filter === item ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  {item}
                </button>
              ))}
            </div>
            <label className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-slate-400">
              <Search className="h-3.5 w-3.5" />
              <span className="sr-only">Search decisions</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search decisions"
                className="w-full bg-transparent text-xs font-semibold text-slate-800 outline-none sm:w-48"
              />
            </label>
          </div>

          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} retry={load} />
          ) : !decisions.length ? (
            <EmptyState />
          ) : !visible.length ? (
            <div className="px-6 py-16 text-center">
              <Search className="mx-auto h-7 w-7 text-slate-300" />
              <p className="mt-3 text-sm font-bold text-slate-700">
                No decisions match this view.
              </p>
              <button
                onClick={() => {
                  setFilter('all');
                  setQuery('');
                }}
                className="mt-2 text-xs font-black text-emerald-700"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {visible.map((decision) => (
                <DecisionRow key={decision.id} decision={decision} now={now} />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-[12px] bg-[#0b1511] p-6 text-white shadow-[0_18px_50px_rgba(23,32,29,0.16)]">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#d4ff4f]">
              <BrainCircuit className="h-4 w-4" /> Next best action
            </div>
            {open.length ? (
              <>
                <p className="mt-4 text-lg font-bold leading-7">
                  Review the decision with the nearest deadline.
                </p>
                <p className="mt-2 text-xs leading-5 text-white/50">
                  Ask whether new evidence should change the current
                  probability—not whether the team still likes the plan.
                </p>
                <Link
                  href={`/decisions/${[...open].sort((a, b) => a.deadline.localeCompare(b.deadline))[0].id}`}
                  className="mt-5 inline-flex items-center gap-2 text-xs font-black text-[#d4ff4f]"
                >
                  Open review <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            ) : (
              <>
                <p className="mt-4 text-lg font-bold leading-7">
                  Frame one real decision.
                </p>
                <p className="mt-2 text-xs leading-5 text-white/50">
                  The system becomes useful the moment your current belief is
                  preserved before the outcome is known.
                </p>
                <Link
                  href="/decisions/new"
                  className="mt-5 inline-flex items-center gap-2 text-xs font-black text-[#d4ff4f]"
                >
                  Create one <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
          <div className="rounded-[12px] border border-orange-200 bg-orange-50 p-5">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-orange-700">
              <Sparkles className="h-4 w-4" /> Applied mathematics
            </div>
            <p className="mt-3 text-sm font-bold text-orange-950">
              Probability is a commitment, not decoration.
            </p>
            <p className="mt-2 text-xs leading-5 text-orange-800/65">
              Every resolved forecast becomes one calibration observation. Over
              time, Brier scoring shows whether 70% really means seven times out
              of ten.
            </p>
            <Link
              href="/memory"
              className="mt-4 inline-flex items-center gap-2 text-xs font-black text-orange-800"
            >
              View decision memory <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  note,
  icon: Icon,
  tone = 'green',
}: {
  label: string;
  value: string;
  note: string;
  icon: typeof Target;
  tone?: 'green' | 'amber';
}) {
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <Icon className="h-5 w-5 text-slate-400" />
        <span
          className={`h-2 w-2 rounded-full ${tone === 'amber' ? 'bg-amber-400' : 'bg-emerald-500'}`}
        />
      </div>
      <p className="mt-5 text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-black tracking-[-0.05em] text-slate-950">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-slate-400">{note}</p>
    </div>
  );
}

function DecisionRow({ decision, now }: { decision: Decision; now: number }) {
  const days = Math.ceil(
    (new Date(`${decision.deadline}T12:00:00`).getTime() - now) / 86400000,
  );
  return (
    <Link
      href={`/decisions/${decision.id}`}
      className="group grid gap-4 p-5 transition hover:bg-slate-50/80 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-wider ${decision.status === 'open' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}
          >
            {decision.status}
          </span>
          {decision.status === 'open' && days <= 14 && (
            <span className="rounded-full bg-amber-100 px-2 py-1 text-[9px] font-black text-amber-800">
              {days < 0 ? 'OVERDUE' : `${days}D LEFT`}
            </span>
          )}
        </div>
        <h2 className="mt-2 truncate text-sm font-black text-slate-950 group-hover:text-emerald-800">
          {decision.title}
        </h2>
        <p className="mt-1 line-clamp-1 text-xs text-slate-500">
          {decision.question}
        </p>
        <p className="mt-2 text-[10px] font-bold text-slate-400">
          Action · {decision.selectedOption}
        </p>
      </div>
      <div className="flex items-center gap-5">
        <div className="text-right">
          <p className="font-editorial text-3xl text-slate-950">
            {decision.probability}%
          </p>
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
            Current belief
          </p>
        </div>
        <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-700" />
      </div>
    </Link>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center gap-3 px-6 py-20 text-sm font-bold text-slate-400">
      <LoaderCircle className="h-5 w-5 animate-spin" /> Loading your decisions…
    </div>
  );
}
function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) {
  return (
    <div className="px-6 py-16 text-center">
      <RefreshCcw className="mx-auto h-7 w-7 text-rose-400" />
      <p className="mt-3 text-sm font-bold text-slate-800">{message}</p>
      <button
        onClick={retry}
        className="mt-3 rounded-xl bg-slate-950 px-4 py-2 text-xs font-black text-white"
      >
        Try again
      </button>
    </div>
  );
}
function EmptyState() {
  return (
    <div className="subtle-grid px-6 py-16 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0b1511] text-[#d4ff4f]">
        <TrendingUp className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-lg font-black text-slate-950">
        Your decision memory starts here.
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Capture a choice before the outcome is known. FutureOS will preserve the
        reasoning, track updates and help you learn from the result.
      </p>
      <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
        <Link
          href="/decisions/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0b1511] px-4 text-xs font-black text-white"
        >
          <Plus className="h-3.5 w-3.5" /> Create first decision
        </Link>
        <Link
          href="/demo"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700"
        >
          See an example
        </Link>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BarChart3, ShieldCheck } from 'lucide-react';
import { getPublicImpact } from '@/lib/public-impact';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Public impact',
  description:
    'Live, privacy-minimized evidence showing how FutureOS open decision instruments are being used.',
};

export default async function ImpactPage() {
  const impact = await getPublicImpact();
  const maxSource = Math.max(
    1,
    ...impact.sources.map((source) => source.completions),
  );

  return (
    <div>
      <section className="field-grid border-b border-ink/15">
        <div className="page-shell py-20 sm:py-28">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="measure-label">Public evidence / Live aggregate</p>
            <span className="inline-flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-ink/45">
              <span
                className={`h-2 w-2 rounded-full ${
                  impact.status === 'live' ? 'bg-signal-dark' : 'bg-amber-500'
                }`}
              />
              {impact.status === 'live'
                ? 'Measurement live'
                : 'Data unavailable'}
            </span>
          </div>
          <h1 className="mt-8 max-w-6xl text-[clamp(4.6rem,10vw,9rem)] font-medium leading-[0.82] tracking-[-0.07em] text-ink">
            Evidence before
            <span className="font-editorial font-normal italic">
              {' '}
              applause.
            </span>
          </h1>
          <p className="mt-8 max-w-2xl text-[15px] leading-7 text-ink/62">
            This page reports the full anonymous event ledger for FutureOS open
            instruments. Zero stays zero. A start is not called a user, and a
            completion is not called an outcome.
          </p>
        </div>
      </section>

      <section className="bg-ink text-bone">
        <div className="page-shell grid border-x border-white/10 sm:grid-cols-2 lg:grid-cols-4">
          <ImpactMetric
            value={impact.participantDays}
            label="Participant-days"
          />
          <ImpactMetric value={impact.starts} label="Instrument starts" />
          <ImpactMetric value={impact.completions} label="Completions" />
          <ImpactMetric
            value={`${impact.completionRate}%`}
            label="Start → completion"
          />
        </div>
      </section>

      <section className="page-shell py-20 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="measure-label">Instrument evidence / 01</p>
            <h2 className="mt-6 text-5xl font-medium leading-[0.96] tracking-[-0.055em] text-ink sm:text-6xl">
              Use, not
              <span className="font-editorial font-normal italic">
                {' '}
                impressions.
              </span>
            </h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-ink/58">
              Starts, completions and voluntary share actions are deduplicated
              once per anonymous visitor, instrument and day.
            </p>
          </div>
          <div className="border-l border-t border-ink/20">
            {impact.tools.map((tool, index) => (
              <article
                key={tool.id}
                className="grid gap-7 border-b border-r border-ink/20 p-7 sm:grid-cols-[1fr_auto] sm:p-10"
              >
                <div>
                  <p className="font-mono text-[9px] text-signal-dark">
                    0{index + 1}
                  </p>
                  <h3 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-ink">
                    {tool.label}
                  </h3>
                  <p className="mt-4 text-sm text-ink/48">
                    {tool.starts} starts · {tool.completions} completions ·{' '}
                    {tool.shares} share actions
                  </p>
                </div>
                <div className="self-end sm:text-right">
                  <p className="font-editorial text-6xl italic text-ink">
                    {tool.completionRate}%
                  </p>
                  <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.1em] text-ink/35">
                    completion rate
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-ink/15 bg-[#fbfaf6]">
        <div className="page-shell grid gap-12 py-20 lg:grid-cols-[0.72fr_1.28fr] sm:py-28">
          <div>
            <p className="measure-label">Attributed completions / 02</p>
            <h2 className="mt-6 text-5xl font-medium leading-[0.96] tracking-[-0.055em] text-ink sm:text-6xl">
              Where useful
              <span className="font-editorial font-normal italic">
                {' '}
                attention comes from.
              </span>
            </h2>
          </div>
          <div className="border-t border-ink/20">
            {impact.sources.length ? (
              impact.sources.map((source) => (
                <div
                  key={source.id}
                  className="grid grid-cols-[8rem_1fr_3rem] items-center gap-4 border-b border-ink/20 py-5"
                >
                  <span className="text-sm font-semibold text-ink">
                    {source.label}
                  </span>
                  <div className="h-2 bg-ink/8">
                    <div
                      className="h-full bg-signal-dark"
                      style={{
                        width: `${(source.completions / maxSource) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-right font-mono text-xs text-ink/48">
                    {source.completions}
                  </span>
                </div>
              ))
            ) : (
              <p className="border-b border-ink/20 py-10 text-sm leading-7 text-ink/48">
                No attributed completions yet. The empty state is part of the
                evidence.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="page-shell py-20 sm:py-28">
        <div className="grid gap-8 border border-ink/20 p-7 sm:p-10 lg:grid-cols-[0.8fr_1.2fr] lg:p-14">
          <div>
            <ShieldCheck className="h-7 w-7 text-signal-dark" />
            <h2 className="mt-6 text-4xl font-medium tracking-[-0.05em] text-ink">
              What this does not measure
            </h2>
          </div>
          <div className="space-y-5 text-sm leading-7 text-ink/58">
            <p>
              Participant-days are anonymous daily starts, not verified unique
              people. Repeat visits on different days count again. Automated or
              low-intent activity may still appear.
            </p>
            <p>
              Answers, confidence values and scores are not stored, so this page
              cannot claim learning outcomes. Improvement requires a separate
              consented study with resolved decisions.
            </p>
            <div className="flex flex-wrap gap-5 pt-2">
              <Link
                href="/research"
                className="inline-flex items-center gap-2 border-b border-ink pb-1 font-black text-ink"
              >
                Read the research protocol <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/privacy"
                className="inline-flex items-center gap-2 border-b border-ink/30 pb-1 font-bold text-ink/58"
              >
                Privacy note
              </Link>
            </div>
          </div>
        </div>
        <p className="mt-5 text-center font-mono text-[8px] uppercase tracking-[0.1em] text-ink/32">
          {impact.sinceDay
            ? `Observed ${impact.sinceDay} → ${impact.latestDay}`
            : 'No observation period yet'}
        </p>
      </section>
    </div>
  );
}

function ImpactMetric({
  value,
  label,
}: {
  value: number | string;
  label: string;
}) {
  return (
    <div className="min-h-48 border-b border-r border-white/10 p-7 sm:p-9">
      <BarChart3 className="h-4 w-4 text-signal" />
      <p className="mt-8 font-editorial text-6xl italic text-signal">{value}</p>
      <p className="mt-3 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-white/42">
        {label}
      </p>
    </div>
  );
}

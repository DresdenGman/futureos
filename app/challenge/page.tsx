import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Gauge,
  GitBranch,
  ShieldCheck,
} from 'lucide-react';

export const metadata: Metadata = {
  title: '7-day Decision Field Test',
  description:
    'Run one real, low-risk decision through a seven-day FutureOS cycle and make the evidence visible.',
  openGraph: {
    title: 'FutureOS 7-day Decision Field Test',
    description:
      'Frame one real decision, name what would change your mind, and return when the evidence moves.',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FutureOS 7-day Decision Field Test',
    description:
      'Frame one real decision, name what would change your mind, and return when the evidence moves.',
    images: ['/og.png'],
  },
};

const steps = [
  {
    number: '01',
    title: 'Frame one decision',
    copy: 'Choose a real, low-risk decision with a result you can observe. Score its structure before you know the outcome.',
    signal: '5 minutes · no account',
  },
  {
    number: '02',
    title: 'Name the reversal',
    copy: 'Write the evidence that would change your mind, the probability you assign now and the date you will return.',
    signal: 'belief + trigger + date',
  },
  {
    number: '03',
    title: 'Return with evidence',
    copy: 'After seven days, record what moved and what did not. A changed mind is evidence—not a failure.',
    signal: 'update · preserve history',
  },
];

const publicMeasures = [
  'Anonymous instrument starts and completions',
  'Start-to-completion rate with the denominator visible',
  'Voluntary share actions, never relabeled as participants',
  'Product changes tied to specific external observations',
];

export default function ChallengePage() {
  return (
    <div>
      <section className="field-grid border-b border-ink/15">
        <div className="page-shell grid min-h-[calc(100vh-4rem)] gap-12 py-16 lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:py-24">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="measure-label">Open field test / 7 days</p>
              <span className="border border-ink/20 bg-[#fbfaf6] px-2.5 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.1em] text-ink/50">
                one real decision
              </span>
            </div>
            <h1 className="mt-9 max-w-5xl text-[clamp(4.4rem,9vw,8.8rem)] font-medium leading-[0.81] tracking-[-0.072em] text-ink">
              Put one choice
              <span className="font-editorial font-normal italic"> on the record.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-[15px] leading-7 text-ink/62">
              The FutureOS Decision Field Test is a self-guided experiment in
              accountable judgment. Frame a low-risk choice before the outcome,
              name what would change your mind, and return when the evidence
              arrives.
            </p>
            <div className="mt-9 flex flex-wrap gap-2">
              <Link href="/tools/decision-quality?utm_source=challenge" className="field-button field-button-primary focus-ring">
                Start the field test <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/impact" className="field-button field-button-secondary focus-ring">
                Inspect the evidence
              </Link>
            </div>
            <p className="mt-5 max-w-xl text-xs leading-6 text-ink/45">
              Start with decisions that are lawful, low-risk and yours to make.
              Do not use this experiment as medical, legal, financial or crisis advice.
            </p>
          </div>

          <div className="instrument-shell instrument-grid overflow-hidden bg-ink text-bone">
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-signal">Field instrument / 01</p>
              <span className="inline-flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.1em] text-white/42">
                <span className="signal-dot" /> ready
              </span>
            </div>
            <div className="p-7 sm:p-10">
              <p className="text-sm leading-7 text-white/48">Decision under test</p>
              <p className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.04em]">
                Which small, reversible action gives me the most useful evidence this week?
              </p>
              <div className="mt-10 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2">
                <InstrumentCell label="Baseline belief" value="68%" />
                <InstrumentCell label="Review window" value="7 days" />
                <InstrumentCell label="Reversibility" value="High" />
                <InstrumentCell label="Update rule" value="Written" />
              </div>
              <div className="mt-8 flex items-center gap-3 border-t border-white/10 pt-6 text-xs leading-6 text-white/48">
                <GitBranch className="h-4 w-4 shrink-0 text-signal" />
                The original belief stays visible after every update.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink text-bone">
        <div className="page-shell grid border-x border-white/10 sm:grid-cols-2 lg:grid-cols-4">
          <Proof icon={<Gauge />} label="Start" value="Score the structure" />
          <Proof icon={<GitBranch />} label="Update" value="Preserve every belief" />
          <Proof icon={<CalendarClock />} label="Return" value="Review after 7 days" />
          <Proof icon={<CheckCircle2 />} label="Resolve" value="Separate process from luck" />
        </div>
      </section>

      <section className="page-shell py-20 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.62fr_1.38fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="measure-label">Protocol / 01</p>
            <h2 className="mt-6 text-5xl font-medium leading-[0.96] tracking-[-0.055em] text-ink sm:text-6xl">
              One week.<span className="font-editorial font-normal italic"> Three moves.</span>
            </h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-ink/58">
              This is not a promise of better decisions. It is a way to make one
              decision inspectable before hindsight can rewrite it.
            </p>
          </div>
          <div className="border-t border-ink/20">
            {steps.map((step) => (
              <article key={step.number} className="grid gap-5 border-b border-ink/20 py-8 sm:grid-cols-[4rem_0.7fr_1fr] sm:py-10">
                <span className="font-mono text-[10px] text-signal-dark">{step.number}</span>
                <div>
                  <h3 className="text-2xl font-semibold tracking-[-0.035em] text-ink">{step.title}</h3>
                  <p className="mt-3 font-mono text-[8px] font-bold uppercase tracking-[0.09em] text-ink/38">{step.signal}</p>
                </div>
                <p className="max-w-xl text-sm leading-7 text-ink/58">{step.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-ink/15 bg-signal">
        <div className="page-shell grid lg:grid-cols-[0.84fr_1.16fr]">
          <div className="border-ink/20 py-16 lg:border-r lg:py-24 lg:pr-14">
            <p className="measure-label">Public measurement / 02</p>
            <h2 className="mt-7 max-w-lg text-5xl font-medium leading-[0.96] tracking-[-0.055em] text-ink sm:text-7xl">
              Count the<span className="font-editorial font-normal italic"> denominator.</span>
            </h2>
            <p className="mt-7 max-w-lg text-sm leading-7 text-ink/65">
              Attention is not impact. The public ledger reports the funnel it
              can actually observe and keeps stronger outcome claims at zero until evidence exists.
            </p>
          </div>
          <div className="grid sm:grid-cols-2">
            {publicMeasures.map((measure, index) => (
              <article key={measure} className="min-h-60 border-b border-r border-ink/20 p-7 sm:p-9">
                <span className="font-mono text-[9px] text-ink/40">0{index + 1}</span>
                <p className="mt-12 text-xl font-semibold leading-8 tracking-[-0.025em] text-ink">{measure}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell py-20 sm:py-28">
        <div className="grid gap-8 border border-ink/20 bg-[#fbfaf6] p-7 sm:p-10 lg:grid-cols-[0.82fr_1.18fr] lg:p-14">
          <div>
            <ShieldCheck className="h-7 w-7 text-signal-dark" />
            <h2 className="mt-6 text-4xl font-medium tracking-[-0.05em] text-ink sm:text-5xl">What stays private</h2>
          </div>
          <div className="space-y-5 text-sm leading-7 text-ink/58">
            <p>
              The open Decision Quality Score runs in your browser. FutureOS
              records only deduplicated anonymous start and completion events;
              it does not store the answers or score.
            </p>
            <p>
              Saving a longitudinal decision requires sign-in and creates a
              private record you can delete. Public counts never identify a person or expose a decision.
            </p>
            <div className="flex flex-wrap gap-5 pt-2">
              <Link href="/tools/decision-quality?utm_source=challenge" className="inline-flex items-center gap-2 border-b border-ink pb-1 font-black text-ink">
                Begin with the open score <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/privacy" className="inline-flex items-center gap-2 border-b border-ink/30 pb-1 font-bold text-ink/58">
                Read the privacy note
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InstrumentCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-h-28 bg-ink p-5">
      <p className="font-mono text-[8px] font-bold uppercase tracking-[0.1em] text-white/35">{label}</p>
      <p className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-signal">{value}</p>
    </div>
  );
}

function Proof({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="min-h-48 border-b border-r border-white/10 p-7 sm:p-9">
      <span className="block [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-signal">{icon}</span>
      <p className="mt-8 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-white/42">{label}</p>
      <p className="mt-3 text-lg font-semibold tracking-[-0.03em] text-white">{value}</p>
    </div>
  );
}

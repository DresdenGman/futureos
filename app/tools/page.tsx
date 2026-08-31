import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Gauge, Sigma } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Free decision tools',
  description:
    'Test the structure of a real decision and measure how well your confidence matches reality.',
  openGraph: {
    title: 'Free decision instruments from FutureOS',
    description:
      'Test decision structure and probability calibration—no account required.',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free decision instruments from FutureOS',
    description:
      'Test decision structure and probability calibration—no account required.',
    images: ['/og.png'],
  },
};

export default function ToolsPage() {
  return (
    <div>
      <section className="field-grid border-b border-ink/15">
        <div className="page-shell py-20 sm:py-28">
          <p className="measure-label">
            Open instruments / No account required
          </p>
          <h1 className="mt-8 max-w-6xl text-[clamp(4.6rem,10vw,9rem)] font-medium leading-[0.82] tracking-[-0.07em] text-ink">
            Test your
            <span className="font-editorial font-normal italic">
              {' '}
              judgment.
            </span>
          </h1>
          <p className="mt-8 max-w-2xl text-[15px] leading-7 text-ink/62">
            Two short instruments make decision quality visible before the
            outcome arrives. Your answers stay in your browser; only anonymous
            start and completion counts are recorded.
          </p>
          <Link
            href="/privacy"
            className="mt-5 inline-block border-b border-ink/35 pb-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-ink/45 hover:text-ink"
          >
            Read the privacy note
          </Link>
        </div>
      </section>
      <section className="page-shell py-20 sm:py-28">
        <div className="grid border-l border-t border-ink/20 lg:grid-cols-2">
          <ToolCard
            number="01"
            icon={<Gauge className="h-6 w-6" />}
            title="Decision Quality Score"
            copy="Score one real decision across outcome clarity, alternatives, value, reversibility, evidence and resolution discipline."
            meta="5 minutes · 7 dimensions"
            href="/tools/decision-quality"
            cta="Score a decision"
          />
          <ToolCard
            number="02"
            icon={<Sigma className="h-6 w-6" />}
            title="Calibration Test"
            copy="Make ten probability judgments and see whether your confidence matches your actual accuracy through a Brier score."
            meta="3 minutes · 10 forecasts"
            href="/tools/calibration"
            cta="Test my calibration"
          />
        </div>
      </section>
    </div>
  );
}

function ToolCard({
  number,
  icon,
  title,
  copy,
  meta,
  href,
  cta,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  copy: string;
  meta: string;
  href: string;
  cta: string;
}) {
  return (
    <article className="group flex min-h-[32rem] flex-col justify-between border-b border-r border-ink/20 p-7 transition hover:bg-[#fbfaf6] sm:p-12">
      <div className="flex items-start justify-between text-signal-dark">
        {icon}
        <span className="font-mono text-[9px] text-ink/35">{number}</span>
      </div>
      <div className="mt-20">
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-signal-dark">
          {meta}
        </p>
        <h2 className="mt-5 text-5xl font-medium leading-[0.95] tracking-[-0.055em] text-ink sm:text-6xl">
          {title}
        </h2>
        <p className="mt-6 max-w-xl text-sm leading-7 text-ink/58">{copy}</p>
        <Link
          href={href}
          className="mt-8 inline-flex items-center gap-2 border-b border-ink pb-1 text-sm font-black text-ink"
        >
          {cta}{' '}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}

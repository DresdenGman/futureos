import type { Metadata } from 'next';
import { DecisionQualityTool } from '@/components/decision-quality-tool';

export const metadata: Metadata = {
  title: 'Decision Quality Score',
  description:
    'Score a real decision across seven dimensions in five minutes. No account required; answers are never stored.',
  openGraph: {
    title: 'How strong is your decision before the outcome?',
    description: 'A free five-minute Decision Quality Score from FutureOS.',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How strong is your decision before the outcome?',
    description: 'A free five-minute Decision Quality Score from FutureOS.',
    images: ['/og.png'],
  },
};

export default function DecisionQualityPage() {
  return (
    <div className="page-shell py-14 sm:py-20">
      <div className="mb-12 grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
        <div>
          <p className="measure-label">Open instrument / 01</p>
          <h1 className="mt-6 text-5xl font-medium leading-[0.92] tracking-[-0.055em] text-ink sm:text-7xl">
            Decision Quality
            <span className="font-editorial font-normal italic"> Score.</span>
          </h1>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-ink/60 lg:justify-self-end">
          Choose one real decision. This instrument does not tell you what to
          choose; it tests whether the decision is clear enough to learn from.
          Complete all seven dimensions to receive a score and one
          highest-leverage next step.
        </p>
      </div>
      <DecisionQualityTool />
    </div>
  );
}

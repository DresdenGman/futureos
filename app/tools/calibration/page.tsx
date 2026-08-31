import type { Metadata } from 'next';
import { CalibrationTest } from '@/components/calibration-test';

export const metadata: Metadata = {
  title: 'Probability Calibration Test',
  description:
    'Make ten probability judgments and calculate how well your confidence matches your accuracy.',
  openGraph: {
    title: 'How calibrated is your confidence?',
    description: 'A free ten-question calibration test from FutureOS.',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How calibrated is your confidence?',
    description: 'A free ten-question calibration test from FutureOS.',
    images: ['/og.png'],
  },
};

export default function CalibrationPage() {
  return (
    <div className="page-shell py-14 sm:py-20">
      <div className="mb-12 grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
        <div>
          <p className="measure-label">Open instrument / 02</p>
          <h1 className="mt-6 text-5xl font-medium leading-[0.92] tracking-[-0.055em] text-ink sm:text-7xl">
            Probability
            <span className="font-editorial font-normal italic">
              {' '}
              calibration.
            </span>
          </h1>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-ink/60 lg:justify-self-end">
          Accuracy asks whether you were right. Calibration asks whether your
          confidence deserved to be that high. Answer ten stable questions,
          attach a confidence and receive a Brier score.
        </p>
      </div>
      <CalibrationTest />
    </div>
  );
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'How FutureOS handles decision records and anonymous tool data.',
};

export default function PrivacyPage() {
  return (
    <div className="page-shell py-16 sm:py-24">
      <div className="grid gap-12 lg:grid-cols-[0.62fr_1.38fr]">
        <div>
          <p className="measure-label">Privacy note / 30 Aug 2026</p>
          <h1 className="mt-7 text-5xl font-medium leading-[0.94] tracking-[-0.055em] text-ink sm:text-7xl">
            Your decisions are
            <span className="font-editorial font-normal italic"> yours.</span>
          </h1>
          <p className="mt-7 max-w-md text-sm leading-7 text-ink/58">
            FutureOS is designed to preserve decision history without turning
            private reasoning into public content or advertising data.
          </p>
        </div>
        <div className="border-t border-ink/20">
          <PrivacySection
            number="01"
            title="Saved decision records"
            copy="Creating and saving a FutureOS decision requires ChatGPT sign-in. Records are associated with the signed-in Sites user identifier, and server-side ownership checks protect every read and write. Other users cannot browse your workspace."
          />
          <PrivacySection
            number="02"
            title="Open instruments"
            copy="Decision Quality Score and Probability Calibration answers are calculated entirely in your browser. The answers, confidence values and final scores are not transmitted or stored."
          />
          <PrivacySection
            number="03"
            title="Anonymous measurement"
            copy="To understand whether the open instruments are useful, FutureOS counts starts, completions and share actions together with a broad source such as Hacker News or Reddit. A random, HTTP-only identifier is stored for 30 days and transformed into a different one-way hash each day to avoid double-counting. IP addresses, names, emails, answer content and full referring URLs are not stored in this measurement table."
          />
          <PrivacySection
            number="04"
            title="No advertising profile"
            copy="FutureOS does not sell personal data, run third-party advertising trackers or use open-instrument activity to build an advertising profile. Aggregates may be published to document product learning, but individual activity is not published."
          />
          <PrivacySection
            number="05"
            title="Scope"
            copy="FutureOS is a thinking and record-keeping tool. It is not medical, legal, financial-investment or crisis advice. Sensitive decisions should use qualified professional guidance and should not be entered into a product unless the user is comfortable storing them."
          />
          <PrivacySection
            number="06"
            title="Deletion controls"
            copy="Signed-in users can permanently delete one decision and its belief history from the decision page, or delete every saved decision, update and resolution from the workspace. Account-data deletion also clears the anonymous measurement cookie on that device. Previously counted public-tool events are not account records and cannot be linked back to the signed-in user."
          />
        </div>
      </div>
    </div>
  );
}

function PrivacySection({
  number,
  title,
  copy,
}: {
  number: string;
  title: string;
  copy: string;
}) {
  return (
    <section className="grid gap-5 border-b border-ink/20 py-8 sm:grid-cols-[3rem_0.7fr_1.3fr] sm:py-10">
      <span className="font-mono text-[9px] text-ink/35">{number}</span>
      <h2 className="text-xl font-semibold tracking-[-0.03em] text-ink">
        {title}
      </h2>
      <p className="text-sm leading-7 text-ink/58">{copy}</p>
    </section>
  );
}

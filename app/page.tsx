import Link from 'next/link';
import {
  ArrowDown,
  ArrowRight,
  Check,
  GitBranch,
  LineChart,
  LockKeyhole,
  RefreshCcw,
  Sigma,
} from 'lucide-react';
import { chatGPTSignInPath, getChatGPTUser } from '@/app/chatgpt-auth';

export const dynamic = 'force-dynamic';

const loop = [
  {
    number: '01',
    title: 'Frame',
    copy: 'Turn an ambiguous choice into a question reality can answer.',
    signal: 'Question + deadline',
  },
  {
    number: '02',
    title: 'Forecast',
    copy: 'Expose probability, value, downside and reversibility before acting.',
    signal: '68% · $240k · 82/100',
  },
  {
    number: '03',
    title: 'Update',
    copy: 'Let new evidence change the belief without erasing its history.',
    signal: 'Evidence → +7 pts',
  },
  {
    number: '04',
    title: 'Resolve',
    copy: 'Separate process quality from luck and keep the lesson reusable.',
    signal: 'Brier 0.08 · calibrated',
  },
];

export default async function HomePage() {
  const user = await getChatGPTUser();
  const startHref = user
    ? '/decisions/new'
    : chatGPTSignInPath('/decisions/new');

  return (
    <div className="future-home overflow-hidden">
      <section className="field-grid border-b border-ink/15">
        <div className="page-shell grid min-h-[calc(100vh-4rem)] grid-cols-1 lg:grid-cols-[minmax(0,1.18fr)_minmax(28rem,0.82fr)]">
          <div className="relative flex min-h-[44rem] flex-col justify-between border-ink/15 py-10 lg:border-r lg:pr-12 lg:py-12">
            <div className="flex items-start justify-between gap-6">
              <p className="measure-label">Decision intelligence / 01</p>
              <div className="hidden items-center gap-2 text-[11px] font-bold text-ink/55 sm:flex">
                <span className="signal-dot" />
                System ready
              </div>
            </div>

            <div className="relative py-16 lg:py-20">
              <p className="mb-7 max-w-md text-sm leading-6 text-ink/58">
                A decision operating system for people working under genuine
                uncertainty.
              </p>
              <h1 className="max-w-5xl text-[clamp(4.6rem,10vw,9.8rem)] font-medium leading-[0.79] tracking-[-0.075em] text-ink">
                Make the
                <br />
                future
                <br />
                <span className="font-editorial font-normal italic tracking-[-0.06em]">
                  answerable.
                </span>
              </h1>
              <div className="absolute -left-4 bottom-8 hidden h-px w-20 bg-ink/25 lg:block" />
            </div>

            <div className="grid gap-7 border-t border-ink/15 pt-7 sm:grid-cols-[minmax(0,30rem)_auto] sm:items-end sm:justify-between">
              <div>
                <p className="max-w-xl text-[15px] leading-7 text-ink/65">
                  FutureOS records what you believed, why you acted, what
                  changed, and what reality eventually proved—so judgment can
                  compound instead of reset.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <a
                    href={startHref}
                    target={user ? undefined : '_top'}
                    className="field-button field-button-primary focus-ring"
                  >
                    {user ? 'Frame a decision' : 'Start with one decision'}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <Link
                    href="/demo"
                    className="field-button field-button-secondary focus-ring"
                  >
                    Watch the loop
                  </Link>
                </div>
              </div>
              <a
                href="#system"
                className="focus-ring hidden h-12 w-12 items-center justify-center border border-ink/20 text-ink transition hover:bg-ink hover:text-signal sm:flex"
                aria-label="Explore the FutureOS system"
              >
                <ArrowDown className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="relative flex items-center py-8 lg:pl-12">
            <DecisionInstrument />
          </div>
        </div>
      </section>

      <section className="bg-ink text-bone">
        <div className="page-shell grid border-x border-white/10 sm:grid-cols-2 lg:grid-cols-4">
          <Proof
            number="01"
            label="Expected utility"
            value="Action value, made explicit"
          />
          <Proof
            number="02"
            label="Bayesian revision"
            value="Beliefs that move with evidence"
          />
          <Proof
            number="03"
            label="Calibration"
            value="Confidence tested against reality"
          />
          <Proof
            number="04"
            label="Option value"
            value="Reversibility treated as an asset"
          />
        </div>
      </section>

      <section id="system" className="page-shell py-24 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="measure-label">The operating loop / 02</p>
            <h2 className="mt-6 max-w-lg text-5xl font-medium leading-[0.95] tracking-[-0.055em] text-ink sm:text-7xl">
              A record of the
              <span className="font-editorial font-normal italic">
                {' '}
                thinking,
              </span>
              <br />
              not just the result.
            </h2>
            <p className="mt-7 max-w-md text-sm leading-7 text-ink/58">
              Most software stores what happened. FutureOS preserves the
              decision contract that existed before anyone knew the answer.
            </p>
          </div>
          <div className="border-t border-ink/20">
            {loop.map((step) => (
              <article
                key={step.number}
                className="group grid gap-5 border-b border-ink/20 py-7 transition sm:grid-cols-[4rem_0.7fr_1fr] sm:items-start sm:py-9"
              >
                <span className="font-mono text-[11px] text-ink/40">
                  {step.number}
                </span>
                <div>
                  <h3 className="text-2xl font-semibold tracking-[-0.035em] text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-signal-dark">
                    {step.signal}
                  </p>
                </div>
                <p className="max-w-md text-sm leading-7 text-ink/58">
                  {step.copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-ink/15 bg-signal">
        <div className="page-shell grid lg:grid-cols-[0.88fr_1.12fr]">
          <div className="border-ink/20 py-16 lg:border-r lg:py-24 lg:pr-14">
            <p className="measure-label">Applied mathematics / 03</p>
            <h2 className="mt-7 max-w-xl text-5xl font-medium leading-[0.96] tracking-[-0.055em] text-ink sm:text-7xl">
              Mathematics with
              <span className="font-editorial font-normal italic">
                {' '}
                memory.
              </span>
            </h2>
            <p className="mt-7 max-w-lg text-sm leading-7 text-ink/65">
              The mathematics is not decoration. It changes what the system
              recommends, which evidence matters, and how accurately you learn
              from experience.
            </p>
            <Link
              href="/memory"
              className="mt-8 inline-flex items-center gap-2 border-b border-ink pb-1 text-sm font-black text-ink"
            >
              Open decision memory <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2">
            <Equation
              symbol="EU(a)"
              equation="Σ p(s) · u(a,s)"
              copy="Expected utility compares actions across possible futures."
            />
            <Equation
              symbol="P(H|E)"
              equation="P(E|H)P(H) / P(E)"
              copy="Bayesian revision turns evidence into accountable belief change."
            />
            <Equation
              symbol="BS"
              equation="(p − o)²"
              copy="Brier scoring reveals whether confidence matches reality."
            />
            <Equation
              symbol="OV"
              equation="V(wait) − V(commit)"
              copy="Option value rewards paths that preserve future choices."
            />
          </div>
        </div>
      </section>

      <section className="border-b border-ink/15 bg-[#fbfaf6]">
        <div className="page-shell grid lg:grid-cols-[0.72fr_1.28fr]">
          <div className="border-ink/15 py-16 lg:border-r lg:py-24 lg:pr-14">
            <p className="measure-label">Open instruments / 04</p>
            <h2 className="mt-7 max-w-lg text-5xl font-medium leading-[0.96] tracking-[-0.055em] text-ink sm:text-7xl">
              Test your
              <span className="font-editorial font-normal italic">
                {' '}
                judgment.
              </span>
            </h2>
            <p className="mt-7 max-w-md text-sm leading-7 text-ink/60">
              Two short, no-account instruments make decision structure and
              probability calibration visible before the outcome arrives.
            </p>
            <Link
              href="/tools"
              className="mt-8 inline-flex items-center gap-2 border-b border-ink pb-1 text-sm font-black text-ink"
            >
              Open all tools <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2">
            <QuickTool
              number="01"
              symbol="DQ"
              title="Decision Quality Score"
              copy="Score one real decision across seven dimensions in five minutes."
              href="/tools/decision-quality"
            />
            <QuickTool
              number="02"
              symbol="BS"
              title="Calibration Test"
              copy="Make ten forecasts and calculate how confidence matches accuracy."
              href="/tools/calibration"
            />
          </div>
        </div>
      </section>

      <section className="page-shell py-24 sm:py-32">
        <div className="grid overflow-hidden border border-ink/20 bg-bone lg:grid-cols-[1fr_0.82fr]">
          <div className="field-grid p-7 sm:p-12 lg:p-16">
            <p className="measure-label">Begin the record / 05</p>
            <h2 className="mt-8 max-w-3xl text-5xl font-medium leading-[0.95] tracking-[-0.055em] text-ink sm:text-7xl">
              Capture the belief
              <br />
              <span className="font-editorial font-normal italic">
                before reality edits it.
              </span>
            </h2>
            <p className="mt-7 max-w-xl text-sm leading-7 text-ink/60">
              One real decision is enough to begin building a memory of how you
              think under uncertainty.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              <a
                href={startHref}
                target={user ? undefined : '_top'}
                className="field-button field-button-primary focus-ring"
              >
                Create the first record <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/workspace"
                className="field-button field-button-secondary focus-ring"
              >
                Enter workspace
              </Link>
            </div>
          </div>
          <div className="flex min-h-80 flex-col justify-between bg-ink p-7 text-bone sm:p-12">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-white/42">
              <span>FutureOS / Decision field</span>
              <span>Live</span>
            </div>
            <div>
              <p className="font-editorial text-8xl italic leading-none text-signal">
                68%
              </p>
              <p className="mt-4 max-w-sm text-sm leading-6 text-white/58">
                “Will this action create the outcome we claim to expect?”
              </p>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-semibold text-white/48">
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-signal" /> No blank canvas
              </span>
              <span className="flex items-center gap-1.5">
                <LockKeyhole className="h-3.5 w-3.5 text-signal" /> Private by
                design
              </span>
              <span className="flex items-center gap-1.5">
                <RefreshCcw className="h-3.5 w-3.5 text-signal" /> Versioned
              </span>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-ink/15">
        <div className="page-shell flex flex-col gap-3 py-8 font-mono text-[10px] uppercase tracking-[0.1em] text-ink/45 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 FutureOS / Decisions that learn</span>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-ink">
              Privacy
            </Link>
            <span>Built for consequential work under uncertainty</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DecisionInstrument() {
  return (
    <div className="instrument-shell relative w-full overflow-hidden bg-ink text-bone">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 font-mono text-[9px] uppercase tracking-[0.12em] text-white/45">
        <span>Decision record / FOS-0042</span>
        <span className="flex items-center gap-2 text-signal">
          <span className="signal-dot" /> Live belief
        </span>
      </div>

      <div className="p-5 sm:p-7">
        <div className="grid gap-5 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-signal">
              Question reality can answer
            </p>
            <h2 className="mt-3 max-w-lg text-2xl font-semibold leading-8 tracking-[-0.035em]">
              Will a controlled launch improve paid conversion by at least 18%
              within 45 days?
            </h2>
          </div>
          <span className="h-fit border border-signal/35 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-signal">
            Open
          </span>
        </div>

        <div className="mt-8 border border-white/10 bg-[#101b17]">
          <div className="grid grid-cols-3 border-b border-white/10">
            <InstrumentMetric label="Prior" value="61%" />
            <InstrumentMetric label="Current" value="68%" accent />
            <InstrumentMetric label="Threshold" value="65%" />
          </div>
          <ProbabilityField />
        </div>

        <div className="mt-5 grid gap-px bg-white/10 sm:grid-cols-3">
          <InstrumentFact label="Action" value="20% controlled launch" />
          <InstrumentFact label="Reversibility" value="82 / 100" />
          <InstrumentFact label="Resolve by" value="25 Sep 2026" />
        </div>

        <div className="mt-5 flex items-start gap-3 border-l-2 border-signal bg-signal/8 p-4">
          <GitBranch className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-signal">
              Recommendation changed
            </p>
            <p className="mt-1.5 text-xs leading-5 text-white/58">
              Trial-to-team invite depth reached a six-week high. The launch now
              clears its action threshold.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickTool({
  number,
  symbol,
  title,
  copy,
  href,
}: {
  number: string;
  symbol: string;
  title: string;
  copy: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-80 flex-col justify-between border-b border-ink/15 p-7 transition hover:bg-signal/25 sm:p-10 lg:border-l"
    >
      <div className="flex items-start justify-between">
        <p className="font-editorial text-6xl italic leading-none text-ink">
          {symbol}
        </p>
        <span className="font-mono text-[9px] text-ink/35">{number}</span>
      </div>
      <div className="mt-16">
        <h3 className="text-2xl font-semibold tracking-[-0.035em] text-ink">
          {title}
        </h3>
        <p className="mt-3 max-w-sm text-sm leading-6 text-ink/55">{copy}</p>
        <span className="mt-6 inline-flex items-center gap-2 text-xs font-black text-ink">
          Start free{' '}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function ProbabilityField() {
  return (
    <div className="relative h-64 overflow-hidden">
      <div className="absolute inset-0 instrument-grid" />
      <svg
        viewBox="0 0 640 260"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="fieldFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d4ff4f" stopOpacity="0.28" />
            <stop offset="1" stopColor="#d4ff4f" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 220 C70 215 98 182 150 188 C210 196 230 145 284 156 C346 169 365 105 424 124 C478 140 515 80 568 92 C603 100 622 70 640 56 L640 260 L0 260 Z"
          fill="url(#fieldFill)"
        />
        <path
          className="field-line"
          d="M0 220 C70 215 98 182 150 188 C210 196 230 145 284 156 C346 169 365 105 424 124 C478 140 515 80 568 92 C603 100 622 70 640 56"
          fill="none"
          stroke="#d4ff4f"
          strokeWidth="2.5"
        />
        <path
          d="M0 202 C78 200 102 178 154 183 C218 189 247 167 294 172 C352 179 389 139 438 148 C495 159 522 120 580 125 C610 127 624 111 640 104"
          fill="none"
          stroke="rgba(255,255,255,.18)"
          strokeDasharray="4 7"
        />
        <line
          x1="522"
          y1="0"
          x2="522"
          y2="260"
          stroke="rgba(255,255,255,.16)"
        />
        <circle cx="522" cy="105" r="5" fill="#d4ff4f" />
        <circle
          className="field-pulse"
          cx="522"
          cy="105"
          r="12"
          fill="none"
          stroke="#d4ff4f"
        />
        <text
          x="535"
          y="96"
          fill="#d4ff4f"
          fontSize="11"
          fontFamily="monospace"
        >
          NEW EVIDENCE
        </text>
      </svg>
      <span className="absolute bottom-3 left-3 font-mono text-[9px] uppercase tracking-[0.1em] text-white/30">
        T−45 days
      </span>
      <span className="absolute bottom-3 right-3 font-mono text-[9px] uppercase tracking-[0.1em] text-white/30">
        Resolution
      </span>
    </div>
  );
}

function InstrumentMetric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="border-r border-white/10 px-4 py-3 last:border-r-0">
      <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-white/35">
        {label}
      </p>
      <p
        className={`mt-1 text-2xl ${accent ? 'text-signal' : 'text-white/75'}`}
      >
        {value}
      </p>
    </div>
  );
}

function InstrumentFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-ink px-4 py-4">
      <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-white/30">
        {label}
      </p>
      <p className="mt-1.5 text-xs font-semibold text-white/70">{value}</p>
    </div>
  );
}

function Proof({
  number,
  label,
  value,
}: {
  number: string;
  label: string;
  value: string;
}) {
  return (
    <div className="min-h-40 border-b border-white/10 p-6 sm:border-r lg:border-b-0 lg:p-7">
      <p className="font-mono text-[9px] tracking-[0.12em] text-signal">
        {number}
      </p>
      <div className="mt-10 flex items-start gap-3">
        {number === '01' ? (
          <Sigma className="mt-0.5 h-4 w-4 text-signal" />
        ) : number === '02' ? (
          <GitBranch className="mt-0.5 h-4 w-4 text-signal" />
        ) : (
          <LineChart className="mt-0.5 h-4 w-4 text-signal" />
        )}
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="mt-1 text-[11px] leading-5 text-white/40">{value}</p>
        </div>
      </div>
    </div>
  );
}

function Equation({
  symbol,
  equation,
  copy,
}: {
  symbol: string;
  equation: string;
  copy: string;
}) {
  return (
    <article className="min-h-64 border-b border-ink/20 p-7 even:border-l sm:p-9 lg:min-h-72">
      <div className="flex items-start justify-between gap-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink/45">
          {symbol}
        </span>
        <span className="h-2 w-2 rounded-full bg-ink" />
      </div>
      <p className="mt-12 font-editorial text-3xl italic tracking-[-0.035em] text-ink sm:text-4xl">
        {equation}
      </p>
      <p className="mt-6 max-w-xs text-xs leading-6 text-ink/58">{copy}</p>
    </article>
  );
}

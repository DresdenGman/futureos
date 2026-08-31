import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Download,
  ExternalLink,
  FlaskConical,
  GitBranch,
  ShieldCheck,
  Sigma,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Research protocol',
  description:
    'The falsifiable hypotheses, mathematical foundations, evidence standards and privacy boundaries behind FutureOS.',
};

const hypotheses = [
  {
    id: 'H1',
    title: 'Resolvable decisions',
    claim:
      'Writing an outcome metric and review date before acting will increase the share of decisions that can later be resolved without reinterpretation.',
    measure: 'Resolved records ÷ eligible records',
    falsified:
      'No improvement versus users’ unstructured baseline after a sufficient cohort and observation period.',
  },
  {
    id: 'H2',
    title: 'Evidence-sensitive beliefs',
    claim:
      'Naming a reversal trigger will increase the rate of documented probability updates when material evidence arrives.',
    measure: 'Evidence-linked updates per active decision',
    falsified:
      'Users record triggers but do not revise beliefs more often or more coherently.',
  },
  {
    id: 'H3',
    title: 'Calibration over time',
    claim:
      'Repeated forecast → update → resolution cycles will improve probabilistic calibration.',
    measure: 'Within-person change in mean Brier score',
    falsified:
      'Brier scores remain flat or worsen after enough resolved forecasts to reduce noise.',
  },
];

const protocol = [
  {
    number: '01',
    title: 'Instrument pilot',
    copy: 'Observe anonymous start and completion behavior for the two no-login instruments. This tests clarity and demand—not learning outcomes.',
  },
  {
    number: '02',
    title: 'Consented longitudinal cohort',
    copy: 'Recruit participants who choose to record repeated real decisions and return for resolution. Analyze within-person change rather than comparing unrelated users.',
  },
  {
    number: '03',
    title: 'Predeclared checkpoints',
    copy: 'Do not claim improvement from isolated anecdotes. Review activation after 25 completed instruments; evaluate calibration only after participants have enough resolved forecasts.',
  },
  {
    number: '04',
    title: 'Publish limitations',
    copy: 'Report attrition, missing outcomes, self-selection and measurement changes alongside any positive result. Preserve null findings.',
  },
];

export default function ResearchPage() {
  return (
    <div>
      <section className="field-grid border-b border-ink/15">
        <div className="page-shell py-20 sm:py-28">
          <p className="measure-label">Open research protocol / v1</p>
          <h1 className="mt-8 max-w-6xl text-[clamp(4.6rem,10vw,9rem)] font-medium leading-[0.82] tracking-[-0.07em] text-ink">
            Can judgment
            <span className="font-editorial font-normal italic">
              {' '}
              compound?
            </span>
          </h1>
          <p className="mt-8 max-w-2xl text-[15px] leading-7 text-ink/62">
            FutureOS is built around a falsifiable question: does versioned
            decision memory improve calibration and reduce hindsight bias over
            repeated consequential choices?
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            <Link href="/impact" className="field-button field-button-primary">
              See live evidence <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://github.com/DresdenGman/futureos"
              target="_blank"
              rel="noreferrer"
              className="field-button field-button-secondary"
            >
              Inspect the source <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="bg-ink text-bone">
        <div className="page-shell grid border-x border-white/10 sm:grid-cols-2 lg:grid-cols-4">
          <ResearchProof
            icon={<FlaskConical className="h-5 w-5" />}
            title="Falsifiable hypotheses"
            copy="Claims state how they could fail."
          />
          <ResearchProof
            icon={<Sigma className="h-5 w-5" />}
            title="Proper scoring"
            copy="Calibration uses the Brier rule."
          />
          <ResearchProof
            icon={<GitBranch className="h-5 w-5" />}
            title="Versioned evidence"
            copy="Belief changes keep their history."
          />
          <ResearchProof
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Privacy boundary"
            copy="Open-tool answers are not collected."
          />
        </div>
      </section>

      <section className="page-shell py-20 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.62fr_1.38fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="measure-label">Hypotheses / 01</p>
            <h2 className="mt-6 text-5xl font-medium leading-[0.96] tracking-[-0.055em] text-ink sm:text-6xl">
              Claims that can
              <span className="font-editorial font-normal italic"> lose.</span>
            </h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-ink/58">
              These are research hypotheses, not product achievements. They
              become evidence only after an adequate observation period.
            </p>
          </div>
          <div className="border-t border-ink/20">
            {hypotheses.map((hypothesis) => (
              <article
                key={hypothesis.id}
                className="grid gap-6 border-b border-ink/20 py-9 sm:grid-cols-[4rem_0.8fr_1.2fr]"
              >
                <span className="font-mono text-[10px] text-signal-dark">
                  {hypothesis.id}
                </span>
                <div>
                  <h3 className="text-2xl font-semibold tracking-[-0.035em] text-ink">
                    {hypothesis.title}
                  </h3>
                  <p className="mt-4 font-mono text-[8px] uppercase tracking-[0.08em] text-ink/38">
                    Metric: {hypothesis.measure}
                  </p>
                </div>
                <div className="space-y-4 text-sm leading-7 text-ink/58">
                  <p>{hypothesis.claim}</p>
                  <p>
                    <strong className="text-ink">Failure condition:</strong>{' '}
                    {hypothesis.falsified}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-ink/15 bg-signal">
        <div className="page-shell grid lg:grid-cols-[0.82fr_1.18fr]">
          <div className="border-ink/20 py-16 lg:border-r lg:py-24 lg:pr-14">
            <p className="measure-label">Applied mathematics / 02</p>
            <h2 className="mt-7 text-5xl font-medium leading-[0.96] tracking-[-0.055em] text-ink sm:text-7xl">
              Mathematics with
              <span className="font-editorial font-normal italic">
                {' '}
                limits.
              </span>
            </h2>
            <p className="mt-7 max-w-lg text-sm leading-7 text-ink/65">
              A formula is useful only when its assumptions remain visible.
              FutureOS separates measurement, model and human judgment.
            </p>
          </div>
          <div className="grid sm:grid-cols-2">
            <Equation
              name="Expected utility"
              formula="EU(a) = Σ p(s) · u(a,s)"
              note="Separates likelihood from consequence."
            />
            <Equation
              name="Bayesian revision"
              formula="P(H|E) ∝ P(E|H)P(H)"
              note="Makes evidence-linked belief changes inspectable."
            />
            <Equation
              name="Brier score"
              formula="BS = mean((p − o)²)"
              note="Scores probability, not only right versus wrong."
            />
            <Equation
              name="Option value"
              formula="Value now + preserved choices"
              note="Treats reversibility as a real decision asset."
            />
          </div>
        </div>
      </section>

      <section className="border-b border-ink/15 bg-[#fbfaf6]">
        <div className="page-shell grid gap-12 py-20 lg:grid-cols-[0.78fr_1.22fr] sm:py-28">
          <div>
            <p className="measure-label">Open benchmark / v0.1</p>
            <h2 className="mt-6 text-5xl font-medium leading-[0.96] tracking-[-0.055em] text-ink sm:text-6xl">
              Make the math
              <span className="font-editorial font-normal italic">
                {' '}
                executable.
              </span>
            </h2>
          </div>
          <div className="border-t border-ink/20 pt-8">
            <p className="max-w-2xl text-sm leading-7 text-ink/60">
              The Decision Quality Benchmark contains 24 deterministic,
              synthetic cases across expected utility, Bayesian revision,
              binary Brier scoring and explicit option value. It includes an
              executable scorer and a deliberately weak shortcut baseline.
            </p>
            <div className="mt-8 grid gap-px border border-ink/15 bg-ink/15 sm:grid-cols-3">
              <BenchmarkFact value="24" label="Synthetic cases" />
              <BenchmarkFact value="04" label="Task families" />
              <BenchmarkFact value="CC BY" label="Open dataset" />
            </div>
            <p className="mt-7 max-w-2xl text-xs leading-6 text-ink/45">
              Claim boundary: passing the benchmark demonstrates calculation
              and implementation correctness on these cases. It does not show
              that FutureOS improves human judgment.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              <a
                href="/research/decision-quality-benchmark-v0.1.json"
                download
                className="field-button field-button-primary"
              >
                Download the dataset <Download className="h-4 w-4" />
              </a>
              <a
                href="https://github.com/DresdenGman/futureos/tree/main/research/decision-quality-benchmark"
                target="_blank"
                rel="noreferrer"
                className="field-button field-button-secondary"
              >
                Inspect the method <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-20 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="measure-label">Evidence plan / 03</p>
            <h2 className="mt-6 text-5xl font-medium leading-[0.96] tracking-[-0.055em] text-ink sm:text-6xl">
              From attention to
              <span className="font-editorial font-normal italic">
                {' '}
                learning.
              </span>
            </h2>
          </div>
          <div className="border-l border-t border-ink/20 sm:grid sm:grid-cols-2">
            {protocol.map((step) => (
              <article
                key={step.number}
                className="min-h-72 border-b border-r border-ink/20 p-7 sm:p-9"
              >
                <span className="font-mono text-[9px] text-signal-dark">
                  {step.number}
                </span>
                <h3 className="mt-9 text-2xl font-semibold tracking-[-0.035em] text-ink">
                  {step.title}
                </h3>
                <p className="mt-5 text-sm leading-7 text-ink/55">
                  {step.copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-ink/15 bg-[#fbfaf6]">
        <div className="page-shell grid gap-8 py-20 lg:grid-cols-[0.8fr_1.2fr] sm:py-24">
          <div>
            <p className="measure-label">Current limits / 04</p>
            <h2 className="mt-6 text-4xl font-medium tracking-[-0.05em] text-ink sm:text-5xl">
              What FutureOS cannot claim yet
            </h2>
          </div>
          <div className="space-y-5 text-sm leading-7 text-ink/58">
            <p>
              Anonymous instrument completions demonstrate use, not improved
              judgment. Self-selected early adopters are not representative of a
              wider population. Short calibration quizzes are noisy.
            </p>
            <p>
              Product scoring weights are transparent heuristics, not universal
              estimators. Any claim of longitudinal improvement must report
              sample size, attrition and uncertainty.
            </p>
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 border-b border-ink pb-1 font-black text-ink"
            >
              Try the open instruments <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function BenchmarkFact({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-[#fbfaf6] p-6">
      <p className="font-editorial text-4xl italic tracking-[-0.04em] text-ink">
        {value}
      </p>
      <p className="mt-3 font-mono text-[8px] uppercase tracking-[0.09em] text-ink/42">
        {label}
      </p>
    </div>
  );
}

function ResearchProof({
  icon,
  title,
  copy,
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
}) {
  return (
    <div className="min-h-52 border-b border-r border-white/10 p-7 sm:p-9">
      <div className="text-signal">{icon}</div>
      <h2 className="mt-9 text-lg font-semibold tracking-[-0.03em]">{title}</h2>
      <p className="mt-3 text-xs leading-6 text-white/42">{copy}</p>
    </div>
  );
}

function Equation({
  name,
  formula,
  note,
}: {
  name: string;
  formula: string;
  note: string;
}) {
  return (
    <article className="min-h-72 border-b border-r border-ink/20 p-7 sm:p-9">
      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-ink/42">
        {name}
      </p>
      <p className="mt-10 font-editorial text-3xl italic tracking-[-0.03em] text-ink sm:text-4xl">
        {formula}
      </p>
      <p className="mt-8 text-sm leading-7 text-ink/58">{note}</p>
    </article>
  );
}

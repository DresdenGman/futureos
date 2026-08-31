'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Expand,
  Eye,
  EyeOff,
  GitBranch,
  Lightbulb,
  Pause,
  Play,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';

import { cn } from '@/lib/utils';

const chapters = [
  {
    kicker: '01 · Frame',
    nav: 'Make it testable',
    title: 'A vague debate becomes a decision contract.',
    description:
      'FutureOS separates the action you control from the outcome you hope to influence—before hindsight can rewrite the story.',
    note: 'Start here: teams usually debate solutions before agreeing on what success means. FutureOS forces the decision into a form reality can answer.',
  },
  {
    kicker: '02 · Compare',
    nav: 'See possible futures',
    title: 'Compare actions, not opinions.',
    description:
      'Each path gets a conditional probability, expected value, downside, and reversibility score. The highest probability is not always the best decision.',
    note: 'Point out that a full launch has the highest upside, but the controlled launch preserves option value and limits irreversible downside.',
  },
  {
    kicker: '03 · Update',
    nav: 'Let reality intervene',
    title: 'New evidence changes the decision—not the history.',
    description:
      'A material signal arrives. FutureOS shows exactly which belief moved, why it moved, and which action now crosses the decision threshold.',
    note: 'Click “Reveal live signal.” The probability moves from 61% to 68%, while the original estimate remains permanently visible in the belief history.',
  },
  {
    kicker: '04 · Commit',
    nav: 'Act with guardrails',
    title: 'Every action gets an escape hatch.',
    description:
      'The team commits to a reversible experiment and pre-registers the evidence that will force a rollback—before emotion and sunk cost take over.',
    note: 'This is the decisive product difference: FutureOS does not just predict. It connects beliefs to action, monitoring, and a pre-committed response.',
  },
  {
    kicker: '05 · Learn',
    nav: 'Build decision memory',
    title: 'The outcome becomes organizational memory.',
    description:
      'FutureOS separates process quality from luck, then learns where the team is calibrated, where it is biased, and how the next decision should improve.',
    note: 'Close with the flywheel: every resolved decision makes the organization better at deciding—not merely better at documenting what happened.',
  },
];

export default function GuidedDemoPage() {
  const [chapter, setChapter] = useState(0);
  const [signalRevealed, setSignalRevealed] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);

  const current = chapters[chapter];
  const progress = ((chapter + 1) / chapters.length) * 100;

  useEffect(() => {
    if (!autoPlay) return;
    const timer = window.setTimeout(
      () => {
        if (chapter === 2 && !signalRevealed) {
          setSignalRevealed(true);
          return;
        }
        if (chapter < chapters.length - 1) {
          setChapter((value) => value + 1);
        } else {
          setAutoPlay(false);
        }
      },
      chapter === 2 && !signalRevealed ? 4200 : 6800,
    );
    return () => window.clearTimeout(timer);
  }, [autoPlay, chapter, signalRevealed]);

  const stageLabel = useMemo(
    () =>
      `${String(chapter + 1).padStart(2, '0')} / ${String(chapters.length).padStart(2, '0')}`,
    [chapter],
  );

  function resetDemo() {
    setChapter(0);
    setSignalRevealed(false);
    setAutoPlay(false);
  }

  function nextChapter() {
    if (chapter === 2 && !signalRevealed) {
      setSignalRevealed(true);
      return;
    }
    setChapter((value) => Math.min(chapters.length - 1, value + 1));
  }

  async function enterFullscreen() {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  }

  return (
    <div className="space-y-4 pb-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:text-slate-950"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="pulse-soft h-2 w-2 rounded-full bg-emerald-500" />
              <p className="text-[10px] font-black uppercase tracking-[0.19em] text-emerald-800">
                Live product story
              </p>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">
              A three-minute guided walkthrough · no setup required
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotes((value) => !value)}
            aria-pressed={showNotes}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
          >
            {showNotes ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
            Presenter notes
          </button>
          <button
            onClick={enterFullscreen}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
            aria-label="Toggle fullscreen"
            title="Toggle fullscreen"
          >
            <Expand className="h-4 w-4" />
          </button>
          <button
            onClick={resetDemo}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
            aria-label="Reset demo"
            title="Reset demo"
          >
            <RefreshCcw className="h-4 w-4" />
          </button>
        </div>
      </header>

      <section className="overflow-hidden rounded-[26px] border border-slate-900/10 bg-[#0b1511] shadow-[0_28px_80px_rgba(23,32,29,0.2)]">
        <div className="h-1 bg-white/10">
          <div
            className="h-full bg-[#d4ff4f] transition-[width] duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid lg:min-h-[670px] lg:grid-cols-[minmax(360px,0.76fr)_minmax(560px,1.24fr)]">
          <div className="relative flex flex-col justify-between overflow-hidden border-b border-white/10 p-7 text-white sm:p-8 lg:border-b-0 lg:border-r lg:p-12">
            <div className="absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-[#d4ff4f]/10 blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d4ff4f]">
                  {current.kicker}
                </span>
                <span className="font-mono text-xs text-white/30">
                  {stageLabel}
                </span>
              </div>
              <h1
                key={`title-${chapter}`}
                className="mt-9 max-w-xl animate-in fade-in slide-in-from-bottom-2 font-editorial text-[42px] leading-[1.04] tracking-[-0.048em] text-white duration-500 sm:text-[48px] lg:mt-10 lg:text-[58px]"
              >
                {current.title}
              </h1>
              <p
                key={`copy-${chapter}`}
                className="mt-5 max-w-lg animate-in fade-in text-[15px] leading-7 text-white/60 duration-700 lg:mt-6"
              >
                {current.description}
              </p>
            </div>

            <div className="relative mt-9 lg:mt-10">
              <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-6">
                <button
                  onClick={() => setChapter((value) => Math.max(0, value - 1))}
                  disabled={chapter === 0}
                  className="text-sm font-bold text-white/45 transition hover:text-white disabled:opacity-20"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAutoPlay((value) => !value)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white"
                    aria-label={autoPlay ? 'Pause autoplay' : 'Start autoplay'}
                    title={
                      autoPlay
                        ? 'Pause autoplay'
                        : 'Play the story automatically'
                    }
                  >
                    {autoPlay ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4 fill-current" />
                    )}
                  </button>
                  <button
                    onClick={
                      chapter === chapters.length - 1 ? resetDemo : nextChapter
                    }
                    className={cn(
                      'inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-black text-[#0b1511] transition hover:-translate-y-0.5',
                      chapter === 2 && !signalRevealed
                        ? 'bg-[#d4ff4f] shadow-[0_12px_30px_rgba(207,255,107,0.16)]'
                        : 'bg-white hover:bg-[#d4ff4f]',
                    )}
                  >
                    {chapter === 2 && !signalRevealed
                      ? 'Reveal live signal'
                      : chapter === chapters.length - 1
                        ? 'Replay story'
                        : 'Continue'}
                    {chapter === chapters.length - 1 ? (
                      <RefreshCcw className="h-3.5 w-3.5" />
                    ) : chapter === 2 && !signalRevealed ? (
                      <Sparkles className="h-4 w-4" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="subtle-grid relative flex min-h-[520px] items-center justify-center overflow-hidden bg-[#f7f7f2] p-5 sm:min-h-[560px] sm:p-8 lg:min-h-[670px] lg:p-10">
            <div className="absolute right-6 top-6 flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-[10px] font-bold text-slate-400 shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Demo
              workspace · Growth
            </div>
            <div
              key={`scene-${chapter}`}
              className="w-full max-w-[720px] animate-in fade-in slide-in-from-bottom-2 duration-500"
            >
              {chapter === 0 && <FrameScene />}
              {chapter === 1 && <CompareScene />}
              {chapter === 2 && <UpdateScene revealed={signalRevealed} />}
              {chapter === 3 && <CommitScene />}
              {chapter === 4 && <LearnScene />}
            </div>
          </div>
        </div>
      </section>

      <nav className="panel grid grid-cols-5 gap-1 p-1.5">
        {chapters.map((item, index) => (
          <button
            key={item.nav}
            onClick={() => setChapter(index)}
            aria-current={chapter === index ? 'step' : undefined}
            className={cn(
              'group rounded-xl px-2 py-3 text-left transition sm:px-4',
              chapter === index
                ? 'bg-[#0b1511] text-white'
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700',
            )}
          >
            <span
              className={cn(
                'flex h-3 items-center text-[9px] font-black uppercase tracking-[0.12em]',
                chapter === index
                  ? 'text-[#d4ff4f]'
                  : index < chapter
                    ? 'text-emerald-600'
                    : 'text-slate-300',
              )}
            >
              {index < chapter ? (
                <Check className="h-3 w-3" />
              ) : (
                `0${index + 1}`
              )}
            </span>
            <span className="mt-1 hidden text-xs font-bold sm:block">
              {item.nav}
            </span>
          </button>
        ))}
      </nav>

      {showNotes && (
        <aside className="rounded-2xl border border-orange-200 bg-orange-50 p-5 text-orange-950 shadow-sm">
          <div className="flex items-start gap-3">
            <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">
                Presenter note · Chapter {chapter + 1}
              </p>
              <p className="mt-2 text-sm leading-6 text-orange-950/75">
                {current.note}
              </p>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}

function SceneShell({
  children,
  label,
  icon: Icon,
}: {
  children: React.ReactNode;
  label: string;
  icon: typeof Target;
}) {
  return (
    <div className="rounded-[24px] border border-slate-900/10 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.1)] sm:p-7">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
          <Icon className="h-4 w-4 text-emerald-600" />
          {label}
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-black text-slate-400">
          LIVE
        </span>
      </div>
      {children}
    </div>
  );
}

function FrameScene() {
  return (
    <SceneShell label="Decision contract" icon={Target}>
      <div className="rounded-2xl bg-[#0b1511] p-5 text-white">
        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#d4ff4f]">
          The decision
        </p>
        <h2 className="mt-3 text-xl font-bold leading-7">
          Ship the team pricing experiment
        </h2>
        <p className="mt-3 text-sm leading-6 text-white/55">
          If we launch at $49 per seat, will paid conversion improve by ≥18%
          within 45 days?
        </p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Fact label="Action" value="Launch to 20%" />
        <Fact label="Belief" value="61% likely" />
        <Fact label="Success" value="≥18% lift" />
        <Fact label="Resolve" value="Sep 25" />
      </div>
      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        <p className="text-xs leading-5 text-slate-500">
          The question, probability, success rule, and deadline become an
          immutable first version.
        </p>
      </div>
    </SceneShell>
  );
}

function CompareScene() {
  const options = [
    {
      name: '20% controlled launch',
      p: 61,
      value: '+$182k',
      risk: '89% reversible',
      score: 82,
      best: true,
    },
    {
      name: 'Full launch',
      p: 64,
      value: '+$246k',
      risk: '41% reversible',
      score: 63,
    },
    {
      name: 'Keep current pricing',
      p: 34,
      value: '+$42k',
      risk: 'Opportunity cost',
      score: 29,
    },
  ];
  return (
    <SceneShell label="Action comparison" icon={GitBranch}>
      <div className="space-y-3">
        {options.map((option) => (
          <div
            key={option.name}
            className={cn(
              'relative grid grid-cols-[1fr_auto] gap-4 rounded-2xl border p-4 transition',
              option.best
                ? 'border-emerald-400 bg-emerald-50 ring-2 ring-emerald-100'
                : 'border-slate-200',
            )}
          >
            <div>
              {option.best && (
                <span className="mb-2 inline-flex rounded-full bg-emerald-700 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-white">
                  Recommended
                </span>
              )}
              <p className="text-sm font-bold text-slate-900">{option.name}</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400">
                <span>
                  Expected ARR <b className="text-slate-700">{option.value}</b>
                </span>
                <span>{option.risk}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-2">
                <span className="font-editorial text-3xl text-slate-950">
                  {option.p}%
                </span>
                {option.best && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                )}
              </div>
              <p
                className={cn(
                  'mt-1 text-[9px] font-black uppercase tracking-wider',
                  option.best ? 'text-emerald-700' : 'text-slate-400',
                )}
              >
                Score {option.score}
              </p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 text-center text-xs font-semibold text-slate-400">
        Decision score = expected value × confidence × reversibility
      </p>
    </SceneShell>
  );
}

function UpdateScene({ revealed }: { revealed: boolean }) {
  return (
    <SceneShell label="Belief update" icon={TrendingUp}>
      <div className="grid gap-4 sm:grid-cols-[0.78fr_1.22fr]">
        <div className="flex flex-col justify-between rounded-2xl bg-[#0b1511] p-5 text-white">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/35">
              Target outcome
            </p>
            <div className="mt-3 flex items-end gap-2">
              <span className="font-editorial text-6xl leading-none">
                {revealed ? '68' : '61'}
              </span>
              <span className="mb-1 text-xl text-white/40">%</span>
            </div>
          </div>
          <div className="mt-8">
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#d4ff4f] transition-[width] duration-1000"
                style={{ width: revealed ? '68%' : '61%' }}
              />
            </div>
            <p
              className={cn(
                'mt-2 text-[10px]',
                revealed ? 'text-[#d4ff4f]' : 'text-white/35',
              )}
            >
              {revealed
                ? 'High confidence · 3 pts above threshold'
                : 'Medium confidence · threshold 65%'}
            </p>
          </div>
        </div>
        <div
          className={cn(
            'rounded-2xl border p-5 transition-all duration-700',
            revealed
              ? 'border-emerald-300 bg-emerald-50 opacity-100'
              : 'border-dashed border-slate-300 bg-slate-50 opacity-45',
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <span
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-xl',
                revealed
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-400',
              )}
            >
              <TrendingUp className="h-4 w-4" />
            </span>
            {revealed && (
              <span className="rounded-full bg-[#d4ff4f] px-2 py-1 text-[10px] font-black text-lime-950">
                +7 pts
              </span>
            )}
          </div>
          <p className="mt-5 text-sm font-bold text-slate-900">
            Trial-to-team invite depth
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {revealed
              ? 'Invite depth rose from 2.1 to 2.8—its six-week high.'
              : 'Waiting for a material signal…'}
          </p>
          {revealed && (
            <div className="mt-4 border-t border-emerald-200 pt-3 text-[10px] font-bold text-emerald-700">
              Threshold crossed · action recommended
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-slate-50 px-4 py-3 text-[11px] text-slate-500">
        <Clock3 className="h-4 w-4 text-slate-400" />
        <span>Belief history:</span>
        <b className="text-slate-800">61% · Aug 07</b>
        <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
        <b className={revealed ? 'text-emerald-700' : 'text-slate-400'}>
          {revealed ? '68% · Today' : 'Awaiting update'}
        </b>
      </div>
    </SceneShell>
  );
}

function CommitScene() {
  const commitments = [
    { label: 'Owner', value: 'Maya Chen' },
    { label: 'Quality gate', value: 'Aug 25' },
    { label: 'Rollback', value: 'Auto-armed' },
  ];
  return (
    <SceneShell label="Commitment with guardrails" icon={ShieldCheck}>
      <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-5">
        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.15em] text-emerald-700">
          <Sparkles className="h-4 w-4" /> Recommended action
        </div>
        <p className="mt-3 text-lg font-bold leading-7 text-emerald-950">
          Run a reversible 20% traffic experiment.
        </p>
        <p className="mt-2 text-xs leading-5 text-emerald-900/60">
          Preserve annual pricing and expand only after the 14-day quality gate.
        </p>
      </div>
      <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
            <X className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-rose-600">
              Automatic rollback trigger
            </p>
            <p className="mt-2 text-sm font-bold leading-6 text-rose-950">
              Activation drops more than 4%
            </p>
            <p className="mt-1 text-xs leading-5 text-rose-900/55">
              or support contacts exceed 8% for three consecutive days
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {commitments.map((item) => (
          <div
            key={item.label}
            className="rounded-xl bg-slate-100 px-2 py-3 text-center"
          >
            <div className="flex items-center justify-center gap-1 text-[9px] font-bold text-slate-400">
              <Check className="h-3 w-3 text-emerald-600" />
              {item.label}
            </div>
            <p className="mt-1 text-[10px] font-black text-slate-700">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </SceneShell>
  );
}

function LearnScene() {
  return (
    <SceneShell label="Resolved decision · Sep 25" icon={CheckCircle2}>
      <div className="grid gap-4 sm:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-2xl bg-[#0b1511] p-5 text-white">
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#d4ff4f]">
            Outcome · Yes
          </p>
          <p className="mt-3 font-editorial text-5xl">+21%</p>
          <p className="mt-1 text-xs text-white/45">
            paid conversion lift · 45 days
          </p>
          <div className="mt-6 border-t border-white/10 pt-4">
            <p className="text-[10px] text-white/35">Decision quality</p>
            <p className="mt-1 text-sm font-bold">
              Strong process · good outcome
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <LearningRow label="Forecast calibration" value="Strong" score={88} />
          <LearningRow label="Evidence quality" value="High" score={91} />
          <LearningRow label="Execution discipline" value="Strong" score={86} />
          <LearningRow label="Luck contribution" value="Low" score={18} muted />
        </div>
      </div>
      <div className="mt-5 rounded-2xl bg-orange-100 p-4 text-orange-950">
        <div className="flex items-start gap-3">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-orange-700" />
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-orange-600">
              What FutureOS learned
            </p>
            <p className="mt-1.5 text-sm font-bold">
              Invite depth is a leading indicator for team conversion in this
              workspace.
            </p>
            <p className="mt-1 text-[10px] text-orange-900/50">
              Future pricing decisions now inherit this signal with higher
              evidence weight.
            </p>
          </div>
        </div>
      </div>
    </SceneShell>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">
        {label}
      </p>
      <p className="mt-1.5 text-xs font-bold text-slate-800">{value}</p>
    </div>
  );
}

function LearningRow({
  label,
  value,
  score,
  muted,
}: {
  label: string;
  value: string;
  score: number;
  muted?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between text-[10px]">
        <span className="font-bold text-slate-500">{label}</span>
        <span className="font-black text-slate-800">{value}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn(
            'h-full rounded-full',
            muted ? 'bg-slate-300' : 'bg-[#9edc35]',
          )}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

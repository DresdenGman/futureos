'use client';

import { RefreshCcw } from 'lucide-react';

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="page-shell flex min-h-[70vh] flex-col items-center justify-center text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-950 text-rose-100">
        <RefreshCcw className="h-6 w-6" />
      </span>
      <p className="eyebrow mt-6 text-rose-700">A recoverable error occurred</p>
      <h1 className="mt-3 font-editorial text-5xl tracking-[-0.05em] text-[#0b1511]">
        Reality interrupted the model.
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
        Your saved decisions are unchanged. Try loading this view again.
      </p>
      <button
        onClick={reset}
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-[#0b1511] px-5 text-xs font-black text-white"
      >
        <RefreshCcw className="h-4 w-4" /> Try again
      </button>
    </div>
  );
}

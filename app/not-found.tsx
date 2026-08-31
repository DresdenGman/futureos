import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="page-shell flex min-h-[70vh] flex-col items-center justify-center text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0b1511] text-[#d4ff4f]">
        <Compass className="h-6 w-6" />
      </span>
      <p className="eyebrow mt-6">404 · Unknown future</p>
      <h1 className="mt-3 font-editorial text-5xl tracking-[-0.05em] text-[#0b1511]">
        This path did not resolve.
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
        The page may have moved, or the decision belongs to another workspace.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-[#0b1511] px-5 text-xs font-black text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Return home
      </Link>
    </div>
  );
}

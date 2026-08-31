import { LoaderCircle } from 'lucide-react';

export default function Loading() {
  return (
    <div className="page-shell flex min-h-[60vh] items-center justify-center gap-3 text-sm font-bold text-slate-400">
      <LoaderCircle className="h-5 w-5 animate-spin" /> Preparing FutureOS…
    </div>
  );
}

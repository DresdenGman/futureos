'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function DeleteDecisionDialog({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  async function removeDecision() {
    if (confirmation !== title || deleting) return;
    setDeleting(true);
    setError('');
    try {
      const response = await fetch(`/api/decisions/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok)
        throw new Error(data.error ?? 'The decision could not be deleted.');
      router.replace('/workspace?deleted=1');
      router.refresh();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'The decision could not be deleted.',
      );
      setDeleting(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (deleting) return;
        setOpen(nextOpen);
        if (!nextOpen) {
          setConfirmation('');
          setError('');
        }
      }}
    >
      <AlertDialogTrigger className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-xs font-black text-rose-700 transition hover:bg-rose-50">
        <Trash2 className="h-4 w-4" /> Delete this decision
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-rose-100 text-rose-700">
            <Trash2 />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete this decision?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the decision contract, its baseline and
            every evidence update. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <label htmlFor="delete-decision-confirmation" className="space-y-2">
          <span className="text-xs font-bold text-slate-700">
            Type the complete title to confirm:
          </span>
          <span className="block rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
            {title}
          </span>
          <Input
            id="delete-decision-confirmation"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            autoComplete="off"
            maxLength={120}
            aria-invalid={Boolean(error)}
          />
        </label>
        {error && (
          <p role="alert" className="text-xs font-bold text-rose-700">
            {error}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>
            Keep decision
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={removeDecision}
            disabled={confirmation !== title || deleting}
          >
            {deleting ? <LoaderCircle className="animate-spin" /> : <Trash2 />}
            Delete permanently
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

'use client';

import { useState } from 'react';
import { DatabaseZap, LoaderCircle, Trash2 } from 'lucide-react';
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
import { DELETE_ALL_DATA_PHRASE } from '@/lib/data-deletion-contract';

export function DeleteAccountDataDialog({
  onDeleted,
}: {
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  async function removeAccountData() {
    if (confirmation !== DELETE_ALL_DATA_PHRASE || deleting) return;
    setDeleting(true);
    setError('');
    try {
      const response = await fetch('/api/account/data', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok)
        throw new Error(data.error ?? 'Your data could not be deleted.');
      setOpen(false);
      setConfirmation('');
      onDeleted();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'Your data could not be deleted.',
      );
    } finally {
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
      <AlertDialogTrigger className="focus-ring mt-4 inline-flex items-center gap-2 text-xs font-black text-rose-700 hover:text-rose-900">
        <Trash2 className="h-3.5 w-3.5" /> Delete all decision data
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-rose-100 text-rose-700">
            <DatabaseZap />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete all FutureOS data?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes every decision, baseline, update and
            resolution associated with your signed-in FutureOS identity. It does
            not delete your ChatGPT account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <label htmlFor="delete-all-data-confirmation" className="space-y-2">
          <span className="text-xs font-bold text-slate-700">
            Type {DELETE_ALL_DATA_PHRASE} to confirm:
          </span>
          <Input
            id="delete-all-data-confirmation"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            autoComplete="off"
            maxLength={DELETE_ALL_DATA_PHRASE.length}
            aria-invalid={Boolean(error)}
          />
        </label>
        <p className="text-[11px] leading-5 text-slate-500">
          Anonymous public-tool counts cannot be linked back to your account.
          This action also clears the anonymous measurement cookie on this
          device.
        </p>
        {error && (
          <p role="alert" className="text-xs font-bold text-rose-700">
            {error}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>
            Keep my data
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={removeAccountData}
            disabled={confirmation !== DELETE_ALL_DATA_PHRASE || deleting}
          >
            {deleting ? <LoaderCircle className="animate-spin" /> : <Trash2 />}
            Delete all data
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

import type { Metadata } from 'next';
import { requireChatGPTUser } from '@/app/chatgpt-auth';
import { WorkspaceClient } from '@/components/workspace-client';

export const metadata: Metadata = { title: 'Workspace' };
export const dynamic = 'force-dynamic';

export default async function WorkspacePage() {
  const user = await requireChatGPTUser('/workspace');
  return (
    <WorkspaceClient displayName={user.fullName?.split(' ')[0] ?? 'there'} />
  );
}

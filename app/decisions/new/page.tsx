import type { Metadata } from 'next';
import { requireChatGPTUser } from '@/app/chatgpt-auth';
import { NewDecisionForm } from '@/components/new-decision-form';

export const metadata: Metadata = { title: 'New decision' };
export const dynamic = 'force-dynamic';

export default async function NewDecisionPage({
  searchParams,
}: {
  searchParams: Promise<{ prompt?: string }>;
}) {
  await requireChatGPTUser('/decisions/new');
  const { prompt } = await searchParams;
  return <NewDecisionForm initialPrompt={prompt?.slice(0, 600) ?? ''} />;
}

import type { Metadata } from 'next';
import { requireChatGPTUser } from '@/app/chatgpt-auth';
import { DecisionDetail } from '@/components/decision-detail';

export const metadata: Metadata = { title: 'Decision contract' };
export const dynamic = 'force-dynamic';

export default async function DecisionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  await requireChatGPTUser(`/decisions/${id}`);
  const query = await searchParams;
  return <DecisionDetail id={id} justCreated={query.created === '1'} />;
}

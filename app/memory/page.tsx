import type { Metadata } from 'next';
import { requireChatGPTUser } from '@/app/chatgpt-auth';
import { MemoryClient } from '@/components/memory-client';

export const metadata: Metadata = { title: 'Decision memory' };
export const dynamic = 'force-dynamic';

export default async function MemoryPage() {
  await requireChatGPTUser('/memory');
  return <MemoryClient />;
}

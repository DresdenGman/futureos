import type { Metadata } from 'next';
import { requireChatGPTUser } from '@/app/chatgpt-auth';
import { DecisionMapClient } from '@/components/decision-map-client';

export const metadata: Metadata = { title: 'Decision map' };
export const dynamic = 'force-dynamic';

export default async function DecisionMapPage() {
  await requireChatGPTUser('/map');
  return <DecisionMapClient />;
}

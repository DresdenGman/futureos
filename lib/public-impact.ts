import { getDatabase } from '@/lib/db';

export type ImpactTool = {
  id: 'decision_quality' | 'calibration';
  label: string;
  starts: number;
  completions: number;
  shares: number;
  completionRate: number;
};

export type ImpactSource = {
  id: string;
  label: string;
  completions: number;
};

export type PublicImpact = {
  status: 'live' | 'unavailable';
  participantDays: number;
  starts: number;
  completions: number;
  shares: number;
  completionRate: number;
  sinceDay: string | null;
  latestDay: string | null;
  tools: ImpactTool[];
  sources: ImpactSource[];
};

type EventCountRow = {
  tool: string;
  event_name: string;
  count: number;
};

type SourceCountRow = { source: string; count: number };

const toolLabels: Record<ImpactTool['id'], string> = {
  decision_quality: 'Decision Quality Score',
  calibration: 'Probability Calibration Test',
};

const sourceLabels: Record<string, string> = {
  direct: 'Direct / untagged',
  producthunt: 'Product Hunt',
  hackernews: 'Hacker News',
  reddit: 'Reddit',
  linkedin: 'LinkedIn',
  x: 'X',
  lesswrong: 'LessWrong',
  metaculus: 'Metaculus',
  github: 'GitHub',
  other: 'Other',
};

export async function getPublicImpact(): Promise<PublicImpact> {
  const tools: ImpactTool[] = (
    ['decision_quality', 'calibration'] as const
  ).map((id) => ({
    id,
    label: toolLabels[id],
    starts: 0,
    completions: 0,
    shares: 0,
    completionRate: 0,
  }));

  try {
    const db = getDatabase();
    const [eventCounts, sourceCounts, visitorCount, dateRange] =
      await Promise.all([
        db
          .prepare(`SELECT tool, event_name, COUNT(*) AS count
            FROM public_events GROUP BY tool, event_name`)
          .all<EventCountRow>(),
        db
          .prepare(`SELECT source, COUNT(*) AS count
            FROM public_events WHERE event_name = 'tool_completed'
            GROUP BY source ORDER BY count DESC`)
          .all<SourceCountRow>(),
        db
          .prepare(`SELECT COUNT(DISTINCT visitor_key) AS count
            FROM public_events WHERE event_name = 'tool_started'`)
          .first<{ count: number }>(),
        db
          .prepare(`SELECT MIN(event_day) AS since_day,
            MAX(event_day) AS latest_day FROM public_events`)
          .first<{ since_day: string | null; latest_day: string | null }>(),
      ]);

    for (const row of eventCounts.results) {
      const tool = tools.find((candidate) => candidate.id === row.tool);
      if (!tool) continue;
      if (row.event_name === 'tool_started') tool.starts = row.count;
      if (row.event_name === 'tool_completed') tool.completions = row.count;
      if (row.event_name === 'share_clicked') tool.shares = row.count;
    }
    for (const tool of tools) {
      tool.completionRate = percent(tool.completions, tool.starts);
    }

    const starts = tools.reduce((sum, tool) => sum + tool.starts, 0);
    const completions = tools.reduce((sum, tool) => sum + tool.completions, 0);
    const shares = tools.reduce((sum, tool) => sum + tool.shares, 0);

    return {
      status: 'live',
      participantDays: visitorCount?.count ?? 0,
      starts,
      completions,
      shares,
      completionRate: percent(completions, starts),
      sinceDay: dateRange?.since_day ?? null,
      latestDay: dateRange?.latest_day ?? null,
      tools,
      sources: sourceCounts.results.map((row) => ({
        id: row.source,
        label: sourceLabels[row.source] ?? 'Other',
        completions: row.count,
      })),
    };
  } catch {
    return emptyImpact(tools);
  }
}

function emptyImpact(tools: ImpactTool[]): PublicImpact {
  return {
    status: 'unavailable',
    participantDays: 0,
    starts: 0,
    completions: 0,
    shares: 0,
    completionRate: 0,
    sinceDay: null,
    latestDay: null,
    tools,
    sources: [],
  };
}

function percent(numerator: number, denominator: number) {
  return denominator ? Math.round((numerator / denominator) * 100) : 0;
}

export type PublicSource =
  | 'direct'
  | 'producthunt'
  | 'hackernews'
  | 'reddit'
  | 'linkedin'
  | 'x'
  | 'lesswrong'
  | 'metaculus'
  | 'github'
  | 'challenge'
  | 'other';

const knownSources = new Set<PublicSource>([
  'direct',
  'producthunt',
  'hackernews',
  'reddit',
  'linkedin',
  'x',
  'lesswrong',
  'metaculus',
  'github',
  'challenge',
  'other',
]);

export function readPublicSource(): PublicSource {
  if (typeof window === 'undefined') return 'direct';
  const raw = new URLSearchParams(window.location.search)
    .get('utm_source')
    ?.toLowerCase();
  return raw && knownSources.has(raw as PublicSource)
    ? (raw as PublicSource)
    : raw
      ? 'other'
      : 'direct';
}

export async function recordPublicEvent(
  eventName: 'tool_started' | 'tool_completed' | 'share_clicked',
  tool: 'decision_quality' | 'calibration',
) {
  try {
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName,
        tool,
        source: readPublicSource(),
      }),
      keepalive: true,
    });
  } catch {
    // Measurement must never block the tool itself.
  }
}

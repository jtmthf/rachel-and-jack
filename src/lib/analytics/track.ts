import { TrackEvent } from './model';

export function track(event: Omit<TrackEvent, 'id' | 'timestamp'>) {
  fetch('/api/analytics/track', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...event,
    }),
  });
}

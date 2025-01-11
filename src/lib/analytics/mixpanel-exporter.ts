import { TrackEvent } from './model';

const BASE_URL = 'https://api.mixpanel.com';

type ImportRequest = Array<{
  event: string;
  properties: {
    time: number;
    distinct_id: string;
    $insert_id: string;
    $os?: string;
    $os_version?: string;
    $browser?: string;
    $browser_version?: string;
    $device?: string;
    $referrer?: string;
    $referring_domain?: string;
    [key: string]: unknown;
  };
}>;

type Event = TrackEvent & {
  ip?: string;
  deviceId: string;
  userId?: string;
  userAgent: ReturnType<typeof import('next/server').userAgent>;
  referrer?: URL;
};

export async function importEvents(events: Event[]) {
  const url = `${BASE_URL}/import?${new URLSearchParams({
    strict: '1',
    project_id: process.env.MIXPANEL_PROJECT_ID!,
  })}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(
        `${process.env.MIXPANEL_PROJECT_TOKEN}:`,
      ).toString('base64')}`,
    },
    body: JSON.stringify(
      events.map((event) => ({
        event: event.name,
        properties: {
          time: new Date(event.timestamp).getTime(),
          distinct_id: event.deviceId,
          ip: event.ip,
          $user_id: event.userId,
          $insert_id: event.id,
          $os: event.userAgent.os.name,
          $os_version: event.userAgent.os.version,
          $browser: event.userAgent.browser.name,
          $browser_version: event.userAgent.browser.version,
          $device: event.userAgent.device.model,
          $referrer: event.referrer?.href,
          $referring_domain: event.referrer?.hostname,
          ...event.properties,
        },
      })) as ImportRequest,
    ),
  });

  if (!res.ok) {
    throw new Error(`Failed to import events: ${res.statusText}`);
  }
}

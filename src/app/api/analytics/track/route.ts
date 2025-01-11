import { importEvents } from '@/lib/analytics/mixpanel-exporter';
import { TrackEvent } from '@/lib/analytics/model';
import { AssertError, Value } from '@sinclair/typebox/value';
import { ipAddress } from '@vercel/functions';
import { NextRequest, userAgent } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  const body = await request.json();

  try {
    const event = Value.Parse(TrackEvent, body);

    await importEvents([
      {
        id: event.id,
        timestamp: event.timestamp,
        name: event.name,
        properties: event.properties,
        ip: ipAddress(request),
        deviceId: request.cookies.get('device_id')!.value,
        userId: request.cookies.get('user_id')?.value,
        userAgent: userAgent(request),
        referrer: new URL(request.headers.get('Referer')!),
      },
    ]);

    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof AssertError) {
      const errors = [...error.Errors()];

      console.warn('Validation errors:', errors);

      return Response.json(
        { success: false, errors: [...error.Errors()] },
        {
          status: 400,
        },
      );
    } else {
      console.error('Unexpected error:', error);

      return Response.json(
        { success: false, errors: [{ message: 'Unexpected error' }] },
        {
          status: 500,
        },
      );
    }
  }
}

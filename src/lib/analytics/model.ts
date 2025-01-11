import { Static, Type } from '@sinclair/typebox';

export const TrackEvent = Type.Object({
  id: Type.String(),
  timestamp: Type.String(),
  name: Type.String(),
  properties: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
});

export type TrackEvent = Static<typeof TrackEvent>;

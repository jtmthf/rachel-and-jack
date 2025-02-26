import RichText from '@/components/rich-text';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDateWithOrdinal } from '@/lib/format-date';
import { cn } from '@/lib/utils';
import type { ScheduleBlock as ScheduleBlockProps } from '@/payload-types';
import { MapPin } from 'lucide-react';
import { Baskervville_SC } from 'next/font/google';
import { draftMode } from 'next/headers';

const baskerville = Baskervville_SC({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

export default async function ScheduleBlock({
  events: rawEvents,
}: ScheduleBlockProps) {
  const { isEnabled: draft } = await draftMode();

  const events =
    rawEvents?.filter(
      (event) => typeof event === 'object' && (!event.draft || draft),
    ) ?? [];
  const dayOfWeekFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
  });

  return (
    <>
      <Card className="bg-background hidden p-16 shadow-none md:block">
        <Tabs defaultValue={events.at(0)?.title}>
          {events.map((event) => (
            <TabsContent key={event.id} value={event.title}>
              <Card className="bg-background flex justify-between gap-16 p-16 shadow-none">
                <div>
                  <div className={cn('mb-4 text-3xl', baskerville.className)}>
                    {event.title}
                  </div>
                  <RichText data={event.description} />
                </div>
                <div>
                  <p className="text-lg font-bold">{event.location}</p>
                  <p>{dayOfWeekFormatter.format(new Date(event.date))}</p>
                  <p>{formatDateWithOrdinal(new Date(event.date))}</p>
                  <p className="mb-4">{event.time}</p>
                  <p className="text-lg font-bold">Attire</p>
                  <p>{event.attire}</p>
                </div>
              </Card>
            </TabsContent>
          ))}

          <div className="relative">
            <TabsList className="h-auto w-full bg-transparent p-0">
              {events.map((event) => (
                <TabsTrigger
                  key={event.id}
                  value={event.title}
                  className="group data-[state=active]:text-foreground relative flex flex-1 cursor-pointer flex-col items-center gap-2 px-2 pt-4 pb-4 hover:bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  {/* Circle */}
                  <div className="border-primary bg-background data-[state=active]:bg-primary data-[state=active]:border-primary group-data-[state=active]:bg-primary absolute -top-5 size-6 rounded-full border-2 transition-colors" />

                  <div className="space-y-1 text-center">
                    <div
                      className={cn(
                        'text-base whitespace-nowrap sm:text-lg',
                        baskerville.className,
                      )}
                    >
                      {event.title}
                    </div>
                    <div className="text-sm whitespace-nowrap sm:text-base">
                      {dayOfWeekFormatter.format(new Date(event.date))}
                    </div>
                    <div className="text-sm whitespace-nowrap sm:text-base">
                      {formatDateWithOrdinal(new Date(event.date))}
                    </div>
                    <div className="text-sm whitespace-nowrap sm:text-base">
                      {event.time}
                    </div>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      </Card>
      <div className="md:hidden">
        <div className="relative">
          {/* Vertical line */}
          <div className="bg-primary absolute left-4 h-full w-1 -translate-x-1/2 transform" />
          {events.map((event) => (
            <div
              key={event.id}
              className={`flex flex-row-reverse items-center not-last:mb-12`}
            >
              <div className="border-primary bg-card absolute left-4 size-8 -translate-x-1/2 -translate-y-4 transform rounded-full border-4"></div>
              <Card className={`ml-12 w-full`}>
                <CardContent className="p-6">
                  <h3 className="mb-2 text-xl font-semibold">{event.title}</h3>
                  <p className="text-md text-foreground/70 mb-2">
                    <MapPin size="1.25em" className="inline align-top" />{' '}
                    {event.location}
                  </p>
                  <p className="mb-2">
                    {dayOfWeekFormatter.format(new Date(event.date))}
                  </p>
                  <p className="mb-2">
                    {formatDateWithOrdinal(new Date(event.date))}
                  </p>
                  <p className="mb-2">{event.time}</p>
                  <p className="mb-2 text-lg font-semibold">Attire</p>
                  <p className="mb-2">{event.attire}</p>
                  <RichText data={event.description} />
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

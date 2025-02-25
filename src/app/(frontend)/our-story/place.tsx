import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

type Props = {
  name: string;
  location: string;
  children: React.ReactNode;
};

export function Place({ name, location, children }: Props) {
  return (
    <div className={`flex flex-row-reverse items-center not-last:mb-12`}>
      <div className="border-primary bg-card absolute left-4 size-8 -translate-x-1/2 -translate-y-4 transform rounded-full border-4"></div>
      <Card className={`ml-12 w-full`}>
        <CardContent className="p-6">
          <h3 className="mb-2 text-xl font-semibold">{name}</h3>
          <p className="text-md text-foreground/70 mb-2">
            <MapPin size="1.25em" className="inline align-top" /> {location}
          </p>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}

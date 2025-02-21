import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

type Props = {
  name: string;
  location: string;
  children: React.ReactNode;
};

export function Place({ name, location, children }: Props) {
  return (
    <div
      className={`flex flex-row-reverse items-center [&:not(:last-child)]:mb-12`}
    >
      <div className="absolute left-4 h-8 w-8 -translate-x-1/2 -translate-y-4 transform rounded-full border-4 border-primary bg-card"></div>
      <Card className={`ml-12 w-full`}>
        <CardContent className="p-6">
          <h3 className="mb-2 text-xl font-semibold">{name}</h3>
          <p className="text-md mb-2 text-foreground/70">
            <MapPin size="1.25em" className="inline align-top" /> {location}
          </p>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}

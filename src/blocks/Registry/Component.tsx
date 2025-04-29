import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { registry_purchase } from '@/payload-generated-schema';
import {
  RegistryBlock as RegistryBlockProps,
  RegistryItem,
} from '@/payload-types';
import configPromise from '@payload-config';
import { eq, sum } from '@payloadcms/db-vercel-postgres/drizzle';
import { draftMode } from 'next/headers';
import Image from 'next/image';
import { getPayload } from 'payload';
import { cache } from 'react';
import { BaseBlockProps } from '../RenderBlocks';
import { RegistryItemDialog } from './RegistryItemDialog';

type Props = BaseBlockProps & RegistryBlockProps;

export default async function RegistryBlock({ slug }: Props) {
  const registryItems = await queryRegistryItems();

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {registryItems.map((item) => (
        <RegistryItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}

type RegistryItemCardProps = {
  item: RegistryItem;
};

async function RegistryItemCard({ item }: RegistryItemCardProps) {
  const purchasedCount = await countRegistryPurchases(item.id);

  const formatPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <Card key={item.id} className="flex flex-col">
      <CardHeader>
        {typeof item.image === 'object' && (
          <Image
            src={item.image.url!}
            alt={item.title}
            width={300}
            height={300}
            className="aspect-square w-full object-cover"
          />
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <CardTitle className="mb-2">{item.title}</CardTitle>
        <CardDescription>
          {item.price && (
            <span className="text-sm font-semibold">
              {formatPrice.format(item.price)}
            </span>
          )}
        </CardDescription>
        {item.quantityRequested && (
          <div className="mt-auto pt-2">
            <div className="mb-1 flex justify-between text-sm">
              <span>Requested: {item.quantityRequested}</span>
              <span>
                Received: {purchasedCount} of {item.quantityRequested}
              </span>
            </div>
            <Progress
              value={(purchasedCount / item.quantityRequested) * 100}
              className="h-2"
            />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Dialog key={item.id}>
          <DialogTrigger asChild>
            <Button
              className="w-full"
              disabled={purchasedCount >= (item.quantityRequested ?? 0)}
            >
              Purchase This Gift
            </Button>
          </DialogTrigger>
          <RegistryItemDialog item={item} purchasedCount={purchasedCount} />
        </Dialog>
      </CardFooter>
    </Card>
  );
}

const queryRegistryItems = cache(async () => {
  const { isEnabled: draft } = await draftMode();
  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: 'registry-item',
    draft,
    pagination: false,
    overrideAccess: draft,
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      quantityRequested: true,
      url: true,
      image: true,
      store: true,
    },
  });

  return result.docs;
});

const countRegistryPurchases = cache(async (itemId: number) => {
  const payload = await getPayload({ config: configPromise });

  const [{ purchasedCount }] = await payload.db.drizzle
    .select({
      purchasedCount: sum(registry_purchase.quantity).mapWith(Number),
    })
    .from(registry_purchase)
    .where(eq(registry_purchase.registryItem, itemId));

  return purchasedCount;
});

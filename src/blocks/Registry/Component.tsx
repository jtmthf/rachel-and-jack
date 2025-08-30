import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { registry_purchase } from '@/payload-generated-schema';
import {
  RegistryBlock as RegistryBlockProps,
  RegistryItem,
} from '@/payload-types';
import configPromise from '@payload-config';
import { inArray, sql } from '@payloadcms/db-vercel-postgres/drizzle';
import Image from 'next/image';
import { getPayload } from 'payload';
import { cache } from 'react';
import { BaseBlockProps } from '../RenderBlocks';
import { HoneymoonFundCard } from './HoneymoonFundCard';
import { RegistryItemDialog } from './RegistryItemDialog';

type Props = BaseBlockProps & RegistryBlockProps;

export default async function RegistryBlock({ items }: Props) {
  const registryItems =
    items?.filter((item): item is RegistryItem => typeof item === 'object') ??
    [];
  const purchasedCounts = await countRegistryPurchases(
    registryItems.map((item) => item.id),
  );
  const registryItemsWithCounts = registryItems.map((item) => ({
    ...item,
    purchasedCount: purchasedCounts.get(item.id) ?? 0,
  }));
  const { availableItems = [], purchasedItems = [] } = Object.groupBy(
    registryItemsWithCounts,
    (item) =>
      item.quantityRequested && item.purchasedCount < item.quantityRequested
        ? 'availableItems'
        : 'purchasedItems',
  );

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <HoneymoonFundCard />

      {availableItems.map((item) => (
        <RegistryItemCard key={item.id} item={item} />
      ))}
      {purchasedItems.map((item) => (
        <RegistryItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}

type RegistryItemCardProps = {
  item: RegistryItem & { purchasedCount: number };
};

async function RegistryItemCard({
  item: { purchasedCount, ...item },
}: RegistryItemCardProps) {
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
        <RegistryItemDialog item={item} purchasedCount={purchasedCount} />
      </CardFooter>
    </Card>
  );
}

const countRegistryPurchases = cache(async (itemIds: number[]) => {
  const payload = await getPayload({ config: configPromise });

  const result = await payload.db.drizzle
    .select({
      registryItem: registry_purchase.registryItem,
      purchasedCount:
        sql`coalesce(sum(${registry_purchase.quantity}), 0)`.mapWith(Number),
    })
    .from(registry_purchase)
    .where(inArray(registry_purchase.registryItem, itemIds))
    .groupBy(registry_purchase.registryItem);

  return new Map(
    result.map(({ registryItem, purchasedCount }) => [
      registryItem,
      purchasedCount,
    ]),
  );
});

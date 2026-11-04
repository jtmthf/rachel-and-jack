import { registry_purchase } from '@/payload-generated-schema';
import configPromise from '@payload-config';
import { inArray, sql } from '@payloadcms/db-vercel-postgres/drizzle';
import { getPayload } from 'payload';

export async function countRegistryPurchases(itemIds: number[]) {
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
}

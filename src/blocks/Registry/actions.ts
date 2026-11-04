'use server';

import { isRegistryOpen } from '@/lib/registry-status';
import configPromise from '@payload-config';
import { type Static, Type } from '@sinclair/typebox';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { revalidatePath } from 'next/cache';
import { getPayload } from 'payload';
import { countRegistryPurchases } from './queries';

const ajv = addFormats(new Ajv({ coerceTypes: true }), ['email']);

const RegistryPurchaseInput = Type.Object({
  registryItem: Type.Integer({ minimum: 1 }),
  quantity: Type.Integer({ minimum: 1 }),
  purchasedAt: Type.Union([Type.Literal('online'), Type.Literal('in-store')]),
  orderNumber: Type.Optional(Type.String()),
  purchaserName: Type.String({ minLength: 1 }),
  purchaserEmail: Type.Optional(Type.String({ format: 'email' })),
});

const validate = ajv.compile<Static<typeof RegistryPurchaseInput>>(
  RegistryPurchaseInput,
);

export type Result = {
  errors: Record<string, string | undefined>;
  success: boolean;
};

function formError(message: string): Result {
  return { errors: { _form: message }, success: false };
}

export async function submitRegistryPurchase(
  _previousState: Result,
  formData: FormData,
): Promise<Result> {
  if (!isRegistryOpen()) {
    return formError('The registry is closed.');
  }

  // Optional fields left blank arrive as empty strings.
  const data: unknown = Object.fromEntries(
    [...formData.entries()].filter(([, value]) => value !== ''),
  );

  if (!validate(data)) {
    return {
      errors: Object.fromEntries(
        validate.errors?.map((error) => [
          error.instancePath.slice(1) || '_form',
          error.message,
        ]) ?? [],
      ),
      success: false,
    };
  }

  const payload = await getPayload({ config: configPromise });
  const item = await payload.findByID({
    collection: 'registry-item',
    id: data.registryItem,
    depth: 0,
    disableErrors: true,
  });

  if (!item) {
    return formError('This gift is no longer on the registry.');
  }

  if (item.quantityRequested != null) {
    const purchased =
      (await countRegistryPurchases([item.id])).get(item.id) ?? 0;

    if (data.quantity > item.quantityRequested - purchased) {
      return formError('That is more than this gift has remaining.');
    }
  }

  await payload.create({
    collection: 'registry-purchase',
    data: {
      registryItem: data.registryItem,
      quantity: data.quantity,
      purchasedAt: data.purchasedAt,
      orderNumber: data.orderNumber,
      purchaserName: data.purchaserName,
      purchaserEmail: data.purchaserEmail,
    },
  });

  revalidatePath('/registry');

  return {
    errors: {},
    success: true,
  };
}

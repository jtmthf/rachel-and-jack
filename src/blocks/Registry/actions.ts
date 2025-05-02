'use server';

import configPromise from '@payload-config';
import { Type } from '@sinclair/typebox';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { revalidatePath } from 'next/cache';
import { getPayload } from 'payload';

const ajv = addFormats(
  new Ajv({
    coerceTypes: true,
  }),
  [
    'date-time',
    'time',
    'date',
    'email',
    'hostname',
    'ipv4',
    'ipv6',
    'uri',
    'uri-reference',
    'uuid',
    'uri-template',
    'json-pointer',
    'relative-json-pointer',
    'regex',
  ],
);

const validate = ajv.compile(
  Type.Object({
    registryItem: Type.Number(),
    quantity: Type.Number(),
    purchasedAt: Type.Union([Type.Literal('online'), Type.Literal('in-store')]),
    orderNumber: Type.Optional(Type.String()),
    purchaserName: Type.String(),
    purchaserEmail: Type.Optional(Type.String()),
  }),
);

export type Result = {
  errors: Record<string, string | undefined>;
  success: boolean;
};

export async function submitRegistryPurchase(
  _previousState: Result,
  formData: FormData,
): Promise<Result> {
  const payload = await getPayload({ config: configPromise });
  const data = Object.fromEntries(formData.entries());
  const isValid = validate(data);

  if (!isValid) {
    return {
      errors: Object.fromEntries(
        validate.errors?.map((error) => [
          error.instancePath.slice(1),
          error.message,
        ]) ?? [],
      ),
      success: false,
    };
  }

  await payload.create({
    collection: 'registry-purchase',
    data: data as any,
  });

  revalidatePath('/registry');

  return {
    errors: {},
    success: true,
  };
}

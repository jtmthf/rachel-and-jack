import { Page } from '@/payload-types';
import { revalidatePath } from 'next/cache';
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from 'payload';

export const revalidatePage: CollectionAfterChangeHook<Page> = ({ doc }) => {
  revalidatePath(`/${doc?.slug}`);

  return doc;
};

export const revalidateDelete: CollectionAfterDeleteHook<Page> = ({ doc }) => {
  revalidatePath(`/${doc?.slug}`);

  return doc;
};

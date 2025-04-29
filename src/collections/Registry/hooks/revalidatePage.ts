import { Page } from '@/payload-types';
import { revalidatePath } from 'next/cache';
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from 'payload';

export const revalidatePage: CollectionAfterChangeHook<Page> = ({ doc }) => {
  if (doc._status === 'published') {
    revalidatePath(`/registry`);
  }

  return doc;
};

export const revalidateDelete: CollectionAfterDeleteHook<Page> = ({ doc }) => {
  revalidatePath(`/registry`);

  return doc;
};

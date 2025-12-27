import { app } from '@/lib/image-server';
import { handle } from 'hono/vercel';

export const GET = handle(app);

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getDocument } from '@/lib/google-sheet';
import { revalidatePath } from 'next/cache';

const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID!;

export function MessageForm() {
  async function submit(formData: FormData) {
    'use server';

    const doc = await getDocument(GOOGLE_SHEET_ID);
    const sheet = doc.sheetsByIndex[0];
    await sheet.addRow({ messages: formData.get('text') as string });

    revalidatePath('/messages');
  }

  return (
    <form action={submit} className="flex gap-2">
      <Input
        name="text"
        type="text"
        placeholder="Type your message..."
        className="flex-grow"
      />
      <Button type="submit">Post</Button>
    </form>
  );
}

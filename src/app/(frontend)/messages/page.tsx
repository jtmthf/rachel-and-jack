import { MessageForm } from '@/components/message-form';
import { MessageList } from '@/components/message-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDocument } from '@/lib/google-sheet';

const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID!;

interface Message {
  id: number;
  text: string;
}

export default async function MessageBoard() {
  const doc = await getDocument(GOOGLE_SHEET_ID);
  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();
  const messages: Message[] = rows.map((row) => ({
    id: row.get('messages'),
    text: row.get('messages'),
  }));

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Message Board</CardTitle>
        </CardHeader>
        <CardContent>
          <MessageList messages={messages} />
          <div className="mt-4">
            <MessageForm />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: number;
  text: string;
}

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <ScrollArea className="h-[300px] w-full rounded-md border p-4">
      {messages.map((message) => (
        <div key={message.id} className="bg-secondary mb-2 rounded-md p-2">
          {message.text}
        </div>
      ))}
    </ScrollArea>
  );
}

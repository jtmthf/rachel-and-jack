import RichText from '@/components/rich-text';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { AccordionBlock as AccordionBlockProps } from '@/payload-types';

export default function AccordionBlock({ items }: AccordionBlockProps) {
  return (
    <Accordion type="multiple">
      {items?.map((item) => (
        <AccordionItem key={item.id} value={`item-${item.id}`}>
          <AccordionTrigger>{item.title}</AccordionTrigger>
          <AccordionContent>
            {item.content && (
              <RichText data={item.content} enableGutter={false} />
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

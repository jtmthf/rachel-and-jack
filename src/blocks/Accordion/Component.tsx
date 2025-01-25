import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { AccordionBlock as AccordionBlockProps } from '@/payload-types';
import { RichText } from '@payloadcms/richtext-lexical/react';

export default function AccordionBlock({ items }: AccordionBlockProps) {
  return (
    <Accordion type="multiple">
      {items?.map((item) => (
        <AccordionItem key={item.id} value={`item-${item.id}`}>
          <AccordionTrigger>{item.title}</AccordionTrigger>
          <AccordionContent>
            {item.content && <RichText data={item.content} />}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

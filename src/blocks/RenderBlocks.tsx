import {
  AccordionBlock as AccordionBlockProps,
  CardBlock as CardBlockProps,
  ContentBlock as ContentBlockProps,
} from '@/payload-types';
import AccordionBlock from './Accordion/Component';
import CardBlock from './Card/Component';
import ContentBlock from './Content/Component';

const blockComponents = {
  accordion: AccordionBlock,
  card: CardBlock,
  content: ContentBlock,
};

type Props = {
  blocks?: Array<
    AccordionBlockProps | CardBlockProps | ContentBlockProps
  > | null;
};

export default function RenderBlock({ blocks }: Props) {
  return (
    <>
      {blocks?.map((block) => {
        const Block = blockComponents[block.blockType];

        if (!Block) {
          return null;
        }

        // @ts-expect-error - We know this is a valid block
        return <Block key={block.id} {...block} />;
      })}
    </>
  );
}

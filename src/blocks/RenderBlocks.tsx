import {
  AccordionBlock as AccordionBlockProps,
  CardBlock as CardBlockProps,
} from '@/payload-types';
import AccordionBlock from './Accordion/Component';
import CardBlock from './Card/Component';

const blockComponents = {
  accordion: AccordionBlock,
  card: CardBlock,
};

type Props = {
  blocks?: Array<AccordionBlockProps | CardBlockProps> | null;
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

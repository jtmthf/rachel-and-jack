import {
  AccordionBlock as AccordionBlockProps,
  CardBlock as CardBlockProps,
  ContentBlock as ContentBlockProps,
  ThingsToDoBlock as ThingsToDoBlockProps,
} from '@/payload-types';
import AccordionBlock from './Accordion/Component';
import CardBlock from './Card/Component';
import ContentBlock from './Content/Component';
import ThingsToDoBlock from './ThingsToDo/Component';

const blockComponents = {
  accordion: AccordionBlock,
  card: CardBlock,
  content: ContentBlock,
  ['things-to-do']: ThingsToDoBlock,
};

export type BaseBlockProps = {
  slug: string[];
};

type Props = BaseBlockProps & {
  blocks?: Array<
    | AccordionBlockProps
    | CardBlockProps
    | ContentBlockProps
    | ThingsToDoBlockProps
  > | null;
};

export default function RenderBlock({ slug, blocks }: Props) {
  return (
    <>
      {blocks?.map((block) => {
        const Block = blockComponents[block.blockType];

        if (!Block) {
          return null;
        }

        // @ts-expect-error - We know this is a valid block
        return <Block key={block.id} slug={slug} {...block} />;
      })}
    </>
  );
}

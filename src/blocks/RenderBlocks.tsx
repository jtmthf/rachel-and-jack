import {
  AccordionBlock as AccordionBlockProps,
  CardBlock as CardBlockProps,
  ContentBlock as ContentBlockProps,
  PhotoGalleryBlock as PhotoGalleryBlockProps,
  PlaceBlock as PlaceBlockProps,
  RegistryBlock as RegistryBlockProps,
  ScheduleBlock as ScheduleBlockProps,
  StackBlock as StackBlockProps,
  ThingsToDoBlock as ThingsToDoBlockProps,
} from '@/payload-types';
import AccordionBlock from './Accordion/Component';
import CardBlock from './Card/Component';
import ContentBlock from './Content/Component';
import PhotoGalleryBlock from './PhotoGallery/Component';
import PlaceBlock from './Place/Component';
import RegistryBlock from './Registry/Component';
import ScheduleBlock from './Schedule/Component';
import StackBlock from './Stack/Component';
import ThingsToDoBlock from './ThingsToDo/Component';

const blockComponents = {
  accordion: AccordionBlock,
  card: CardBlock,
  content: ContentBlock,
  ['photo-gallery']: PhotoGalleryBlock,
  place: PlaceBlock,
  registry: RegistryBlock,
  schedule: ScheduleBlock,
  stack: StackBlock,
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
    | PhotoGalleryBlockProps
    | PlaceBlockProps
    | RegistryBlockProps
    | ScheduleBlockProps
    | StackBlockProps
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

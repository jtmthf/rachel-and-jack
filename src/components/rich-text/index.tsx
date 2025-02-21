import { cn } from '@/lib/utils';
import {
  DefaultNodeTypes,
  SerializedLinkNode,
} from '@payloadcms/richtext-lexical';
import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
import {
  JSXConvertersFunction,
  LinkJSXConverter,
  RichText as RichTextComponent,
} from '@payloadcms/richtext-lexical/react';
import Link from 'next/link';

type NodeTypes = DefaultNodeTypes;

function internalDocToHref({
  linkNode,
}: {
  linkNode: SerializedLinkNode;
}): string {
  const { value } = linkNode.fields.doc!;
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object');
  }
  const slug = value.slug;
  return `/${slug}`;
}

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({
  defaultConverters,
}) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  link: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({
      nodes: node.children,
    });

    const rel: string | undefined = node.fields.newTab
      ? 'noopener noreferrer'
      : undefined;
    const target: string | undefined = node.fields.newTab
      ? '_blank'
      : undefined;
    const href: string = node.fields.url ?? '';

    if (node.fields.linkType === 'internal') {
      return (
        <Link href={internalDocToHref({ linkNode: node })}>{children}</Link>
      );
    }

    return (
      <a href={href} {...{ rel, target }}>
        {children}
      </a>
    );
  },
});

type Props = {
  data: SerializedEditorState;
  enableGutter?: boolean;
  enableProse?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export default function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = true, ...rest } = props;

  return (
    <RichTextComponent
      converters={jsxConverters}
      className={cn(className, {
        container: enableGutter,
        'max-w-none': !enableGutter,
        'md:prose-md prose mx-auto dark:prose-invert prose-headings:font-light':
          enableProse,
      })}
      {...rest}
    />
  );
}

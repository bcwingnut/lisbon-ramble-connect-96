import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import clsx from 'clsx';

interface MarkdownProps {
  content: string;
  // When true, assumes component sits on a dark/primary background
  isInverted?: boolean;
}

const Markdown: React.FC<MarkdownProps> = ({ content, isInverted = false }) => {
  return (
    <div
      className={clsx(
        'text-sm leading-6 break-words',
        isInverted ? 'text-primary-foreground' : 'text-foreground'
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          h1: ({ node, ...props }) => (
            <h2 {...props} className={clsx('text-lg font-semibold mb-2', props.className)} />
          ),
          h2: ({ node, ...props }) => (
            <h3 {...props} className={clsx('text-base font-semibold mb-2', props.className)} />
          ),
          h3: ({ node, ...props }) => (
            <h4 {...props} className={clsx('text-base font-medium mb-2', props.className)} />
          ),
          p: ({ node, ...props }) => (
            <p {...props} className={clsx('mb-2', props.className)} />
          ),
          ul: ({ node, ...props }) => (
            <ul {...props} className={clsx('list-disc pl-5 space-y-1 mb-2', props.className)} />
          ),
          ol: ({ node, ...props }) => (
            <ol {...props} className={clsx('list-decimal pl-5 space-y-1 mb-2', props.className)} />
          ),
          li: ({ node, ...props }) => <li {...props} className={clsx('leading-6', props.className)} />,
          a: ({ node, ...props }) => (
            <a
              {...props}
              className={clsx(
                'underline underline-offset-4 hover:opacity-80 transition-opacity',
                isInverted ? 'text-primary-foreground' : 'text-primary',
                props.className
              )}
            />
          ),
          code: ({ inline, className, children, ...props }: any) => {
            if (inline) {
              return (
                <code
                  {...props}
                  className={clsx(
                    'px-1 py-0.5 rounded bg-muted text-muted-foreground',
                    isInverted && 'bg-primary-foreground/10 text-primary-foreground',
                    className
                  )}
                >
                  {children}
                </code>
              );
            }
            return (
              <pre
                className={clsx(
                  'w-full overflow-x-auto rounded bg-muted p-3 mb-2',
                  isInverted && 'bg-primary-foreground/10'
                )}
              >
                <code className={clsx('text-xs', className)} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          blockquote: ({ node, ...props }) => (
            <blockquote
              {...props}
              className={clsx(
                'border-l-4 pl-3 italic opacity-80 mb-2',
                isInverted ? 'border-primary-foreground' : 'border-muted'
              )}
            />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto mb-2">
              <table {...props} className={clsx('w-full text-left', props.className)} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th {...props} className={clsx('px-2 py-1 font-semibold', props.className)} />
          ),
          td: ({ node, ...props }) => (
            <td {...props} className={clsx('px-2 py-1 align-top', props.className)} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default Markdown;

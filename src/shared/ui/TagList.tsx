import { Hash, Tag } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/shared/utils';
import { Badge } from './Badge';
import { Tooltip, TooltipContent, TooltipTrigger } from './Tooltip';

type TagListProps = {
  readonly tags: readonly string[];
  readonly maxVisible?: number;
  readonly variant?: 'default' | 'compact' | 'minimal';
  readonly className?: string;
};

export const TagList = React.memo((props: TagListProps) => {
  const { tags, maxVisible = 3, variant = 'default', className } = props;

  if (tags.length === 0) {
    return null;
  }

  const visibleTags = tags.slice(0, maxVisible);
  const hiddenTags = tags.slice(maxVisible);
  const hasHiddenTags = hiddenTags.length > 0;

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-1 text-xs text-muted-foreground', className)}>
        <Tag className='size-3' />
        <span>{tags.length}</span>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-1', className)}>
      {visibleTags.map((tag) => (
        <Badge
          key={tag}
          variant='outline'
          className={cn(
            'font-normal select-none',
            variant === 'compact' ? 'text-[10px] px-1.5 py-0 h-4' : 'text-xs px-2 py-0.5 gap-1'
          )}
        >
          {variant === 'default' && <Hash className='size-2.5 opacity-50' />}
          {tag}
        </Badge>
      ))}

      {hasHiddenTags ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant='secondary'
              className={cn(
                'cursor-default select-none',
                variant === 'compact' ? 'text-[10px] px-1.5 py-0 h-4' : 'text-xs px-2 py-0.5'
              )}
            >
              +{hiddenTags.length}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side='top' className='max-w-48'>
            <div className='flex flex-wrap gap-1'>
              {hiddenTags.map((tag) => (
                <span key={tag} className='text-xs'>
                  #{tag}
                </span>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  );
});

TagList.displayName = 'TagList';

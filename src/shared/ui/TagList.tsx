import { TagIcon } from 'lucide-react';
import { cn } from '@/shared/utils';
import { Badge } from './Badge';
import { Tooltip, TooltipContent, TooltipTrigger } from './Tooltip';

type Props = {
  readonly items: readonly string[];
  readonly maxVisible?: number;
  readonly variant?: 'default' | 'compact' | 'minimal';
  readonly className?: string;
};

const DEFAULT_VISIBLE_TAGS_COUNT = 3;

export const TagList = (props: Props) => {
  const tags = props.items;
  const maxVisible = props.maxVisible ?? DEFAULT_VISIBLE_TAGS_COUNT;
  const variant = props.variant ?? 'default';
  const className = props.className;

  if (tags.length === 0) {
    return null;
  }

  const visibleTags = tags.slice(0, maxVisible);
  const hiddenTags = tags.slice(maxVisible);
  const hasHiddenTags = hiddenTags.length > 0;

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-1 text-xs text-muted-foreground', className)}>
        <TagIcon className='size-3' />
        <span>{tags.length}</span>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-1', className)}>
      {visibleTags.map((tag) => (
        <Badge key={tag} variant='secondary' className='select-none tracking-wide rounded-sm'>
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
};

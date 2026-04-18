import { X } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/shared/utils';
import { Badge } from './Badge';
import { CharCounter } from './CharCounter';

type TagInputProps = {
  readonly tags: readonly string[];
  readonly onTagsChange: (tags: readonly string[]) => void;
  readonly limit?: number;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly className?: string;
};

export const TagInput = React.memo((props: TagInputProps) => {
  const {
    tags,
    onTagsChange,
    limit = 10,
    placeholder = 'Add tag...',
    disabled = false,
    className,
  } = props;

  const [inputValue, setInputValue] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const canAddMore = tags.length < limit;

  const addTag = React.useCallback(
    (value: string) => {
      const trimmed = value.trim().toLowerCase();
      if (trimmed.length === 0) {
        return;
      }
      if (tags.includes(trimmed)) {
        return;
      }
      if (!canAddMore) {
        return;
      }

      onTagsChange([...tags, trimmed]);
      setInputValue('');
    },
    [tags, onTagsChange, canAddMore]
  );

  const removeTag = React.useCallback(
    (tagToRemove: string) => {
      onTagsChange(tags.filter((tag) => tag !== tagToRemove));
    },
    [tags, onTagsChange]
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        addTag(inputValue);
      } else if (event.key === 'Backspace' && inputValue === '' && tags.length > 0) {
        removeTag(tags[tags.length - 1]);
      }
    },
    [inputValue, addTag, removeTag, tags]
  );

  const handleContainerClick = React.useCallback(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className='flex flex-col gap-2'>
      <div
        onClick={handleContainerClick}
        className={cn(
          'flex flex-wrap items-center gap-1.5 min-h-8 w-full rounded-lg border border-input bg-transparent px-2 py-1.5 transition-colors',
          'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50',
          'cursor-text',
          {
            'pointer-events-none cursor-not-allowed bg-input/50 opacity-50': disabled,
          },
          className
        )}
      >
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant='secondary'
            className='gap-1 pl-2.5 pr-1 py-0.5 text-xs font-medium select-none animate-in fade-in-0 zoom-in-95 duration-150'
          >
            {tag}
            <button
              type='button'
              onClick={(event) => {
                event.stopPropagation();
                removeTag(tag);
              }}
              disabled={disabled}
              className='rounded-sm opacity-70 hover:opacity-100 hover:bg-background/20 transition-opacity focus:outline-none focus:ring-1 focus:ring-ring'
            >
              <X className='size-3' />
            </button>
          </Badge>
        ))}

        {canAddMore ? (
          <input
            ref={inputRef}
            type='text'
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => addTag(inputValue)}
            placeholder={tags.length === 0 ? placeholder : ''}
            disabled={disabled}
            className={cn(
              'flex-1 min-w-20 h-5 bg-transparent text-sm outline-none placeholder:text-muted-foreground',
              {
                'cursor-not-allowed': disabled,
              }
            )}
          />
        ) : null}
      </div>

      <div className='flex items-center justify-between text-xs text-muted-foreground'>
        <span>Press Enter to add, Backspace to remove</span>
        <CharCounter current={tags.length} limit={limit} />
      </div>
    </div>
  );
});

TagInput.displayName = 'TagInput';

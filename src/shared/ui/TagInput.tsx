import { XIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/shared/utils';
import { Badge } from './Badge';
import { InputGroup, InputGroupInput } from './InputGroup';

const MAX_TAG_NUMBER = 10;

type Props = {
  readonly tags: readonly string[];
  readonly onTagsChange: (tags: readonly string[]) => void;
  readonly limit?: number;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly className?: string;
};

export const TagInput = (props: Props) => {
  const tags = props.tags;
  const onTagsChange = props.onTagsChange;
  const limit = props.limit ?? MAX_TAG_NUMBER;
  const placeholder = props.placeholder ?? 'Add tag…';
  const disabled = props.disabled ?? false;

  const [inputValue, setInputValue] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const canAddMore = tags.length < limit;

  const handleAddTag = React.useCallback(
    (value: string) => {
      const trimmed = value.trim().toLowerCase();
      if (trimmed.length === 0 || tags.includes(trimmed) || !canAddMore) {
        return;
      }
      onTagsChange([...tags, trimmed]);
      setInputValue('');
    },
    [tags, onTagsChange, canAddMore]
  );

  const handleRemoveTag = React.useCallback(
    (tagToRemove: string) => {
      onTagsChange(tags.filter((tag) => tag !== tagToRemove));
    },
    [tags, onTagsChange]
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleAddTag(inputValue);
        return;
      }

      if (event.key === 'Backspace' && inputValue === '' && tags.length > 0) {
        handleRemoveTag(tags[tags.length - 1]);
        return;
      }
    },
    [inputValue, handleAddTag, handleRemoveTag, tags]
  );

  return (
    <InputGroup
      onClick={() => inputRef.current?.focus()}
      className={cn('h-auto cursor-text', props.className)}
    >
      <div className='flex flex-wrap items-center gap-1.5 px-2 py-1.5'>
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
                handleRemoveTag(tag);
              }}
              disabled={disabled}
              className='rounded-sm opacity-70 hover:opacity-100 hover:bg-background/20 transition-opacity focus:outline-none focus:ring-1 focus:ring-ring'
            >
              <XIcon className='size-3' />
            </button>
          </Badge>
        ))}

        {canAddMore ? (
          <InputGroupInput
            ref={inputRef}
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => handleAddTag(inputValue)}
            placeholder={tags.length === 0 ? placeholder : ''}
            disabled={disabled}
            className='h-5 min-w-20 text-sm'
          />
        ) : null}
      </div>
    </InputGroup>
  );
};

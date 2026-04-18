import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  AlertCircle,
  Check,
  ChevronDown,
  Clock,
  GripVertical,
  MessageSquare,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { Accordion as AccordionPrimitive } from 'radix-ui';
import * as React from 'react';
import {
  type Control,
  Controller,
  type UseFormSetValue,
  useFieldArray,
  useWatch,
} from 'react-hook-form';
import { quizLimits } from '@/entities/quiz';
import {
  AccordionContent,
  Badge,
  Button,
  CharCounter,
  Field,
  FieldError,
  FieldLabel,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  Separator,
  Textarea,
} from '@/shared/ui';
import { cn } from '@/shared/utils';
import { computeSuggestedTimeMs } from './computeSuggestedTime';
import type { QuizFormInput } from './QuizFormInput';

type Props = {
  readonly id: string;
  readonly index: number;
  readonly control: Control<QuizFormInput>;
  readonly setValue: UseFormSetValue<QuizFormInput>;
  readonly onDelete: (() => void) | null;
  readonly disabled: boolean;
  readonly hasError: boolean;
};

export const QuestionCard = React.memo((props: Props) => {
  const sortableState = useSortable({
    id: props.id,
    disabled: props.disabled,
  });

  const question = useWatch({
    control: props.control,
    name: `questions.${props.index}`,
  });

  const text = question?.text ?? '';
  const timeLimit = question?.timeLimit ?? 0;
  const answers = React.useMemo(() => question?.answers ?? [], [question?.answers]);
  const answersCount = answers.length;
  const correctAnswersCount = answers.filter((answer) => answer.isCorrect).length;
  const timeInSeconds = Math.max(1, Math.round(timeLimit / 1_000));

  const suggestedTimeMs = React.useMemo(
    () =>
      computeSuggestedTimeMs({
        text,
        answers: answers.map((answer) => ({ text: answer.text })),
      }),
    [text, answers]
  );
  const suggestedSeconds = Math.round(suggestedTimeMs / 1_000);
  const suggestionDiffers = Math.abs(suggestedTimeMs - timeLimit) >= 500;

  const answersField = useFieldArray({
    control: props.control,
    name: `questions.${props.index}.answers`,
  });

  const handleAddAnswer = React.useCallback(() => {
    if (answersField.fields.length >= quizLimits.maxAnswersPerQuestion) {
      return;
    }
    answersField.append({ text: '', isCorrect: false });
  }, [answersField]);

  const handleRemoveAnswer = React.useCallback(
    (answerIndex: number) => {
      if (answersField.fields.length <= quizLimits.minAnswersPerQuestion) {
        return;
      }
      answersField.remove(answerIndex);
    },
    [answersField]
  );

  const applySuggestion = React.useCallback(() => {
    props.setValue(`questions.${props.index}.timeLimit`, suggestedTimeMs, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [props.setValue, props.index, suggestedTimeMs]);

  const style = {
    transform: CSS.Transform.toString(sortableState.transform),
    transition: sortableState.transition,
  };

  return (
    <AccordionPrimitive.Item
      value={props.id}
      ref={sortableState.setNodeRef}
      style={style}
      className={cn(
        'rounded-xl border bg-card shadow-xs',
        sortableState.isDragging
          ? 'opacity-50 ring-2 ring-primary'
          : 'hover:ring-1 hover:ring-foreground/20 transition-shadow',
        props.hasError && 'border-destructive/60'
      )}
    >
      <AccordionPrimitive.Header className='flex items-center gap-3 p-3'>
        <button
          type='button'
          aria-label='Reorder question'
          disabled={props.disabled}
          className='-ml-1 cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50'
          {...sortableState.attributes}
          {...sortableState.listeners}
        >
          <GripVertical className='size-5' />
        </button>

        <Badge variant='outline' className='shrink-0 tabular-nums'>
          {props.index + 1}
        </Badge>

        <div className='flex min-w-0 flex-1'>
          <p className='truncate text-sm font-medium'>
            {text.length > 0 ? (
              text
            ) : (
              <span className='italic text-muted-foreground'>No question text</span>
            )}
          </p>
        </div>

        <div className='flex shrink-0 items-center gap-2'>
          {props.hasError ? (
            <Badge variant='outline' className='gap-1 border-destructive/60 text-destructive'>
              <AlertCircle className='size-3' />
              <span className='sr-only'>Has errors</span>
            </Badge>
          ) : null}
          <Badge variant='secondary' className='gap-1 text-xs'>
            <Clock className='size-3' />
            {timeInSeconds}s
          </Badge>
          <Badge variant='secondary' className='gap-1 text-xs'>
            <MessageSquare className='size-3' />
            {correctAnswersCount}/{answersCount}
          </Badge>
        </div>

        <div className='flex shrink-0 items-center gap-1'>
          {props.onDelete !== null ? (
            <Button
              type='button'
              variant='ghost'
              size='icon-sm'
              disabled={props.disabled}
              onClick={props.onDelete}
              className='text-muted-foreground hover:text-destructive'
            >
              <Trash2 className='size-4' />
              <span className='sr-only'>Delete question</span>
            </Button>
          ) : null}
          <AccordionPrimitive.Trigger asChild>
            <Button
              type='button'
              variant='ghost'
              size='icon-sm'
              className='text-muted-foreground data-[state=open]:text-foreground [&[data-state=open]>svg]:rotate-180'
            >
              <ChevronDown className='size-4 transition-transform' />
              <span className='sr-only'>Toggle question editor</span>
            </Button>
          </AccordionPrimitive.Trigger>
        </div>
      </AccordionPrimitive.Header>

      <AccordionContent>
        <div className='flex flex-col gap-4 px-3 pb-3'>
          <Separator />

          <Controller
            name={`questions.${props.index}.text`}
            control={props.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className='flex items-center justify-between'>
                  <FieldLabel>Question</FieldLabel>
                  <CharCounter
                    current={(field.value ?? '').length}
                    limit={quizLimits.maxQuestionLength}
                  />
                </div>
                <Textarea
                  {...field}
                  maxLength={quizLimits.maxQuestionLength}
                  disabled={props.disabled}
                  aria-invalid={fieldState.invalid}
                  placeholder='Enter your question here...'
                />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            name={`questions.${props.index}.timeLimit`}
            control={props.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Time Limit</FieldLabel>
                <div className='flex flex-wrap items-center gap-3'>
                  <InputGroup className='max-w-32'>
                    <InputGroupInput
                      type='number'
                      inputMode='numeric'
                      min={5}
                      max={300}
                      value={Math.max(5, Math.round((field.value ?? 0) / 1_000))}
                      disabled={props.disabled}
                      aria-invalid={fieldState.invalid}
                      onBlur={field.onBlur}
                      onChange={(event) => {
                        const seconds = Number(event.target.value);
                        if (Number.isNaN(seconds)) {
                          return;
                        }

                        const clamped = Math.min(300, Math.max(5, seconds));
                        +field.onChange(clamped * 1_000);
                      }}
                    />
                    <InputGroupAddon align='inline-end'>
                      <InputGroupText>s</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  {suggestionDiffers ? (
                    <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                      <span>Suggested: {suggestedSeconds}s</span>
                      <Button
                        type='button'
                        variant='link'
                        size='xs'
                        disabled={props.disabled}
                        onClick={applySuggestion}
                      >
                        Apply
                      </Button>
                    </div>
                  ) : null}
                </div>
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Separator />

          <div className='flex flex-col gap-3'>
            <div className='flex items-center justify-between'>
              <h4 className='text-sm font-medium'>Answers</h4>
              <span className='text-xs text-muted-foreground'>
                Click checkmark to mark as correct
              </span>
            </div>

            <div className='flex flex-col gap-3'>
              {answersField.fields.map((answerField, answerIndex) => (
                <div key={answerField.id} className='flex items-start gap-2'>
                  <Controller
                    name={`questions.${props.index}.answers.${answerIndex}.isCorrect`}
                    control={props.control}
                    render={({ field: isCorrectField }) => (
                      <Button
                        type='button'
                        variant={isCorrectField.value ? 'default' : 'outline'}
                        size='icon-sm'
                        disabled={props.disabled}
                        data-correct={isCorrectField.value ? 'true' : 'false'}
                        onClick={() => isCorrectField.onChange(!isCorrectField.value)}
                        className='data-[correct=true]:bg-emerald-600 data-[correct=true]:text-white data-[correct=true]:hover:bg-emerald-600/90'
                      >
                        <Check className='size-4' />
                        <span className='sr-only'>
                          {isCorrectField.value ? 'Unmark as correct' : 'Mark as correct'}
                        </span>
                      </Button>
                    )}
                  />

                  <Controller
                    name={`questions.${props.index}.answers.${answerIndex}.text`}
                    control={props.control}
                    render={({ field: textField, fieldState }) => (
                      <div className='flex flex-1 flex-col gap-1'>
                        <InputGroup>
                          <InputGroupInput
                            {...textField}
                            maxLength={quizLimits.maxAnswerLength}
                            disabled={props.disabled}
                            aria-invalid={fieldState.invalid}
                            placeholder={`Answer ${answerIndex + 1}`}
                          />
                          <InputGroupAddon align='inline-end'>
                            <CharCounter
                              current={(textField.value ?? '').length}
                              limit={quizLimits.maxAnswerLength}
                            />
                          </InputGroupAddon>
                        </InputGroup>
                        {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                      </div>
                    )}
                  />

                  {answersField.fields.length > quizLimits.minAnswersPerQuestion ? (
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon-sm'
                      disabled={props.disabled}
                      onClick={() => handleRemoveAnswer(answerIndex)}
                      className='shrink-0 text-muted-foreground hover:text-destructive'
                    >
                      <X className='size-4' />
                      <span className='sr-only'>Remove answer</span>
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>

            {answersField.fields.length < quizLimits.maxAnswersPerQuestion ? (
              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled={props.disabled}
                onClick={handleAddAnswer}
                className='w-full'
              >
                <Plus className='mr-1 size-4' />
                Add Answer
              </Button>
            ) : null}
          </div>
        </div>
      </AccordionContent>
    </AccordionPrimitive.Item>
  );
});

QuestionCard.displayName = 'QuestionCard';

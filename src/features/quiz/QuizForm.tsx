import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { effectTsResolver } from '@hookform/resolvers/effect-ts';
import { Duration } from 'effect';
import { InfoIcon, PlusIcon } from 'lucide-react';
import * as React from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { type Quiz, type QuizStatus, quizLimits } from '@/entities/quiz';
import {
  Accordion,
  Badge,
  Button,
  CharCounter,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  Separator,
  TagInput,
  Textarea,
} from '@/shared/ui';
import { cn } from '@/shared/utils';
import { computeSuggestedTimeMs } from './computeSuggestedTime';
import { QuestionCard } from './QuestionCard';
import { type QuizFormInput, QuizFormInputSchema, type QuizQuestionInput } from './QuizFormInput';

const createBlankQuestion = (): QuizQuestionInput => {
  const answers = [
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
  ];
  return {
    text: '',
    timeLimit: computeSuggestedTimeMs({ text: '', answers }),
    allowMultipleAnswers: false,
    answers,
  };
};

const blankFormState: QuizFormInput = {
  title: '',
  description: '',
  tags: [],
  settings: {
    visibility: 'private',
    maxParticipants: quizLimits.maxParticipants,
  },
  questions: [],
};

function quizToFormState(quiz: Quiz | null): QuizFormInput {
  if (quiz === null) {
    return blankFormState;
  }
  return {
    title: quiz.title,
    description: quiz.description ?? '',
    tags: [...quiz.tags],
    settings: {
      visibility: quiz.settings.visibility,
      maxParticipants: quiz.settings.maxParticipants,
    },
    questions: quiz.questions.map((question) => ({
      text: question.text,
      timeLimit: Duration.toMillis(question.timeLimit),
      allowMultipleAnswers: question.allowMultipleAnswers,
      answers: question.answers.map((answer) => ({
        text: answer.text,
        isCorrect: answer.isCorrect,
      })),
    })),
  };
}

type Props = {
  readonly heading: string;
  readonly submitText: string;
  readonly quiz: Quiz | null;
  readonly onSubmit: (data: QuizFormInput) => Promise<Quiz>;
  readonly submitLoading: boolean;
  readonly onStatusToggle?: (status: QuizStatus) => void;
  readonly statusLoading?: boolean;
  readonly onDirtyChange?: (isDirty: boolean) => void;
};

export const QuizForm = (props: Props) => {
  const initialState = React.useMemo(() => quizToFormState(props.quiz), [props.quiz]);

  const status = props.quiz?.status ?? 'draft';
  const isPublished = status === 'published';
  const isEditDisabled = isPublished;
  const isNew = props.quiz === null;

  const form = useForm<QuizFormInput>({
    defaultValues: initialState,
    resolver: effectTsResolver(QuizFormInputSchema),
    mode: 'onBlur',
  });

  React.useEffect(() => {
    form.reset(initialState);
    if (props.quiz === null) {
      return;
    }

    form.trigger();
  }, [form, initialState, props.quiz]);

  const isDirty = form.formState.isDirty;
  const onDirtyChange = props.onDirtyChange;

  React.useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  React.useEffect(() => {
    if (!isDirty) {
      return;
    }

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener('beforeunload', handler);

    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const questionsField = useFieldArray({ control: form.control, name: 'questions' });

  const title = useWatch({ control: form.control, name: 'title' }) ?? '';
  const description = useWatch({ control: form.control, name: 'description' }) ?? '';
  const tags = useWatch({ control: form.control, name: 'tags' }) ?? [];
  const questions = useWatch({ control: form.control, name: 'questions' }) ?? [];

  const [openQuestionIds, setOpenQuestionIds] = React.useState<readonly string[]>([]);

  React.useEffect(() => {
    const latestIds = questionsField.fields.map((field) => field.id);
    setOpenQuestionIds((prev) => prev.filter((id) => latestIds.includes(id)));
  }, [questionsField.fields]);

  const mainRef = React.useRef<HTMLDivElement>(null);

  const handleAddQuestion = React.useCallback(() => {
    questionsField.append(createBlankQuestion());
    setTimeout(() => {
      mainRef.current?.scrollTo({ top: mainRef.current.scrollHeight, behavior: 'smooth' });
    }, 50);
  }, [questionsField]);

  const handleDeleteQuestion = React.useCallback(
    (index: number) => {
      questionsField.remove(index);
    },
    [questionsField]
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const questionIds = questionsField.fields.map((field) => field.id);

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over === null || active.id === over.id) {
        return;
      }

      const prevIndex = questionIds.indexOf(`${active.id}`);
      const nextIndex = questionIds.indexOf(`${over.id}`);
      questionsField.move(prevIndex, nextIndex);
    },
    [questionIds, questionsField]
  );

  const handleSubmit = React.useCallback(
    async (data: QuizFormInput) => {
      try {
        const result = await props.onSubmit(data);
        form.reset(quizToFormState(result), { keepDirty: false });
        form.trigger();
      } catch {
        // Failure is already surfaced by the mutation's tapError toast — leave the form as-is.
      }
    },
    [props.onSubmit, form]
  );

  const statusLoading = props.statusLoading === true;
  const canPublish = !(isPublished || form.formState.isDirty) && form.formState.isValid;
  const canSave = !isEditDisabled && form.formState.isValid && form.formState.isDirty;

  const answeredCount = questions.filter(
    (question) =>
      question &&
      question.text.trim().length > 0 &&
      question.answers.some((answer) => answer.isCorrect)
  ).length;

  return (
    <form className='flex flex-col gap-6' onSubmit={form.handleSubmit(handleSubmit)}>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <h1 className='text-3xl font-bold'>{props.heading}</h1>
          <Badge variant={isPublished ? 'default' : 'secondary'}>
            {isPublished ? 'Published' : isNew ? 'New' : 'Draft'}
          </Badge>
        </div>
        <div className='flex items-center gap-2'>
          {isPublished && props.onStatusToggle !== undefined ? (
            <Button
              type='button'
              variant='outline'
              size='sm'
              loading={statusLoading}
              onClick={() => props.onStatusToggle?.('draft')}
            >
              Move to draft
            </Button>
          ) : null}

          {!isPublished ? (
            <>
              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled={!isDirty}
                onClick={() => form.reset()}
              >
                Reset
              </Button>
              <Button type='submit' size='sm' loading={props.submitLoading} disabled={!canSave}>
                {props.submitText}
              </Button>
              {!isNew && props.onStatusToggle !== undefined ? (
                <Button
                  type='button'
                  size='sm'
                  disabled={!canPublish}
                  loading={statusLoading}
                  onClick={() => props.onStatusToggle?.('published')}
                >
                  Publish →
                </Button>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      {isPublished ? (
        <div className='flex gap-2 items-center rounded-md border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm'>
          <InfoIcon strokeWidth={1.5} className='size-8 text-amber-500' />
          <span>
            The form is in <b>readonly</b> mode. Move it to <b>draft</b> to allow editing.
          </span>
        </div>
      ) : null}

      <div className='flex gap-6 items-start'>
        <aside className='w-72 shrink-0 sticky top-4 flex flex-col gap-5 rounded-xl border p-5'>
          <FieldGroup>
            <Controller
              name='title'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className='flex items-center justify-between'>
                    <FieldLabel>Title</FieldLabel>
                    <CharCounter current={title.length} limit={quizLimits.maxTitleLength} />
                  </div>
                  <Input
                    {...field}
                    minLength={quizLimits.minTitleLength}
                    maxLength={quizLimits.maxTitleLength}
                    disabled={isEditDisabled}
                    aria-invalid={fieldState.invalid}
                    placeholder='My Awesome Quiz'
                  />
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />

            <Controller
              name='description'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className='flex items-center justify-between'>
                    <FieldLabel>Description</FieldLabel>
                    <CharCounter
                      current={description.length}
                      limit={quizLimits.maxDescriptionLength}
                    />
                  </div>
                  <Textarea
                    {...field}
                    rows={3}
                    maxLength={quizLimits.maxDescriptionLength}
                    disabled={isEditDisabled}
                    aria-invalid={fieldState.invalid}
                    placeholder='What is this quiz about?'
                  />
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />

            <Controller
              name='tags'
              control={form.control}
              render={({ field }) => (
                <Field>
                  <div className='flex items-center justify-between'>
                    <FieldLabel>Tags</FieldLabel>
                    <CharCounter current={field.value.length} limit={quizLimits.maxTagsPerQuiz} />
                  </div>
                  <TagInput
                    tags={field.value}
                    onTagsChange={field.onChange}
                    disabled={isEditDisabled}
                    limit={quizLimits.maxTagsPerQuiz}
                    placeholder='Enter to add…'
                  />
                </Field>
              )}
            />
          </FieldGroup>

          <Separator />

          <FieldGroup>
            <Controller
              name='settings.maxParticipants'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Max Participants</FieldLabel>
                  <Input
                    type='number'
                    inputMode='numeric'
                    className='text-right tabular-nums'
                    min={quizLimits.minParticipants}
                    max={quizLimits.maxParticipants}
                    value={field.value}
                    disabled={isEditDisabled}
                    onChange={(event) => {
                      const parsedValue = Number(event.target.value);
                      field.onChange(
                        Number.isNaN(parsedValue) ? quizLimits.minParticipants : parsedValue
                      );
                    }}
                    onBlur={field.onBlur}
                    aria-invalid={fieldState.invalid}
                    placeholder={`${quizLimits.minParticipants}–${quizLimits.maxParticipants}`}
                  />
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
          </FieldGroup>

          <Separator />

          <div className='flex flex-col gap-2'>
            <p className='text-[11px] font-semibold tracking-widest uppercase text-muted-foreground'>
              Summary
            </p>
            <div className='flex flex-col gap-1.5 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Questions</span>
                <span className='font-semibold'>{questionsField.fields.length}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Answered</span>
                <span
                  className={cn(
                    'font-semibold',
                    answeredCount < questionsField.fields.length
                      ? 'text-orange-500'
                      : 'text-foreground'
                  )}
                >
                  {answeredCount}/{questionsField.fields.length}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Tags</span>
                <span className='font-semibold'>{tags.length}</span>
              </div>
            </div>
          </div>
        </aside>

        <div ref={mainRef} className='flex-1'>
          <div className='flex flex-col gap-3'>
            <div>
              <p className='text-[15px] font-semibold'>Questions</p>
              <p className='text-xs text-muted-foreground mt-0.5'>
                {questionsField.fields.length}{' '}
                {questionsField.fields.length === 1 ? 'question' : 'questions'} · drag to reorder
              </p>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={questionIds} strategy={verticalListSortingStrategy}>
                <Accordion
                  type='multiple'
                  value={[...openQuestionIds]}
                  onValueChange={setOpenQuestionIds}
                  className='flex flex-col gap-2'
                >
                  {questionsField.fields.map((field, index) => (
                    <QuestionCard
                      key={field.id}
                      id={field.id}
                      index={index}
                      control={form.control}
                      setAnswerCorrect={(answerIndex, value) =>
                        form.setValue(`questions.${index}.answers.${answerIndex}.isCorrect`, value)
                      }
                      setAllowMultiple={(value) =>
                        form.setValue(`questions.${index}.allowMultipleAnswers`, value)
                      }
                      disabled={isEditDisabled}
                      hasError={
                        Array.isArray(form.formState.errors.questions) &&
                        form.formState.errors.questions[index] !== undefined
                      }
                      onDelete={
                        questionsField.fields.length > 1 ? () => handleDeleteQuestion(index) : null
                      }
                    />
                  ))}
                </Accordion>
              </SortableContext>
            </DndContext>

            <button
              type='button'
              disabled={isEditDisabled}
              onClick={handleAddQuestion}
              className={cn(
                'flex items-center justify-center gap-2 w-full py-4 rounded-xl border-2 border-dashed text-sm font-medium transition-colors',
                isEditDisabled
                  ? 'border-border text-muted-foreground/40 cursor-not-allowed'
                  : 'border-border text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 cursor-pointer'
              )}
            >
              <PlusIcon className='size-4' />
              Add Question
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

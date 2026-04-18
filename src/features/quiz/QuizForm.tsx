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
import { Plus } from 'lucide-react';
import * as React from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { type Quiz, type QuizStatus, quizLimits } from '@/entities/quiz';
import {
  Accordion,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CharCounter,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  TagInput,
  Textarea,
} from '@/shared/ui';
import { computeSuggestedTimeMs } from './computeSuggestedTime';
import { QuestionCard } from './QuestionCard';
import { type QuizFormInput, QuizFormInputSchema, type QuizQuestionInput } from './QuizFormInput';

const createBlankQuestion = (): QuizQuestionInput => {
  const answers = [
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
  ];
  const timeLimit = computeSuggestedTimeMs({ text: '', answers });
  return {
    text: '',
    timeLimit,
    answers,
  };
};

const blankFormState = (): QuizFormInput => ({
  title: '',
  description: '',
  tags: [],
  settings: {
    visibility: 'private',
    maxParticipants: quizLimits.maxParticipants,
  },
  questions: [createBlankQuestion()],
});

function quizToFormState(quiz: Quiz): QuizFormInput {
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
  readonly onSubmit: (data: QuizFormInput) => Promise<Quiz | null>;
  readonly loading: boolean;
  readonly onPublish?: () => Promise<Quiz | null>;
  readonly onUnpublish?: () => Promise<Quiz | null>;
  readonly statusMutationLoading?: boolean;
};

export const QuizForm = React.memo((props: Props) => {
  const initialState = React.useMemo(
    () => (props.quiz !== null ? quizToFormState(props.quiz) : blankFormState()),
    [props.quiz]
  );

  const status: QuizStatus = props.quiz?.status ?? 'draft';
  const isPublished = status === 'published';
  const isEditDisabled = isPublished;

  const form = useForm<QuizFormInput>({
    defaultValues: initialState,
    resolver: effectTsResolver(QuizFormInputSchema),
    mode: 'onBlur',
  });

  React.useEffect(() => {
    form.reset(initialState);
  }, [form, initialState]);

  const questionsField = useFieldArray({
    control: form.control,
    name: 'questions',
  });

  const title = useWatch({ control: form.control, name: 'title' }) ?? '';
  const description = useWatch({ control: form.control, name: 'description' }) ?? '';

  const [openQuestionIds, setOpenQuestionIds] = React.useState<readonly string[]>([]);

  const handleAddQuestion = React.useCallback(() => {
    const newQuestion = createBlankQuestion();
    questionsField.append(newQuestion);
  }, [questionsField]);

  React.useEffect(() => {
    const latestIds = questionsField.fields.map((f) => f.id);
    setOpenQuestionIds((prev) => prev.filter((id) => latestIds.includes(id)));
  }, [questionsField.fields]);

  const handleDeleteQuestion = React.useCallback(
    (index: number) => {
      if (questionsField.fields.length <= 1) {
        return;
      }
      questionsField.remove(index);
    },
    [questionsField]
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const questionIds = React.useMemo(
    () => questionsField.fields.map((field) => field.id),
    [questionsField.fields]
  );

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = questionIds.indexOf(active.id as string);
        const newIndex = questionIds.indexOf(over.id as string);
        questionsField.move(oldIndex, newIndex);
      }
    },
    [questionIds, questionsField]
  );

  const handleSubmit = React.useCallback(
    async (data: QuizFormInput) => {
      const result = await props.onSubmit(data);
      if (result != null) {
        form.reset(quizToFormState(result), { keepDirty: false });
      }
    },
    [props.onSubmit, form]
  );

  const handlePublish = React.useCallback(async () => {
    if (props.onPublish === undefined) {
      return;
    }
    await props.onPublish();
  }, [props.onPublish]);

  const handleUnpublish = React.useCallback(async () => {
    if (props.onUnpublish === undefined) {
      return;
    }
    await props.onUnpublish();
  }, [props.onUnpublish]);

  const questionErrors = form.formState.errors.questions;
  const statusLoading = props.statusMutationLoading === true;
  const canPublish = !(isPublished || form.formState.isDirty) && form.formState.isValid;

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <h1 className='text-3xl font-bold'>{props.heading}</h1>
          {props.quiz !== null ? (
            <Badge variant={isPublished ? 'default' : 'secondary'} className='tabular-nums'>
              {isPublished ? 'Published' : 'Draft'}
            </Badge>
          ) : null}
        </div>

        {props.quiz !== null &&
        (props.onPublish !== undefined || props.onUnpublish !== undefined) ? (
          <div className='flex items-center gap-2'>
            {isPublished ? (
              <Button
                type='button'
                variant='outline'
                loading={statusLoading}
                disabled={props.onUnpublish === undefined}
                onClick={handleUnpublish}
              >
                Move to draft
              </Button>
            ) : (
              <Button
                type='button'
                loading={statusLoading}
                disabled={!canPublish || props.onPublish === undefined}
                onClick={handlePublish}
              >
                Publish
              </Button>
            )}
          </div>
        ) : null}
      </div>

      {isPublished ? (
        <div className='rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm'>
          This quiz is published. Move it to draft to edit.
        </div>
      ) : null}

      <form className='flex flex-col gap-6' onSubmit={form.handleSubmit(handleSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
          </CardHeader>

          <CardContent>
            <div className='flex flex-col gap-4'>
              <Separator />

              <FieldGroup>
                <Controller
                  name='title'
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <div className='flex items-center justify-between'>
                        <FieldLabel>Title:</FieldLabel>
                        <CharCounter current={title.length} limit={quizLimits.maxTitleLength} />
                      </div>
                      <Input
                        {...field}
                        value={field.value}
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
                        <FieldLabel>Description:</FieldLabel>
                        <CharCounter
                          current={description.length}
                          limit={quizLimits.maxDescriptionLength}
                        />
                      </div>
                      <Textarea
                        {...field}
                        maxLength={quizLimits.maxDescriptionLength}
                        disabled={isEditDisabled}
                        aria-invalid={fieldState.invalid}
                        placeholder='A brief quiz description...'
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
                      <FieldLabel>Tags:</FieldLabel>
                      <TagInput
                        tags={field.value}
                        onTagsChange={(newTags) => {
                          field.onChange(newTags);
                        }}
                        disabled={isEditDisabled}
                        limit={quizLimits.maxTagsPerQuiz}
                        placeholder='Add tags to categorize your quiz...'
                      />
                    </Field>
                  )}
                />

                <Separator />

                <Controller
                  name='settings.visibility'
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Visibility:</FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isEditDisabled}
                      >
                        <SelectTrigger aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder='Select visibility' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='private'>Private</SelectItem>
                          <SelectItem value='public'>Public</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                    </Field>
                  )}
                />

                <Controller
                  name='settings.maxParticipants'
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Max Participants:</FieldLabel>
                      <Input
                        type='number'
                        inputMode='numeric'
                        min={quizLimits.minParticipants}
                        max={quizLimits.maxParticipants}
                        value={field.value}
                        disabled={isEditDisabled}
                        onChange={(event) => {
                          const parsedValue = Number(event.target.value);
                          if (Number.isNaN(parsedValue)) {
                            field.onChange(quizLimits.minParticipants);
                            return;
                          }

                          field.onChange(parsedValue);
                        }}
                        onBlur={field.onBlur}
                        aria-invalid={fieldState.invalid}
                        placeholder={`${quizLimits.minParticipants}-${quizLimits.maxParticipants}`}
                      />
                      {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex items-center justify-between'>
            <CardTitle>Questions</CardTitle>
            <Button type='button' size='sm' disabled={isEditDisabled} onClick={handleAddQuestion}>
              <Plus className='size-4' />
              Add Question
            </Button>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <Separator />

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
                      setValue={form.setValue}
                      disabled={isEditDisabled}
                      hasError={
                        Array.isArray(questionErrors) && questionErrors[index] !== undefined
                      }
                      onDelete={
                        questionsField.fields.length > 1 ? () => handleDeleteQuestion(index) : null
                      }
                    />
                  ))}
                </Accordion>
              </SortableContext>
            </DndContext>

            {questionsField.fields.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                <p>No questions yet. Click "Add Question" to get started.</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className='flex gap-3 justify-end'>
          <Button
            type='button'
            disabled={props.loading || !form.formState.isDirty}
            variant='outline'
            onClick={() => form.reset()}
          >
            Reset Changes
          </Button>
          <Button
            type='submit'
            loading={props.loading}
            disabled={isEditDisabled || !(form.formState.isValid && form.formState.isDirty)}
          >
            {props.submitText}
          </Button>
        </div>
      </form>
    </div>
  );
});

QuizForm.displayName = 'QuizForm';

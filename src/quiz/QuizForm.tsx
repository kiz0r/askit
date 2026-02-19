import { ChevronLeftIcon, PlusIcon } from '@radix-ui/react-icons';
import { Button, Card, Heading, Select, Separator, Switch, Text } from '@radix-ui/themes';
import { Link as RouterLink } from '@tanstack/react-router';
import React from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { InputField } from '../auth/InputField';
import { NumberField } from '../auth/NumberField';
import { TextAreaField } from '../auth/TextAreaField';
import type { Quiz } from './Quiz';
import styles from './QuizForm.module.scss';
import type { QuizFormInput } from './QuizFormInput';
import { QuizQuestionField } from './QuizQuestionField';

/**
 * Max number of participants allowed in a quiz.
 */
const QUIZ_MAX_PARTICIPANTS = 1000;

/**
 * Min number of participants allowed in a quiz.
 */
const QUIZ_MIN_PARTICIPANTS = 1;

const defaultQuestion = {
  text: '',
  answers: [
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
  ],
};

/**
 * Empty form state for creating a new quiz.
 */
const emptyFormState: QuizFormInput = {
  title: '',
  description: '',
  settings: {
    randomizeQuestions: false,
    randomizeAnswers: false,
    showImmediateFeedback: true,
    timePerQuestion: 30,
    visibility: 'private',
    maxParticipants: QUIZ_MAX_PARTICIPANTS,
  },
  questions: [{ ...defaultQuestion, answers: [...defaultQuestion.answers] }],
};

/**
 * Converts an existing Quiz to form state for editing.
 */
function quizToFormState(quiz: Quiz): QuizFormInput {
  return {
    title: quiz.title,
    description: quiz.description ?? '',
    settings: {
      randomizeQuestions: quiz.settings.randomizeQuestions,
      randomizeAnswers: quiz.settings.randomizeAnswers,
      showImmediateFeedback: quiz.settings.showImmediateFeedback,
      timePerQuestion: quiz.settings.timePerQuestion,
      visibility: quiz.settings.visibility,
      maxParticipants: quiz.settings.maxParticipants,
    },
    questions: quiz.questions.map((question) => ({
      text: question.text,
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
  readonly quiz?: Quiz;
  readonly onSubmit: (data: QuizFormInput) => void;
  readonly loading: boolean;
};

export const QuizForm = React.memo((props: Props) => {
  const initialState = React.useMemo(
    () => (props.quiz != null ? quizToFormState(props.quiz) : emptyFormState),
    [props.quiz]
  );

  const form = useForm<QuizFormInput>({
    defaultValues: initialState,
  });

  // Reset form when quiz data changes (e.g., after refetch following edit)
  React.useEffect(() => {
    form.reset(initialState);
  }, [form, initialState]);

  const questionsField = useFieldArray({
    control: form.control,
    name: 'questions',
  });

  return (
    <div className={styles.QuizForm}>
      <div className={styles.QuizForm__Header}>
        <Button asChild variant='ghost' size='1'>
          <RouterLink to='/quizzes'>
            <ChevronLeftIcon />
            Back
          </RouterLink>
        </Button>
        <Heading size='6'>{props.heading}</Heading>
      </div>

      <form className={styles.QuizForm__Form} onSubmit={form.handleSubmit(props.onSubmit)}>
        <div className={styles.QuizForm__SectionsGrid}>
          <Card className={styles.QuizForm__SectionCard}>
            <div className={styles.QuizForm__Section}>
              <div className={styles.QuizForm__SectionHeader}>
                <Heading size='4'>General Information</Heading>
              </div>

              <Separator size='4' />

              <div className={styles.QuizForm__FieldGroup}>
                <InputField
                  control={form.control}
                  name='title'
                  label='Title'
                  type='text'
                  placeholder='My Awesome Quiz'
                />

                <TextAreaField
                  control={form.control}
                  name='description'
                  label='Description'
                  placeholder='A brief quiz description'
                />
              </div>
            </div>
          </Card>

          {/* Settings Section */}
          <Card className={styles.QuizForm__SectionCard}>
            <div className={styles.QuizForm__Section}>
              <div className={styles.QuizForm__SectionHeader}>
                <Heading size='4'>Settings</Heading>
              </div>

              <Separator size='4' />

              <div className={styles.QuizForm__FieldRow}>
                <NumberField
                  control={form.control}
                  name='settings.timePerQuestion'
                  label='Time per question (seconds)'
                  min={5}
                  max={300}
                />

                <NumberField
                  control={form.control}
                  name='settings.maxParticipants'
                  label='Max participants'
                  min={QUIZ_MIN_PARTICIPANTS}
                  max={QUIZ_MAX_PARTICIPANTS}
                />

                <Controller
                  control={form.control}
                  name='settings.visibility'
                  render={({ field }) => (
                    <label>
                      <Text as='span' size='2' color='gray'>
                        Visibility
                      </Text>
                      <Select.Root value={field.value} onValueChange={field.onChange}>
                        <Select.Trigger />
                        <Select.Content>
                          <Select.Item value='private'>Private</Select.Item>
                          <Select.Item value='public'>Public</Select.Item>
                        </Select.Content>
                      </Select.Root>
                    </label>
                  )}
                />
              </div>

              <Separator size='4' />

              <div className={styles.QuizForm__FieldGroup}>
                <Controller
                  control={form.control}
                  name='settings.randomizeQuestions'
                  render={({ field }) => (
                    <div className={styles.QuizForm__SwitchField}>
                      <Text size='2'>Randomize questions order</Text>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </div>
                  )}
                />

                <Controller
                  control={form.control}
                  name='settings.randomizeAnswers'
                  render={({ field }) => (
                    <div className={styles.QuizForm__SwitchField}>
                      <Text size='2'>Randomize answers order</Text>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </div>
                  )}
                />

                <Controller
                  control={form.control}
                  name='settings.showImmediateFeedback'
                  render={({ field }) => (
                    <div className={styles.QuizForm__SwitchField}>
                      <Text size='2'>Show immediate feedback after each question</Text>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </div>
                  )}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Questions Section */}
        <Card className={styles.QuizForm__SectionCard}>
          <div className={styles.QuizForm__Section}>
            <div className={styles.QuizForm__SectionHeader}>
              <Heading size='4'>Questions</Heading>
              <Button
                type='button'
                size='1'
                variant='surface'
                onClick={() =>
                  questionsField.append({
                    text: '',
                    answers: [
                      { text: '', isCorrect: true },
                      { text: '', isCorrect: false },
                    ],
                  })
                }
              >
                <PlusIcon />
                Add Question
              </Button>
            </div>

            <Separator size='4' />

            {questionsField.fields.map((question, questionIndex) => (
              <QuizQuestionField
                key={question.id}
                control={form.control}
                register={form.register}
                questionIndex={questionIndex}
                onRemove={
                  questionsField.fields.length > 1
                    ? () => questionsField.remove(questionIndex)
                    : undefined
                }
              />
            ))}
          </div>
        </Card>

        <div className={styles.QuizForm__Actions}>
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
            disabled={!(form.formState.isValid && form.formState.isDirty)}
          >
            {props.submitText}
          </Button>
        </div>
      </form>
    </div>
  );
});

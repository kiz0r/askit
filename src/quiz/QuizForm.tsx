import { effectTsResolver } from '@hookform/resolvers/effect-ts';
import { PlusIcon } from '@radix-ui/react-icons';
import { Button, Card, Heading, Select, Separator, Switch, Text } from '@radix-ui/themes';
import { Duration } from 'effect';
import * as React from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { InputField } from '../auth/InputField';
import { NumberField } from '../auth/NumberField';
import { TextAreaField } from '../auth/TextAreaField';
import { Quiz } from './Quiz';
import styles from './QuizForm.module.scss';
import { type QuizFormInput, QuizFormInputSchema } from './QuizFormInput';
import { QuizQuestionField } from './QuizQuestionField';
import { QuizLimits } from './quizLimits';

const blankFormState = {
  title: '',
  description: '',
  settings: {
    randomizeQuestions: false,
    randomizeAnswers: false,
    showImmediateFeedback: true,
    timePerQuestion: Duration.toMillis(QuizLimits.Duration.DefaultTimePerQuestion),
    visibility: 'private',
    maxParticipants: QuizLimits.MaxParticipants,
  },
  questions: [
    {
      text: '',
      answers: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
      ],
    },
  ],
} as const satisfies QuizFormInput;

// TODO: better performance
function quizToFormState(quiz: Quiz): QuizFormInput {
  return {
    title: quiz.title,
    description: quiz.description ?? '',
    settings: {
      ...quiz.settings,
      timePerQuestion: Duration.toMillis(quiz.settings.timePerQuestion),
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
  readonly quiz: Quiz | null;
  readonly onSubmit: (data: QuizFormInput) => Promise<Quiz | null>;
  readonly loading: boolean;
};

export const QuizForm = React.memo((props: Props) => {
  const initialState = React.useMemo(
    () => (props.quiz !== null ? quizToFormState(props.quiz) : blankFormState),
    [props.quiz]
  );

  const form = useForm<QuizFormInput>({
    defaultValues: initialState,
    resolver: effectTsResolver(QuizFormInputSchema),
  });

  React.useEffect(() => {
    form.reset(initialState);
  }, [form, initialState]);

  const questionsField = useFieldArray({
    control: form.control,
    name: 'questions',
  });

  const values = useWatch({ control: form.control });
  const settings = values.settings ?? blankFormState.settings;
  const questions = values.questions ?? [];

  const handleSubmit = React.useCallback(
    async (data: QuizFormInput) => {
      const result = await props.onSubmit(data);
      if (result != null) {
        form.reset(initialState);
      }
    },
    [props.onSubmit, form, initialState]
  );

  return (
    <div className={styles.QuizForm}>
      <Heading size='6'>{props.heading}</Heading>

      <form className={styles.QuizForm__Form} onSubmit={form.handleSubmit(handleSubmit)}>
        <div className={styles.QuizForm__SectionsGrid}>
          <Card className={styles.QuizForm__SectionCard}>
            <div className={styles.QuizForm__Section}>
              <div className={styles.QuizForm__SectionHeader}>
                <Heading size='4'>General Information</Heading>
              </div>
              <Separator size='4' />
              <div className={styles.QuizForm__FieldGroup}>
                <InputField
                  value={values.title ?? ''}
                  onChange={(nextValue) =>
                    form.setValue('title', nextValue, { shouldDirty: true, shouldValidate: true })
                  }
                  label='Title'
                  type='text'
                  placeholder='My Awesome Quiz'
                />
                <TextAreaField
                  value={values.description ?? ''}
                  onChange={(nextValue) =>
                    form.setValue('description', nextValue, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  label='Description'
                  placeholder='A brief quiz description'
                />
              </div>
            </div>
          </Card>

          <Card className={styles.QuizForm__SectionCard}>
            <div className={styles.QuizForm__Section}>
              <div className={styles.QuizForm__SectionHeader}>
                <Heading size='4'>Settings</Heading>
              </div>
              <Separator size='4' />
              <div className={styles.QuizForm__FieldRow}>
                <NumberField
                  value={Math.round(
                    (settings.timePerQuestion ??
                      Duration.toMillis(QuizLimits.Duration.DefaultTimePerQuestion)) / 1_000
                  )}
                  onChange={(nextValue) => {
                    const seconds =
                      nextValue ?? Duration.toSeconds(QuizLimits.Duration.DefaultTimePerQuestion);
                    form.setValue('settings.timePerQuestion', seconds * 1_000, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                  label='Time per question (seconds)'
                  min={Duration.toSeconds(QuizLimits.Duration.MinTimePerQuestion)}
                  max={Duration.toSeconds(QuizLimits.Duration.MaxTimePerQuestion)}
                />
                <NumberField
                  value={settings.maxParticipants ?? QuizLimits.MaxParticipants}
                  onChange={(nextValue) => {
                    form.setValue(
                      'settings.maxParticipants',
                      nextValue ?? QuizLimits.MaxParticipants,
                      { shouldDirty: true, shouldValidate: true }
                    );
                  }}
                  label='Max participants'
                  min={QuizLimits.MinParticipants}
                  max={QuizLimits.MaxParticipants}
                />
                <div className={styles.QuizForm__SelectField}>
                  <Text as='label' size='2' color='gray'>
                    Visibility
                  </Text>
                  <Select.Root
                    value={settings.visibility}
                    onValueChange={(nextValue) =>
                      form.setValue('settings.visibility', nextValue as 'public' | 'private', {
                        // TODO: do not cast to literal type
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value='private'>Private</Select.Item>
                      <Select.Item value='public'>Public</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </div>
              </div>
              <Separator size='4' />
              <div className={styles.QuizForm__FieldGroup}>
                <div className={styles.QuizForm__SwitchField}>
                  <Text size='2'>Randomize questions order</Text>
                  <Switch
                    checked={settings.randomizeQuestions}
                    onCheckedChange={(nextValue) =>
                      form.setValue('settings.randomizeQuestions', nextValue, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  />
                </div>
                <div className={styles.QuizForm__SwitchField}>
                  <Text size='2'>Randomize answers order</Text>
                  <Switch
                    checked={settings.randomizeAnswers}
                    onCheckedChange={(nextValue) =>
                      form.setValue('settings.randomizeAnswers', nextValue, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  />
                </div>
                <div className={styles.QuizForm__SwitchField}>
                  <Text size='2'>Show immediate feedback after each question</Text>
                  <Switch
                    checked={settings.showImmediateFeedback}
                    onCheckedChange={(nextValue) =>
                      form.setValue('settings.showImmediateFeedback', nextValue, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

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
            <div className={styles.QuizForm__QuestionsContainer}>
              {questionsField.fields.map((field, questionIndex) => {
                const question = questions.at(questionIndex) ?? null;
                if (question === null) {
                  return null;
                }

                const answers = question.answers ?? [];
                const correctAnswerIndex = answers.findIndex((answer) => answer.isCorrect);

                return (
                  <React.Fragment key={field.id}>
                    {questionIndex > 0 ? (
                      <Separator size='4' className={styles.QuizForm__QuestionDivider} />
                    ) : null}
                    <QuizQuestionField
                      questionIndex={questionIndex}
                      totalQuestions={questionsField.fields.length}
                      questionText={question.text ?? ''}
                      answers={answers.map((answer) => ({
                        text: answer.text ?? '',
                        isCorrect: answer.isCorrect ?? false,
                      }))}
                      correctAnswerIndex={correctAnswerIndex >= 0 ? correctAnswerIndex : 0}
                      onQuestionTextChange={(nextValue) => {
                        form.setValue(`questions.${questionIndex}.text`, nextValue, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                      onAnswerTextChange={(answerIndex, nextValue) => {
                        form.setValue(
                          `questions.${questionIndex}.answers.${answerIndex}.text`,
                          nextValue,
                          { shouldDirty: true, shouldValidate: true }
                        );
                      }}
                      onCorrectAnswerChange={(answerIndex) => {
                        form.setValue(
                          `questions.${questionIndex}.answers`,
                          answers.map((answer, index) => ({
                            text: answer.text ?? '',
                            isCorrect: index === answerIndex,
                          })),
                          { shouldDirty: true, shouldValidate: true }
                        );
                      }}
                      onAnswerAdd={() => {
                        form.setValue(
                          `questions.${questionIndex}.answers`,
                          [
                            ...answers.map((answer) => ({
                              text: answer.text ?? '',
                              isCorrect: answer.isCorrect ?? false,
                            })),
                            { text: '', isCorrect: false },
                          ],
                          { shouldDirty: true, shouldValidate: true }
                        );
                      }}
                      onAnswerRemove={(answerIndex) => {
                        form.setValue(
                          `questions.${questionIndex}.answers`,
                          answers
                            .filter((_answer, index) => index !== answerIndex)
                            .map((answer) => ({
                              text: answer.text ?? '',
                              isCorrect: answer.isCorrect ?? false,
                            })),
                          { shouldDirty: true, shouldValidate: true }
                        );
                      }}
                      onQuestionRemove={
                        questionsField.fields.length > 1
                          ? () => questionsField.remove(questionIndex)
                          : undefined
                      }
                    />
                  </React.Fragment>
                );
              })}
            </div>
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

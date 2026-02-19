import { Cross2Icon, PlusIcon } from '@radix-ui/react-icons';
import { Button, Checkbox, IconButton, Text, TextField } from '@radix-ui/themes';
import React from 'react';
import { type Control, Controller, type UseFormRegister, useFieldArray } from 'react-hook-form';
import type { QuizFormInput } from './QuizFormInput';
import styles from './QuizQuestionField.module.scss';

type Props = {
  readonly control: Control<QuizFormInput>;
  readonly register: UseFormRegister<QuizFormInput>;
  readonly questionIndex: number;
  readonly onRemove?: () => void;
};

export const QuizQuestionField = React.memo((props: Props) => {
  const answersField = useFieldArray({
    control: props.control,
    name: `questions.${props.questionIndex}.answers`,
  });

  return (
    <div className={styles.QuizQuestionField}>
      <div className={styles.QuizQuestionField__QuestionHeader}>
        <Text weight='medium'>Question {props.questionIndex + 1}.</Text>
        {props.onRemove != null ? (
          <IconButton type='button' variant='ghost' color='red' size='1' onClick={props.onRemove}>
            <Cross2Icon />
          </IconButton>
        ) : null}
      </div>

      <TextField.Root
        {...props.register(`questions.${props.questionIndex}.text`, { required: true })}
        placeholder='2 + 2 = ?'
        autoComplete='off'
      />

      <div className={styles.QuizQuestionField__Answers}>
        <Text size='2' color='gray'>
          Answers (check the correct one)
        </Text>

        {answersField.fields.map((answer, answerIndex) => (
          <div key={answer.id} className={styles.QuizQuestionField__Answer}>
            <Controller
              control={props.control}
              name={`questions.${props.questionIndex}.answers.${answerIndex}.isCorrect`}
              render={({ field }) => (
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              )}
            />

            <TextField.Root
              autoComplete='off'
              className={styles.QuizQuestionField__AnswerInput}
              {...props.register(`questions.${props.questionIndex}.answers.${answerIndex}.text`, {
                required: true,
              })}
              placeholder={`Answer ${answerIndex + 1}`}
            />

            {answersField.fields.length > 2 ? (
              <IconButton
                type='button'
                variant='ghost'
                color='gray'
                size='1'
                onClick={() => answersField.remove(answerIndex)}
              >
                <Cross2Icon />
              </IconButton>
            ) : null}
          </div>
        ))}

        <Button
          type='button'
          variant='outline'
          size='1'
          onClick={() => answersField.append({ text: '', isCorrect: false })}
        >
          <PlusIcon />
          Add Answer
        </Button>
      </div>
    </div>
  );
});

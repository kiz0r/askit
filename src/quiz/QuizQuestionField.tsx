import { Cross2Icon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { Badge, Button, Flex, IconButton, Radio, Text, TextField } from '@radix-ui/themes';
import * as React from 'react';
import type { QuizAnswerInput } from './QuizFormInput';
import styles from './QuizQuestionField.module.scss';

type Props = {
  readonly questionIndex: number;
  readonly totalQuestions: number;
  readonly questionText: string;
  readonly answers: readonly QuizAnswerInput[];
  readonly correctAnswerIndex: number;
  readonly onQuestionTextChange: (text: string) => void;
  readonly onAnswerTextChange: (answerIndex: number, text: string) => void;
  readonly onCorrectAnswerChange: (answerIndex: number) => void;
  readonly onAnswerAdd: () => void;
  readonly onAnswerRemove: (answerIndex: number) => void;
  readonly onQuestionRemove?: () => void;
};

export const QuizQuestionField = React.memo((props: Props) => {
  const onQuestionRemove = props.onQuestionRemove ?? null;
  return (
    <div className={styles.QuizQuestionField}>
      <div className={styles.QuizQuestionField__QuestionHeader}>
        <Flex align='center' gap='2'>
          <Badge size='2' variant='surface'>
            {props.questionIndex + 1} / {props.totalQuestions}
          </Badge>
          <Text size='2' color='gray'>
            Question
          </Text>
        </Flex>
        {onQuestionRemove !== null ? (
          <Button type='button' variant='ghost' color='red' size='1' onClick={onQuestionRemove}>
            <TrashIcon />
            Remove
          </Button>
        ) : null}
      </div>

      <TextField.Root
        value={props.questionText}
        onChange={(event) => props.onQuestionTextChange(event.target.value)}
        placeholder='Enter your question here...'
        autoComplete='off'
        size='3'
      />

      <div className={styles.QuizQuestionField__Answers}>
        <Text size='2' weight='medium'>
          Answers
        </Text>
        <Text size='1' color='gray'>
          Select the correct answer
        </Text>

        <div className={styles.QuizQuestionField__AnswersList}>
          {props.answers.map((answer, index) => (
            <div key={index} className={styles.QuizQuestionField__Answer}>
              <Radio
                size='2'
                name={`question-${props.questionIndex}-correct`}
                value={String(index)}
                checked={props.correctAnswerIndex === index}
                onClick={() => props.onCorrectAnswerChange(index)}
              />

              <TextField.Root
                value={answer.text}
                onChange={(e) => props.onAnswerTextChange(index, e.target.value)}
                autoComplete='off'
                className={styles.QuizQuestionField__AnswerInput}
                placeholder={`Option ${index + 1}`}
              />

              {props.answers.length > 2 ? (
                <IconButton
                  type='button'
                  variant='ghost'
                  color='gray'
                  size='1'
                  onClick={() => props.onAnswerRemove(index)}
                >
                  <Cross2Icon />
                </IconButton>
              ) : null}
            </div>
          ))}
        </div>

        <Button
          type='button'
          variant='soft'
          size='1'
          className={styles.QuizQuestionField__AddAnswerBtn}
          onClick={props.onAnswerAdd}
        >
          <PlusIcon />
          Add Option
        </Button>
      </div>
    </div>
  );
});

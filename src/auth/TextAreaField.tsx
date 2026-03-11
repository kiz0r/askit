import { Text, TextArea } from '@radix-ui/themes';
import * as React from 'react';

type Props = {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly label: string;
  readonly placeholder?: string;
  readonly rows?: number;
  readonly disabled?: boolean;
};

export const TextAreaField = React.memo((props: Props) => {
  const id = React.useId();

  return (
    <label htmlFor={id}>
      <Text size='2' color='gray'>
        {props.label}
      </Text>
      <TextArea
        id={id}
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        placeholder={props.placeholder}
        rows={props.rows ?? 3}
        disabled={props.disabled}
      />
    </label>
  );
});

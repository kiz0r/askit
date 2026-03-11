import { Text, TextField } from '@radix-ui/themes';
import * as React from 'react';

type Props = {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly label: string;
  readonly type: 'text' | 'email' | 'password';
  readonly placeholder?: string;
  readonly autoComplete?: string;
  readonly disabled?: boolean;
  readonly leftElement?: React.ReactNode;
  readonly rightElement?: React.ReactNode;
};

export const InputField = React.memo((props: Props) => {
  const id = React.useId();

  return (
    <label htmlFor={id}>
      <Text size='2' color='gray'>
        {props.label}
      </Text>
      <TextField.Root
        id={id}
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        type={props.type}
        placeholder={props.placeholder}
        autoComplete={props.autoComplete ?? 'off'}
        disabled={props.disabled}
      >
        {props.leftElement != null ? (
          <TextField.Slot side='left'>{props.leftElement}</TextField.Slot>
        ) : null}

        {props.rightElement != null ? (
          <TextField.Slot side='right'>{props.rightElement}</TextField.Slot>
        ) : null}
      </TextField.Root>
    </label>
  );
});

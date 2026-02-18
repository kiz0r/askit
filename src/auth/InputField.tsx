import { Text, TextField } from '@radix-ui/themes';
import React from 'react';
import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form';

type Props<T extends FieldValues> = {
  readonly control: Control<T>;
  readonly name: FieldPath<T>;
  readonly label: string;
  readonly type: 'text' | 'email' | 'password';
  readonly placeholder?: string;
  readonly autoComplete?: string;
  readonly forceDisabled?: boolean;
  readonly leftElement?: React.ReactNode;
  readonly rightElement?: React.ReactNode;
};

const InputFieldInner = <T extends FieldValues>(props: Props<T>) => {
  const id = React.useId();

  return (
    <Controller
      control={props.control}
      name={props.name}
      render={({ field }) => (
        <label htmlFor={id}>
          <Text size='2' color='gray'>
            {props.label}
          </Text>
          <TextField.Root
            {...field}
            id={id}
            type={props.type}
            placeholder={props.placeholder}
            autoComplete={props.autoComplete ?? 'off'}
            disabled={field.disabled || props.forceDisabled}
          >
            {props.leftElement != null ? (
              <TextField.Slot side='left'>{props.leftElement}</TextField.Slot>
            ) : null}

            {props.rightElement != null ? (
              <TextField.Slot side='right'>{props.rightElement}</TextField.Slot>
            ) : null}
          </TextField.Root>
        </label>
      )}
    />
  );
};

export const InputField = React.memo(InputFieldInner) as typeof InputFieldInner;

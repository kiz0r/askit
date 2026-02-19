import { Text, TextArea } from '@radix-ui/themes';
import React from 'react';
import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form';

type Props<T extends FieldValues> = {
  readonly control: Control<T>;
  readonly name: FieldPath<T>;
  readonly label: string;
  readonly placeholder?: string;
  readonly rows?: number;
  readonly forceDisabled?: boolean;
};

const TextAreaFieldInner = <T extends FieldValues>(props: Props<T>) => {
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
          <TextArea
            {...field}
            id={id}
            placeholder={props.placeholder}
            rows={props.rows ?? 3}
            disabled={field.disabled || props.forceDisabled}
          />
        </label>
      )}
    />
  );
};

export const TextAreaField = React.memo(TextAreaFieldInner) as typeof TextAreaFieldInner;

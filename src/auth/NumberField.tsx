import { Text, TextField } from '@radix-ui/themes';
import React from 'react';
import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form';
import styles from './NumberField.module.scss';

type Props<T extends FieldValues> = {
  readonly control: Control<T>;
  readonly name: FieldPath<T>;
  readonly label: string;
  readonly placeholder?: string;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly forceDisabled?: boolean;
  readonly leftElement?: React.ReactNode;
  readonly rightElement?: React.ReactNode;
};

const NumberFieldInner = <T extends FieldValues>(props: Props<T>) => {
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
            className={styles.NumberField}
            {...field}
            id={id}
            type='number'
            inputMode='numeric'
            placeholder={props.placeholder}
            min={props.min}
            max={props.max}
            step={props.step}
            disabled={field.disabled || props.forceDisabled}
            onChange={(event) => {
              const value = event.target.valueAsNumber;
              const normalizedValue = Number.isNaN(value) ? (props.min ?? 0) : value;

              field.onChange(normalizedValue);
            }}
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

export const NumberField = React.memo(NumberFieldInner) as typeof NumberFieldInner;

import { Text, TextField } from '@radix-ui/themes';
import * as React from 'react';
import styles from './NumberField.module.scss';

type Props = {
  readonly value: number | null;
  readonly onChange: (value: number | null) => void;
  readonly label: string;
  readonly placeholder?: string;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly disabled?: boolean;
  readonly leftElement?: React.ReactNode;
  readonly rightElement?: React.ReactNode;
};

const normalizeValue = (value: number, min?: number, max?: number): number | null => {
  if (Number.isNaN(value)) {
    return null;
  }

  if (min != null && value < min) {
    return min;
  }

  if (max != null && value > max) {
    return max;
  }

  return value;
};

export const NumberField = React.memo((props: Props) => {
  const id = React.useId();
  const [inputValue, setInputValue] = React.useState(() =>
    props.value != null ? String(props.value) : ''
  );

  // Sync display value when prop changes from outside
  React.useEffect(() => {
    setInputValue(props.value != null ? String(props.value) : '');
  }, [props.value]);

  return (
    <label htmlFor={id}>
      <Text size='2' color='gray'>
        {props.label}
      </Text>
      <TextField.Root
        className={styles.NumberField}
        id={id}
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        onBlur={() => {
          const normalizedValue = normalizeValue(Number(inputValue), props.min, props.max);
          setInputValue(normalizedValue != null ? String(normalizedValue) : '');
          props.onChange(normalizedValue);
        }}
        type='number'
        inputMode='numeric'
        placeholder={props.placeholder}
        min={props.min}
        max={props.max}
        step={props.step}
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

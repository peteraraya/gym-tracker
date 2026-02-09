'use client';

import React from 'react';
import { useField } from 'formik';
import { Input } from './Input';

interface Props {
  name: string;
  label?: string;
  onValueChange?: (value: string) => void;
}

export const FormikTextInput: React.FC<Props & React.InputHTMLAttributes<HTMLInputElement>> = ({ name, label, onValueChange, ...props }) => {
  const [field, meta] = useField(name);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    field.onChange(e);
    if (typeof props.onChange === 'function') props.onChange(e as any);
    if (onValueChange) onValueChange(e.target.value);
  };

  return (
    <div>
      <Input
        {...field}
        {...props}
        id={props.id || name}
        label={label}
        error={meta.touched ? (meta.error as string) : undefined}
        onChange={handleChange}
      />
    </div>
  );
};

export default FormikTextInput;

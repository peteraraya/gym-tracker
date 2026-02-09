'use client';

import React from 'react';
import { useField } from 'formik';
import PasswordInput from './PasswordInput';

interface Props {
  name: string;
  label?: string;
}

export const FormikPasswordInput: React.FC<Props & React.InputHTMLAttributes<HTMLInputElement>> = ({ name, label, ...props }) => {
  const [field, meta] = useField(name);

  return (
    <div>
      <PasswordInput
        {...field}
        {...props}
        label={label}
      />
      {meta.touched && meta.error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{meta.error}</p>
      )}
    </div>
  );
};

export default FormikPasswordInput;

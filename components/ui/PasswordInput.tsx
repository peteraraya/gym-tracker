'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from './Input';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({ label, error, className = '', ...props }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative w-full">
      <Input
        {...props}
        type={visible ? 'text' : 'password'}
        label={label}
        error={error}
        className={`${className} pr-10`}
      />

      <button
        type="button"
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        onClick={() => setVisible(v => !v)}
        className="absolute right-3 top-8 text-gray-500 dark:text-gray-300"
      >
        {visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
};

export default PasswordInput;

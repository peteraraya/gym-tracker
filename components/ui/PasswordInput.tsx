'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from '@/components/icons/lucide';
import { Input } from './Input';
import { useTranslations } from '@/context/LocaleContext';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const t = useTranslations('auth');

    return (
      <div className="relative w-full">
        <Input
          {...props}
          ref={ref}
          type={visible ? 'text' : 'password'}
          label={label}
          error={error}
          className={`${className} pr-10`}
        />

        <button
          type="button"
          aria-label={visible ? (t ? t('hidePassword') : 'Ocultar contraseña') : (t ? t('showPassword') : 'Mostrar contraseña')}
          onClick={() => setVisible(v => !v)}
          className="absolute right-3 top-8 text-gray-500 dark:text-gray-300"
        >
          {visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;

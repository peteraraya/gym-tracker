import React from 'react';

interface Props {
  password: string;
}

export const PasswordRequirements: React.FC<Props> = ({ password }) => {
  const checks = [
    { test: /[0-9]/.test(password), label: 'Tiene al menos un número' },
    { test: /[A-Z]/.test(password), label: 'Tiene al menos una mayúscula' },
    { test: /[a-z]/.test(password), label: 'Tiene al menos una minúscula' },
    { test: /[^A-Za-z0-9]/.test(password), label: 'Tiene un carácter especial ej: #@,\"' },
    { test: password.length >= 8, label: 'Tiene al menos 8 caracteres' }
  ];

  return (
    <div className="mt-2">
      {checks.map((c, idx) => (
        <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <span className={`w-4 h-4 rounded-full flex items-center justify-center ${c.test ? 'bg-green-500 text-white' : 'border border-gray-300'}`}>
            {c.test ? '✓' : ''}
          </span>
          <span className={`${c.test ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>{c.label}</span>
        </div>
      ))}
    </div>
  );
};

export default PasswordRequirements;

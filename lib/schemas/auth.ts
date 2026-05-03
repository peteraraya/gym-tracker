import { z } from 'zod';

export const authSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Requerido'),
  password: z.string().min(1, 'Requerido'),
  confirmPassword: z.string().optional(),
});

export function getRegisterSchema() {
  return authSchema.superRefine((data, ctx) => {
    if (!data.password || data.password.length < 8) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Mínimo 8 caracteres', path: ['password'] });
    }
    if (!/[A-Z]/.test(data.password)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Debe tener al menos una mayúscula', path: ['password'] });
    }
    if (!/[a-z]/.test(data.password)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Debe tener al menos una minúscula', path: ['password'] });
    }
    if (!/[0-9]/.test(data.password)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Debe tener al menos un número', path: ['password'] });
    }
    if (!/[^A-Za-z0-9]/.test(data.password)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Debe tener al menos un carácter especial', path: ['password'] });
    }
    if (data.confirmPassword && data.password !== data.confirmPassword) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Las contraseñas no coinciden', path: ['confirmPassword'] });
    }
  });
}

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Requerido'),
});

export type AuthFormData = z.infer<typeof authSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

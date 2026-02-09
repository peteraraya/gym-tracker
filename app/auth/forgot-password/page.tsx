"use client";

import React, { useState, useEffect } from 'react';
import { Formik, Form, type FormikHelpers, type FormikProps } from 'formik';
import * as Yup from 'yup';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import FormikTextInput from '@/components/ui/FormikTextInput';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from '@/context/LocaleContext';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const t = useTranslations('auth');
  const [cooldown, setCooldown] = useState(0);
  const [cooldownEmail, setCooldownEmail] = useState<string | null>(null);
  const COOLDOWN_SECONDS = 30;
  const COOLDOWN_KEY_PREFIX = 'forgot-password-cooldown:';

  // Resume cooldown when user types an email that has a persisted cooldown
  const handleEmailChange = (email: string) => {
    if (!email) return;
    try {
      const raw = localStorage.getItem(`${COOLDOWN_KEY_PREFIX}${email}`);
      if (raw) {
        const until = Number(raw);
        const remaining = Math.ceil((until - Date.now()) / 1000);
        if (remaining > 0) {
          setCooldown(remaining);
          setCooldownEmail(email);
        } else {
          localStorage.removeItem(`${COOLDOWN_KEY_PREFIX}${email}`);
          if (cooldownEmail === email) setCooldown(0);
        }
      }
    } catch {
      // ignore storage errors
    }
  };

  useCooldownTimer(cooldown, setCooldown, cooldownEmail, COOLDOWN_KEY_PREFIX);

  const initialValues = { email: '' };
  const { success, error: toastError } = useToast();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">{t('forgotPassword') || 'Recuperar contraseña'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={initialValues}
            validationSchema={Yup.object({
              email: Yup.string().email(t('emailInvalid') || 'Email inválido').required(t('required') || 'Requerido')
            })}
            onSubmit={async (
              values: typeof initialValues,
              formikHelpers: FormikHelpers<typeof initialValues>
            ) => {
              const { setSubmitting, setStatus } = formikHelpers as FormikHelpers<typeof initialValues> & { setStatus?: (s?: unknown) => void };
              setStatus?.(undefined);
              try {
                const { error } = await resetPassword(values.email);
                if (error) {
                  // Map specific Supabase errors to user-friendly messages
                  const message = (error as any)?.status === 429 || /rate limit|too many requests|rate_limited/i.test((error as any)?.message || '')
                    ? (t('emailRateLimit') || 'Se ha excedido el límite de envío de correos. Intenta de nuevo más tarde.')
                    : ((error as any)?.message || t('sendResetError') || 'Error al enviar el enlace. Intenta nuevamente más tarde.');
                  setStatus?.({ error: message });
                  // also show toast for errors
                  toastError(message);
                } else {
                  const msg = t('checkYourEmail') || 'Revisa tu correo para continuar con la recuperación.';
                  setStatus?.({ success: msg });
                  success(msg);
                }
                // Start cooldown to avoid rapid re-sends and persist per-email
                setCooldown(COOLDOWN_SECONDS);
                setCooldownEmail(values.email);
                if (typeof window !== 'undefined') {
                  try {
                    localStorage.setItem(`${COOLDOWN_KEY_PREFIX}${values.email}`, String(Date.now() + COOLDOWN_SECONDS * 1000));
                  } catch {}
                }
              } catch (err) {
                setStatus?.({ error: t('sendResetError') || 'Error de conexión. Intenta nuevamente.' });
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {(props: FormikProps<typeof initialValues>) => {
              const { isSubmitting, status } = props;
              return (
                <Form className="space-y-4">
                  <FormikTextInput name="email" type="email" label={t('email') || 'Email'} placeholder="tu@email.com" required onValueChange={handleEmailChange} />

                  {status?.error && (
                    <div className="p-3 rounded-lg text-sm bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300">{status.error}</div>
                  )}
                  {status?.success && (
                    <div className="p-3 rounded-lg text-sm bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300">{status.success}</div>
                  )}

                  {cooldown > 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">{t('emailRateLimit') || `Espera ${cooldown}s antes de reintentar.`}</p>
                  )}
                  <div className="flex flex-col gap-3 items-center">
                    <Button type="submit" variant="primary" className="w-full max-w-md" loading={isSubmitting} disabled={cooldown > 0}>
                      {isSubmitting
                        ? (t('submitting') || 'Enviando...')
                        : cooldown > 0
                        ? `${t('sendReset') || 'Enviar enlace'} (${cooldown}s)`
                        : (t('sendReset') || 'Enviar enlace')
                      }
                    </Button>

                    <div className="w-full max-w-md text-center">
                      <Link href="/auth" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">{t('backToLogin') || 'Volver al login'}</Link>
                    </div>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </CardContent>
      </Card>
    </div>
  );
}

// Start/stop cooldown timer when `cooldown` changes
function useCooldownTimer(cooldown: number, setCooldown: (v: number) => void, cooldownEmail: string | null, keyPrefix: string) {
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(id);
          // remove persisted cooldown when finished
          if (typeof window !== 'undefined' && cooldownEmail) {
            try { localStorage.removeItem(`${keyPrefix}${cooldownEmail}`); } catch {}
          }
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [cooldown, setCooldown, cooldownEmail, keyPrefix]);
}

// Hook wrapper usage inside module scope: the component will call this manually

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Formik, Form, type FormikHelpers, type FormikProps } from 'formik';
import * as Yup from 'yup';
import FormikPasswordInput from '@/components/ui/FormikPasswordInput';
import FormikTextInput from '@/components/ui/FormikTextInput';
import { AppLogo } from '@/components/AppLogo';
import { useTranslations } from '@/context/LocaleContext';
import PasswordRequirements from '@/components/PasswordRequirements';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { signIn, signUp, isConfigured, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isConfigured) {
      router.push('/setup');
    }
  }, [isConfigured, router]);

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  if (!isConfigured) return null;

  const t = useTranslations('auth');
  const { success, error: toastError } = useToast();

  const initialValues = {
    email: '',
    password: '',
    confirmPassword: ''
  };

  const getSchema = (loginMode: boolean) => {
    if (loginMode) {
      return Yup.object().shape({
        email: Yup.string().email(t('emailInvalid')).required(t('required')),
        password: Yup.string().required(t('required'))
      });
    }

    return Yup.object().shape({
      email: Yup.string().email(t('emailInvalid')).required(t('required')),
      password: Yup.string()
        .required(t('required'))
        .min(8, 'Mínimo 8 caracteres')
        .matches(/[A-Z]/, 'Debe tener al menos una mayúscula')
        .matches(/[a-z]/, 'Debe tener al menos una minúscula')
        .matches(/[0-9]/, 'Debe tener al menos un número')
        .matches(/[^A-Za-z0-9]/, 'Debe tener al menos un carácter especial'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], t('passwordsNoMatch'))
        .required(t('required'))
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
          <CardHeader>
            <div className="text-center mb-4">
              <AppLogo large oneLine />
            </div>
            <CardTitle className="text-center text-2xl">
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </CardTitle>
          </CardHeader>
        <CardContent>
          <Formik
            initialValues={initialValues}
            validationSchema={getSchema(isLogin)}
            enableReinitialize
            onSubmit={async (
              values: typeof initialValues,
              formikHelpers: FormikHelpers<typeof initialValues>
            ) => {
              const { setSubmitting, setStatus } = formikHelpers as FormikHelpers<typeof initialValues> & { setStatus?: (s?: unknown) => void };
              setStatus?.(undefined);
              try {
                if (isLogin) {
                  const { error } = await signIn(values.email, values.password);
                  if (error) {
                    // Map common Supabase auth messages to translated, user-friendly text
                    const raw = (error as any)?.message || '';
                    const isInvalid = /invalid login credentials|invalid_credentials|Invalid login credentials/i.test(raw);
                    const message = isInvalid ? (t('invalidCredentials') || 'Invalid login credentials') : (t('signInError') || 'Error signing in. Please try again.');
                    setStatus?.({ error: message });
                    toastError(message);
                  }
                } else {
                  const { error } = await signUp(values.email, values.password);
                  if (error) {
                    const raw = (error as any)?.message || '';
                    const message = /already exists|duplicate|already registered/i.test(raw)
                      ? (t('accountCreated') || 'Account created! Check your email to confirm your account.')
                      : ((error as any)?.message || t('signInError'));
                    setStatus?.({ error: message });
                    toastError(message as string);
                  } else {
                    const msg = t('accountCreated');
                    setStatus?.({ success: msg });
                    success(msg);
                  }
                }
              } catch {
                const msg = '⚠️ Error de conexión. Verifica la configuración.';
                setStatus?.({ error: msg });
                toastError(msg);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {(props: FormikProps<typeof initialValues>) => {
              const { values, isSubmitting, status } = props;
              return (
                <Form className="space-y-4">
                <FormikTextInput
                  name="email"
                  type="email"
                  label={t('emailInvalid') ? 'Email' : 'Email'}
                  placeholder="tu@email.com"
                  required
                  autoComplete="email"
                />

                <FormikPasswordInput name="password" label={t('password')} placeholder="••••••••" />

        

                {!isLogin && (
                  <div>
                    <FormikPasswordInput name="confirmPassword" label={t('confirmPassword')} placeholder="••••••••" />
                    <PasswordRequirements password={values.password} />
                  </div>
                )}

                {/* Errors/success are shown via toasts; inline status hidden to avoid duplication */}
                

                <div className="flex flex-col gap-3 items-center">
                  <Button type="submit" variant="primary" className="w-full max-w-md" loading={isSubmitting}>
                    {isSubmitting ? (t('submitting') || 'Enviando...') : isLogin ? t('signIn') : t('signUp')}
                  </Button>

                  <div className="w-full max-w-md flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {isLogin ? t('noAccount') : t('haveAccount')}
                    </button>

                    {isLogin && (
                      <a href="/auth/forgot-password" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">{t('forgotPassword') || '¿Olvidaste tu contraseña?'}</a>
                    )}
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

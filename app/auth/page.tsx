'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
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
                  if (error) setStatus?.({ error: error.message });
                } else {
                  const { error } = await signUp(values.email, values.password);
                  if (error) setStatus?.({ error: error.message });
                  else setStatus?.({ success: t('accountCreated') });
                }
              } catch {
                setStatus?.({ error: '⚠️ Error de conexión. Verifica la configuración.' });
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

                {status?.error && (
                  <div className="p-3 rounded-lg text-sm bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300">{status.error}</div>
                )}
                {status?.success && (
                  <div className="p-3 rounded-lg text-sm bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300">{status.success}</div>
                )}

                <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? t('submitting') : isLogin ? t('signIn') : t('signUp')}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {isLogin ? t('noAccount') : t('haveAccount')}
                  </button>
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

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  authSchema,
  getRegisterSchema,
  type AuthFormData,
} from "@/lib/schemas/auth";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/NotificationContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { AppLogo } from "@/components/layout/AppLogo";
import { useLocale } from "@/context/LocaleContext";
import PasswordRequirements from "@/components/features/auth/PasswordRequirements";

interface AuthErrorLike {
  message?: string;
  status?: number;
}

function getMessage(e: AuthErrorLike | null | undefined): string {
  return e?.message ?? "";
}

function makeT(t: (key: string) => string, ns: string) {
  return (key: string) => t(`${ns}.${key}`);
}

export default function AuthPage() {
  const [ isLogin, setIsLogin ] = useState(true);
  const { signIn, signUp, isConfigured, user } = useAuth();
  const router = useRouter();
  const { t: tRaw } = useLocale();
  const t = useMemo(() => makeT(tRaw, "auth"), [ tRaw ]);
  const { success, error: toastError } = useToast();

  const schema = useMemo(
    () => (isLogin ? authSchema : getRegisterSchema()),
    [ isLogin ],
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<AuthFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { email: "", password: "", confirmPassword: "" },
    mode: "onTouched",
  });

  const password = watch("password") ?? "";

  useEffect(() => {
    if (!isConfigured) {
      router.push("/setup");
    }
  }, [ isConfigured, router ]);

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [ user, router ]);

  useEffect(() => {
    reset({ email: "", password: "", confirmPassword: "" });
  }, [ isLogin, reset ]);

  const onSubmit = useCallback(
    async (values: AuthFormData) => {
      try {
        if (isLogin) {
          const { error } = await signIn(values.email, values.password);
          if (error) {
            const raw = getMessage(error);
            const isInvalid =
              /invalid login credentials|invalid_credentials|Invalid login credentials/i.test(
                raw,
              );
            toastError(isInvalid ? t("invalidCredentials") : t("signInError"));
          }
        } else {
          const { error } = await signUp(values.email, values.password);
          if (error) {
            const raw = getMessage(error);
            const isDuplicate =
              /already exists|duplicate|already registered/i.test(raw);
            const msg = isDuplicate ? t("accountAlreadyExists") : t("signInError");
            setError("root", { message: msg });
            toastError(msg);
          } else {
            success(t("accountCreated"));
          }
        }
      } catch {
        const msg = "⚠️ Error de conexión. Verifica la configuración.";
        setError("root", { message: msg });
        toastError(msg);
      }
    },
    [ isLogin, signIn, signUp, t, toastError, success, setError ],
  );

  if (!isConfigured) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-center mb-4">
            <AppLogo large oneLine />
          </div>
          <CardTitle className="text-center text-2xl">
            {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <Input
              {...register("email")}
              type="email"
              label="Email"
              placeholder="tu@email.com"
              autoComplete="email"
              error={errors.email?.message as string}
            />

            <PasswordInput
              {...register("password")}
              label={t("password")}
              placeholder="••••••••"
              autoComplete={isLogin ? "current-password" : "new-password"}
              error={errors.password?.message as string}
            />

            {!isLogin && (
              <div>
                <PasswordInput
                  {...register("confirmPassword")}
                  label={t("confirmPassword")}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  error={errors.confirmPassword?.message as string}
                />
                <PasswordRequirements password={password} />
              </div>
            )}

            <div className="flex flex-col gap-3 items-center">
              <Button
                type="submit"
                variant="primary"
                className="w-full max-w-md"
                loading={isSubmitting}
              >
                {isSubmitting
                  ? t("submitting") || "Enviando..."
                  : isLogin
                    ? t("signIn")
                    : t("signUp")}
              </Button>

              <div className="w-full max-w-md flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {isLogin ? t("noAccount") : t("haveAccount")}
                </button>

                {isLogin && (
                  <a
                    href="/auth/forgot-password"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {t("forgotPassword") || "¿Olvidaste tu contraseña?"}
                  </a>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

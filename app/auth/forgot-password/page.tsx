"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/schemas/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "@/context/LocaleContext";
import Link from "next/link";
import { useToast } from "@/context/NotificationContext";

const COOLDOWN_SECONDS = 30;
const COOLDOWN_KEY_PREFIX = "forgot-password-cooldown:";

function getExpiresAt(seconds: number): number {
  return Date.now() + seconds * 1000;
}

interface AuthError {
  message?: string;
  status?: number;
}

function getErrorMessage(error: AuthError | null | undefined): string {
  return error?.message || "";
}

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const t = useTranslations("auth");
  const [cooldown, setCooldown] = useState(0);
  const [cooldownEmail, setCooldownEmail] = useState<string | null>(null);
  const { success, error: toastError } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  });

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

  const onSubmit = async (values: ForgotPasswordFormData) => {
    try {
      const { error } = await resetPassword(values.email);
      if (error) {
        const raw = getErrorMessage(error);
        const status = (error as AuthError)?.status;
        const message =
          status === 429 ||
          /rate limit|too many requests|rate_limited/i.test(raw)
            ? t("emailRateLimit") ||
              "Se ha excedido el límite de envío de correos. Intenta de nuevo más tarde."
            : raw ||
              t("sendResetError") ||
              "Error al enviar el enlace. Intenta nuevamente más tarde.";
        setError("root", { message });
        toastError(message);
      } else {
        const msg =
          t("checkYourEmail") ||
          "Revisa tu correo para continuar con la recuperación.";
        success(msg);
      }
      setCooldown(COOLDOWN_SECONDS);
      setCooldownEmail(values.email);
      if (typeof window !== "undefined") {
        try {
          const expiresAt = getExpiresAt(COOLDOWN_SECONDS);
          localStorage.setItem(
            `${COOLDOWN_KEY_PREFIX}${values.email}`,
            String(expiresAt),
          );
        } catch {}
      }
    } catch {
      const msg =
        t("sendResetError") || "Error de conexión. Intenta nuevamente.";
      setError("root", { message: msg });
      toastError(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            {t("forgotPassword") || "Recuperar contraseña"}
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
              label={t("email") || "Email"}
              placeholder="tu@email.com"
              error={errors.email?.message}
              onChange={(e) => {
                register("email").onChange(e);
                handleEmailChange(e.target.value);
              }}
            />

            {cooldown > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {t("emailRateLimit") ||
                  `Espera ${cooldown}s antes de reintentar.`}
              </p>
            )}
            <div className="flex flex-col gap-3 items-center">
              <Button
                type="submit"
                variant="primary"
                className="w-full max-w-md"
                loading={isSubmitting}
                disabled={cooldown > 0}
              >
                {isSubmitting
                  ? t("submitting") || "Enviando..."
                  : cooldown > 0
                    ? `${t("sendReset") || "Enviar enlace"} (${cooldown}s)`
                    : t("sendReset") || "Enviar enlace"}
              </Button>

              <div className="w-full max-w-md text-center">
                <Link
                  href="/auth"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {t("backToLogin") || "Volver al login"}
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function useCooldownTimer(
  cooldown: number,
  setCooldown: React.Dispatch<React.SetStateAction<number>>,
  cooldownEmail: string | null,
  keyPrefix: string,
) {
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(id);
          if (typeof window !== "undefined" && cooldownEmail) {
            try {
              localStorage.removeItem(`${keyPrefix}${cooldownEmail}`);
            } catch {}
          }
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [cooldown, setCooldown, cooldownEmail, keyPrefix]);
}

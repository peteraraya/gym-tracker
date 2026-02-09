'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConfigured) {
      setError('⚠️ Supabase no está configurado. Redirigiendo a configuración...');
      setTimeout(() => router.push('/setup'), 2000);
      return;
    }

    setError('');
    setLoading(true);

    // Validaciones en registro
    if (!isLogin) {
      // Reglas básicas: mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial
      const pwd = password;
      const rules = [
        { ok: pwd.length >= 8, msg: 'La contraseña debe tener al menos 8 caracteres.' },
        { ok: /[A-Z]/.test(pwd), msg: 'La contraseña debe contener al menos una letra mayúscula.' },
        { ok: /[a-z]/.test(pwd), msg: 'La contraseña debe contener al menos una letra minúscula.' },
        { ok: /[0-9]/.test(pwd), msg: 'La contraseña debe contener al menos un número.' },
        { ok: /[^A-Za-z0-9]/.test(pwd), msg: 'La contraseña debe contener al menos un carácter especial.' }
      ];

      const failed = rules.find(r => !r.ok);
      if (failed) {
        setError(failed.msg);
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        setLoading(false);
        return;
      }
    }

    try {
      const { error } = isLogin
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        setError(error.message);
      } else if (isLogin) {
        // Successful login - redirect will happen via useEffect when user state updates
        return;
      } else {
        setError('¡Cuenta creada! Revisa tu email para confirmar tu cuenta.');
      }
    } catch {
      setError('⚠️ Error de conexión. Verifica que Supabase esté configurado correctamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isConfigured) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-center mb-4">
            <span className="text-6xl">💪</span>
          </div>
          <CardTitle className="text-center text-2xl">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              autoComplete="email"
            />

            <PasswordInput
              label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              minLength={8}
            />

            {!isLogin && (
              <PasswordInput
                label="Repetir Contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                minLength={8}
              />
            )}

            {error && (
              <div className={`p-3 rounded-lg text-sm ${
                error.includes('creada') || error.includes('Revisa')
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
              }`}>
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? '...' : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {isLogin
                  ? '¿No tienes cuenta? Regístrate'
                  : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

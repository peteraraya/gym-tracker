"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast, useConfirm } from "@/context/NotificationContext";
import { useGym } from "@/context/GymContext";
import {
  isDevToolsEnabled,
  devClearAllSessions,
  devClearAllRoutines,
  devClearProfile,
  devClearPlans,
  devClearRecommendations,
  devClearAllData,
  devGenerateTestData,
} from "@/lib/storage/storage";

/**
 * Panel de herramientas de desarrollo
 * Solo visible cuando NEXT_PUBLIC_ENABLE_DEV_TOOLS=true
 *
 * ⚠️ PELIGROSO: Permite eliminar todos los datos del usuario
 */
export function DevTools() {
  const { success, error: showError } = useToast();
  const { confirm } = useConfirm();
  const { refreshRoutines, refreshSessions } = useGym();
  const [isLoading, setIsLoading] = useState(false);

  // No mostrar si dev tools no están habilitados
  if (!isDevToolsEnabled()) {
    return null;
  }

  const handleClearSessions = async () => {
    const confirmed = await confirm({
      title: "⚠️ Eliminar Todas las Sesiones",
      message:
        "Esta acción eliminará TODAS tus sesiones de entrenamiento. Esta acción es IRREVERSIBLE. ¿Estás seguro?",
      confirmText: "Sí, eliminar todo",
      cancelText: "Cancelar",
      variant: "danger",
    });

    if (!confirmed) return;

    setIsLoading(true);
    try {
      const result = await devClearAllSessions();

      if (result.error) {
        showError(`Error: ${result.error}`);
      } else {
        success(`✅ ${result.deleted} sesiones eliminadas`);
        await refreshSessions();
      }
    } catch (err) {
      showError("Error al eliminar sesiones");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearRoutines = async () => {
    const confirmed = await confirm({
      title: "⚠️ Eliminar Todas las Rutinas",
      message:
        "Esta acción eliminará TODAS tus rutinas. Esta acción es IRREVERSIBLE. ¿Estás seguro?",
      confirmText: "Sí, eliminar todo",
      cancelText: "Cancelar",
      variant: "danger",
    });

    if (!confirmed) return;

    setIsLoading(true);
    try {
      const result = await devClearAllRoutines();

      if (result.error) {
        showError(`Error: ${result.error}`);
      } else {
        success(`✅ ${result.deleted} rutinas eliminadas`);
        await refreshRoutines();
      }
    } catch (err) {
      showError("Error al eliminar rutinas");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearProfile = async () => {
    const confirmed = await confirm({
      title: "⚠️ Limpiar Perfil",
      message: "Esta acción limpiará tu perfil de usuario. ¿Estás seguro?",
      confirmText: "Sí, limpiar",
      cancelText: "Cancelar",
      variant: "danger",
    });

    if (!confirmed) return;

    setIsLoading(true);
    try {
      const result = await devClearProfile();

      if (result.error) {
        showError(`Error: ${result.error}`);
      } else {
        success("✅ Perfil limpiado");
      }
    } catch (err) {
      showError("Error al limpiar perfil");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearPlans = async () => {
    const confirmed = await confirm({
      title: "⚠️ Limpiar Planes",
      message:
        "Esta acción limpiará tus planes semanales y mensuales. ¿Estás seguro?",
      confirmText: "Sí, limpiar",
      cancelText: "Cancelar",
      variant: "danger",
    });

    if (!confirmed) return;

    setIsLoading(true);
    try {
      const result = await devClearPlans();

      if (result.error) {
        showError(`Error: ${result.error}`);
      } else {
        success("✅ Planes limpiados");
      }
    } catch (err) {
      showError("Error al limpiar planes");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearRecommendations = async () => {
    const confirmed = await confirm({
      title: "⚠️ Limpiar Recomendaciones",
      message:
        "Esta acción limpiará todas las recomendaciones de progresión. ¿Estás seguro?",
      confirmText: "Sí, limpiar",
      cancelText: "Cancelar",
      variant: "danger",
    });

    if (!confirmed) return;

    setIsLoading(true);
    try {
      const result = await devClearRecommendations();

      if (result.error) {
        showError(`Error: ${result.error}`);
      } else {
        success("✅ Recomendaciones limpiadas");
      }
    } catch (err) {
      showError("Error al limpiar recomendaciones");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAllData = async () => {
    const confirmed = await confirm({
      title: "🚨 ELIMINAR TODO",
      message:
        "Esta acción eliminará TODOS tus datos: sesiones, rutinas, perfil, planes y recomendaciones. Esta acción es COMPLETAMENTE IRREVERSIBLE. ¿Estás ABSOLUTAMENTE seguro?",
      confirmText: "SÍ, ELIMINAR TODO",
      cancelText: "Cancelar",
      variant: "danger",
    });

    if (!confirmed) return;

    // Segunda confirmación
    const doubleConfirmed = await confirm({
      title: "🚨 ÚLTIMA ADVERTENCIA",
      message:
        "Esta es tu última oportunidad. Una vez eliminados, los datos NO se pueden recuperar. ¿Continuar?",
      confirmText: "ELIMINAR TODO AHORA",
      cancelText: "No, cancelar",
      variant: "danger",
    });

    if (!doubleConfirmed) return;

    setIsLoading(true);
    try {
      const result = await devClearAllData();

      if (result.errors.length > 0) {
        showError(`Errores: ${result.errors.join(", ")}`);
      }

      success(
        `✅ Datos eliminados: ${result.sessions} sesiones, ${result.routines} rutinas, ` +
          `perfil: ${result.profile ? "sí" : "no"}, planes: ${result.plans ? "sí" : "no"}, ` +
          `recomendaciones: ${result.recommendations ? "sí" : "no"}`,
        8000,
      );

      await refreshRoutines();
      await refreshSessions();

      // Recargar página después de 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      showError("Error al eliminar datos");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateTestData = async () => {
    setIsLoading(true);
    try {
      const result = await devGenerateTestData();

      if (result.error) {
        showError(`Error: ${result.error}`);
      } else {
        success("✅ Datos de prueba generados");
        await refreshRoutines();
        await refreshSessions();
      }
    } catch (err) {
      showError("Error al generar datos de prueba");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-4 border-red-500 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
      <CardHeader>
        <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
          <span className="text-2xl">⚠️</span>
          Herramientas de Desarrollo
          <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">
            DEV ONLY
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-500 dark:border-yellow-700 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 font-semibold">
            ⚠️ ADVERTENCIA: Estas herramientas son PELIGROSAS y pueden eliminar
            todos tus datos. Solo están disponibles en modo desarrollo.
          </p>
          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
            Para desactivar: Elimina o cambia NEXT_PUBLIC_ENABLE_DEV_TOOLS en
            .env.local
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Limpiar Datos Individuales
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="danger"
              onClick={handleClearSessions}
              disabled={isLoading}
              className="w-full"
            >
              🗑️ Eliminar Sesiones
            </Button>

            <Button
              variant="danger"
              onClick={handleClearRoutines}
              disabled={isLoading}
              className="w-full"
            >
              🗑️ Eliminar Rutinas
            </Button>

            <Button
              variant="danger"
              onClick={handleClearProfile}
              disabled={isLoading}
              className="w-full"
            >
              🗑️ Limpiar Perfil
            </Button>

            <Button
              variant="danger"
              onClick={handleClearPlans}
              disabled={isLoading}
              className="w-full"
            >
              🗑️ Limpiar Planes
            </Button>

            <Button
              variant="danger"
              onClick={handleClearRecommendations}
              disabled={isLoading}
              className="w-full"
            >
              🗑️ Limpiar Recomendaciones
            </Button>
          </div>
        </div>

        <div className="border-t-2 border-red-300 dark:border-red-700 pt-4 space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Acciones Globales
          </h3>

          <Button
            variant="primary"
            onClick={handleGenerateTestData}
            disabled={isLoading}
            className="w-full"
          >
            ✨ Generar Datos de Prueba
          </Button>

          <Button
            variant="danger"
            onClick={handleClearAllData}
            disabled={isLoading}
            className="w-full bg-red-700 hover:bg-red-800 text-white font-bold"
          >
            🚨 ELIMINAR TODO
          </Button>
        </div>

        {isLoading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Procesando...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

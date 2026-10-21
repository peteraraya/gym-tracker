"use client";

import React, { useState, useRef, useEffect } from "react";
import { WorkoutSession } from "@/types";
import { useGym } from "@/context/GymContext";
import { Button } from "@/components/ui/Button";
import {
  X,
  Send,
  Sparkles,
  Minimize2,
  Maximize2,
} from "@/components/icons/lucide";
import { EXERCISE_DATABASE } from "@/data/exercises";
import { useToast } from "@/context/NotificationContext";
import { useWorkout } from "@/context/WorkoutContext";
import { useRouter, usePathname } from "next/navigation";
import { getTrainerReply, TrainerLevel } from "@/lib/application/ai/trainerPersona";
import { Modal } from "@/components/ui/Modal";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function FloatingAIAssistant() {
  const { sessions, routines, refreshRoutines, refreshSessions } = useGym();
  const pathname = usePathname();
  const isInWorkout = pathname?.startsWith('/workout/');
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "¡Hola! 👋 Soy tu asistente de entrenamiento. ¿En qué puedo ayudarte?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [trainerMode, setTrainerMode] = useState(false);
  const [trainerLevel, setTrainerLevel] = useState<TrainerLevel>("intermedio");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"search" | "suggest" | null>(
    null,
  );
  const [modalInput, setModalInput] = useState("");
  const [modalSelection, setModalSelection] = useState<number | null>(null);
  const [customSplit, setCustomSplit] = useState<
    "fullbody" | "upper_lower" | "ppl"
  >("fullbody");
  const [customDays, setCustomDays] = useState<number>(3);
  const [customEmphasis, setCustomEmphasis] = useState<
    "fuerza" | "hipertrofia" | "resistencia"
  >("hipertrofia");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toast = useToast();
  const workout = useWorkout();
  const router = useRouter();

  const addAssistantMessage = (content: string) => {
    const assistantMessage: Message = {
      id: (Date.now() + Math.random()).toString(),
      role: "assistant",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
  };

  // --- Quick action handlers ---
  const handleQuickProgress = () => {
    const recent = sessions.slice(-5);
    if (!sessions || sessions.length === 0) {
      addAssistantMessage(
        "📊 Aún no tienes sesiones registradas. ¡Empieza a entrenar!",
      );
      return;
    }
    const total = sessions.length;
    const avg =
      recent.reduce((s, x) => s + (x.totalDuration || 0), 0) /
      Math.max(1, recent.length);
    addAssistantMessage(
      `📊 Análisis rápido:\n\n✅ Sesiones: ${total}\n⏱️ Duración promedio últimas ${recent.length}: ${Math.floor(avg / 60)} min`,
    );
  };

  const handleSearchExercise = async () => {
    // abrir modal de búsqueda
    setModalAction("search");
    setModalInput("");
    setModalOpen(true);
  };

  const handleSuggestRoutine = async () => {
    // abrir modal para pedir objetivo
    setModalAction("suggest");
    setModalInput("hipertrofia");
    setModalOpen(true);
  };

  const performSearch = (q: string) => {
    if (!q) return;
    const found = EXERCISE_DATABASE.find((ex) =>
      ex.name.toLowerCase().includes(q.toLowerCase()),
    );
    if (found) {
      addAssistantMessage(
        `💪 **${found.name}**\n\n${found.description || "Sin descripción"}\n\n🎯 Grupo: ${found.muscleGroup}`,
      );
    } else {
      addAssistantMessage(
        "No encontré un ejercicio con ese nombre. Intenta otro término.",
      );
    }
  };

  const performSuggestRoutine = (objective: string) => {
    const o = (objective || "hipertrofia").toLowerCase();
    if (o === "fuerza") {
      addAssistantMessage(
        "Sugerencia (Fuerza):\n• Sentadillas 5x5\n• Press banca 5x5\n• Peso muerto 3x5",
      );
    } else if (o === "resistencia") {
      addAssistantMessage(
        "Sugerencia (Resistencia):\n• Circuito: 3 rondas de 12-15 reps por ejercicio\n• Cardio moderado 20-30 min",
      );
    } else if (o === "fullbody") {
      addAssistantMessage(
        "Sugerencia (Full-body):\n• Sentadillas 3x8-10\n• Press banca 3x8-10\n• Remo 3x8-10\n• Accesorios 2x10-15",
      );
    } else if (o === "upper_lower") {
      addAssistantMessage(
        "Sugerencia (Upper/Lower):\nUpper: Press banca 4x6-10, Remo 4x6-10\nLower: Sentadillas 4x6-10, Peso muerto rumano 3x8",
      );
    } else if (o === "ppl" || o === "push_pull_legs") {
      addAssistantMessage(
        "Sugerencia (Push/Pull/Legs):\nPush: Press banca 4x6-10, Press militar 3x8\nPull: Remo 4x6-10, Dominadas 3x6-10\nLegs: Sentadilla 4x6-10, Peso muerto rumano 3x8",
      );
    } else {
      addAssistantMessage(
        "Sugerencia (Hipertrofia):\n• Press banca 4x8-12\n• Remo 4x8-12\n• Sentadillas 4x8-12",
      );
    }
  };

  const performCustomSuggest = (
    split: typeof customSplit,
    days: number,
    emphasis: typeof customEmphasis,
  ) => {
    let text = `Rutina personalizada (${days} días) - Split: ${split === "fullbody" ? "Full-body" : split === "upper_lower" ? "Upper/Lower" : "Push/Pull/Legs"} - Enfoque: ${emphasis}\n`;
    if (split === "fullbody") {
      text +=
        "Ejemplo por día: 2 compuestos principales + 1 accesorio. 3x8-12 cada uno.";
    } else if (split === "upper_lower") {
      text +=
        "Upper: 3-4 ejercicios compuestos. Lower: 3-4 ejercicios con énfasis en piernas.";
    } else {
      text +=
        "Push/Pull/Legs: divide en 3 días centrados en empuje, tracción y piernas.";
    }
    text += "\nConsejo: ajusta volumen según experiencia y recuperacion.";
    addAssistantMessage(text);
  };

  const handleWarmup = () => {
    let target = "full body";
    const last: WorkoutSession | undefined =
      sessions && sessions.length > 0
        ? sessions[sessions.length - 1]
        : undefined;
    if (last && Array.isArray(last.exercises) && last.exercises.length > 0) {
      const firstEx = last.exercises[0];
      const exFromDb = EXERCISE_DATABASE.find(
        (e) => e.id === firstEx.exerciseId || e.name === firstEx.exerciseName,
      );
      if (exFromDb && exFromDb.muscleGroup) target = exFromDb.muscleGroup;
    }
    const candidates = EXERCISE_DATABASE.filter((e) =>
      (e.muscleGroup || "")
        .toLowerCase()
        .includes((target || "").toLowerCase()),
    ).slice(0, 3);
    if (candidates.length === 0) {
      addAssistantMessage(
        "Calentamiento sugerido: movilidad general + 5-10 min cardio ligero.",
      );
    } else {
      addAssistantMessage(
        `Calentamiento para ${target}: ${candidates.map((c) => c.name).join(", ")}\nRealiza series ligeras de activación antes de las series de trabajo.`,
      );
    }
  };

  const handleStartWorkout = () => {
    if (!routines || routines.length === 0) {
      toast.error("No hay rutinas disponibles para iniciar.");
      return;
    }
    const first = routines[0];
    try {
      workout.startWorkout(first);
      router.push(`/workout/${first.id}`);
      addAssistantMessage(`Iniciando entrenamiento: ${first.name}`);
    } catch (e) {
      console.error("Error starting workout", e);
      toast.error("No se pudo iniciar el workout.");
    }
  };

  const handleRetryLoad = async () => {
    try {
      toast.info("Reintentando carga...");
      await Promise.all([refreshRoutines(), refreshSessions()]);
      toast.success("Datos recargados");
      addAssistantMessage("He reintentado cargar tus datos.");
    } catch (e) {
      console.error("Retry load failed", e);
      toast.error("No se pudo recargar los datos");
    }
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const generateResponse = async (userMessage: string): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase();

    // Si el modo entrenador está activo, consultamos la persona local primero
    if (trainerMode) {
      try {
        const trainerReply = getTrainerReply(
          userMessage,
          trainerLevel,
          sessions,
        );
        if (trainerReply) return trainerReply;
      } catch (e) {
        console.error("Trainer persona error", e);
      }
    }

    // Análisis de progreso
    if (
      lowerMessage.includes("progreso") ||
      lowerMessage.includes("análisis")
    ) {
      const recentSessions = sessions.slice(-5);
      if (recentSessions.length === 0) {
        return "📊 Aún no tienes sesiones registradas. ¡Empieza a entrenar!";
      }

      const totalSessions = sessions.length;
      const avgDuration =
        recentSessions.reduce((sum, s) => sum + (s.totalDuration || 0), 0) /
        recentSessions.length;

      return `📊 **Análisis rápido:**\n\n✅ Sesiones: ${totalSessions}\n⏱️ Duración promedio: ${Math.floor(avgDuration / 60)} min\n\n${totalSessions > 10 ? "¡Excelente consistencia!" : "Sigue así 💪"}`;
    }

    // Preguntas sobre ejercicios
    const exerciseMatch = EXERCISE_DATABASE.find((ex) =>
      lowerMessage.includes(ex.name.toLowerCase()),
    );

    if (exerciseMatch) {
      return `💪 **${exerciseMatch.name}**\n\n${exerciseMatch.description || "Ejercicio efectivo"}\n\n🎯 Grupo: ${exerciseMatch.muscleGroup}\n⚙️ Equipo: ${exerciseMatch.equipment || "Variado"}\n\n${exerciseMatch.recommendedSets ? `📊 ${exerciseMatch.recommendedSets}` : ""}\n${exerciseMatch.recommendedReps ? `🔢 ${exerciseMatch.recommendedReps}` : ""}`;
    }

    // Técnica
    if (lowerMessage.includes("técnica") || lowerMessage.includes("forma")) {
      return `🎯 **Principios clave:**\n\n1. Control del movimiento\n2. Rango completo\n3. Respiración correcta\n4. Postura alineada\n\n¿Sobre qué ejercicio?`;
    }

    // Nutrición
    if (
      lowerMessage.includes("nutrición") ||
      lowerMessage.includes("proteína")
    ) {
      return `🍽️ **Nutrición básica:**\n\n• Proteína: 1.6-2.2g/kg\n• Carbos pre-entreno\n• Hidratación: 3-4L/día\n\n💡 La nutrición es 70% del éxito`;
    }

    // Respuesta por defecto
    return `Puedo ayudarte con:\n\n• Análisis de progreso\n• Info de ejercicios\n• Técnica y forma\n• Nutrición básica\n\n¿Qué necesitas?`;
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const responseContent = await generateResponse(userMessage.content);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: responseContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filtered exercises for modal search (max 8)
  const filteredExercises =
    modalAction === "search" && modalInput.trim()
      ? EXERCISE_DATABASE.filter((ex) =>
          ex.name.toLowerCase().includes(modalInput.trim().toLowerCase()),
        ).slice(0, 5)
      : EXERCISE_DATABASE.slice(0, 5);

  // Botón flotante
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`group fixed ${isInWorkout ? 'bottom-[120px]' : 'bottom-[calc(5rem+env(safe-area-inset-bottom))] lg:bottom-6'} right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-700 text-white shadow-lg shadow-emerald-950/20 transition-transform hover:scale-105 hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:bg-emerald-300 dark:text-gray-950 dark:hover:bg-emerald-200 dark:focus-visible:ring-emerald-300 dark:focus-visible:ring-offset-zinc-950 lg:right-6`}
        aria-label="Abrir asistente IA"
        aria-haspopup="dialog"
      >
        <Sparkles aria-hidden="true" className="h-6 w-6 transition-transform group-hover:rotate-6" />
      </button>
    );
  }

  // Widget del chat
  return (
    <div
      id="floating-ai-assistant"
      role="dialog"
      aria-label="Asistente IA"
      aria-modal="false"
      className={`fixed z-40 transition-all duration-300 ${
        isMinimized
          ? `${isInWorkout ? 'bottom-[120px]' : 'bottom-[calc(5rem+env(safe-area-inset-bottom))] lg:bottom-6'} right-4 w-[calc(100vw-2rem)] max-w-80 lg:right-6`
          : `${isInWorkout ? 'bottom-[120px]' : 'bottom-[calc(5rem+env(safe-area-inset-bottom))] lg:bottom-6'} right-4 h-[min(600px,70dvh)] w-[calc(100vw-2rem)] max-w-96 lg:right-6 lg:w-96`
      }`}
    >
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950">
        {/* Header */}
        <div className="flex items-center justify-between bg-emerald-900 p-4 text-white dark:bg-emerald-950">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-800 text-emerald-100 dark:bg-emerald-900 dark:text-emerald-200">
              <Sparkles aria-hidden="true" className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-white font-bold">Asistente IA</h3>
              <p className="text-emerald-100/80 text-xs">Asistente de entrenamiento</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTrainerMode(!trainerMode)}
              className={`min-h-10 rounded-lg px-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${trainerMode ? "bg-white/20" : "hover:bg-white/20"}`}
              aria-pressed={trainerMode}
              aria-label="Modo entrenador"
            >
              <span className="text-white text-xs">
                {trainerMode ? "Entrenador" : "Entrenador"}
              </span>
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="min-h-10 min-w-10 rounded-lg p-2 transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label={isMinimized ? "Maximizar" : "Minimizar"}
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4 text-white" />
              ) : (
                <Minimize2 className="w-4 h-4 text-white" />
              )}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="min-h-10 min-w-10 rounded-lg p-2 transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Quick action selector */}
            <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="flex items-center gap-2">
                <label htmlFor="quick-action" className="sr-only">
                  Acciones rápidas
                </label>
                <select
                  id="quick-action"
                  value={""}
                  onChange={(e) => {
                    const v = e.target.value;
                    // ejecutar acción correspondiente
                    if (v === "progress") handleQuickProgress();
                    if (v === "search") handleSearchExercise();
                    if (v === "suggest") handleSuggestRoutine();
                    if (v === "warmup") handleWarmup();
                    if (v === "start") handleStartWorkout();
                    if (v === "retry") handleRetryLoad();
                    // reset selection
                    try {
                      (e.target as HTMLSelectElement).selectedIndex = 0;
                    } catch (err) {}
                  }}
                  className="w-full sm:w-64 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm"
                >
                  <option value="">Acciones rápidas...</option>
                  <option value="progress">Progreso</option>
                  <option value="search">Buscar ejercicio</option>
                  <option value="suggest">Sugerir rutina</option>
                  <option value="warmup">Calentamiento</option>
                  <option value="start">Iniciar workout</option>
                  <option value="retry">Reintentar carga</option>
                </select>
                {trainerMode && (
                  <select
                    value={trainerLevel}
                    onChange={(e) =>
                      setTrainerLevel(e.target.value as TrainerLevel)
                    }
                    className="ml-2 px-2 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm"
                  >
                    <option value="novato">Novato</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                  </select>
                )}
              </div>
            </div>
            {/* Modal for prompts */}
            <Modal
              isOpen={modalOpen}
              onClose={() => {
                setModalOpen(false);
                setModalSelection(null);
                setModalInput("");
                setModalAction(null);
              }}
              title={
                modalAction === "search" ? "Buscar ejercicio" : "Sugerir rutina"
              }
            >
              <div className="space-y-3">
                {modalAction === "search" ? (
                  <>
                    <p className="text-sm text-gray-700">
                      Buscar o elige un ejercicio de la lista (pulsa el número):
                    </p>
                    <input
                      value={modalInput}
                      onChange={(e) => {
                        setModalInput(e.target.value);
                        setModalSelection(null);
                      }}
                      placeholder="Escribe para filtrar..."
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                    />
                    <div className="grid grid-cols-1 gap-2">
                      {filteredExercises.map((ex, idx) => (
                        <button
                          key={ex.name}
                          onClick={() => {
                            setModalSelection(idx + 1);
                          }}
                          aria-pressed={modalSelection === idx + 1}
                          className={`min-h-11 rounded-lg border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:focus-visible:ring-emerald-300 ${modalSelection === idx + 1 ? "border-emerald-600 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/50" : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"}`}
                        >
                          <strong className="mr-2">{idx + 1}.</strong> {ex.name}{" "}
                          <span className="text-xs text-gray-500">
                            {ex.muscleGroup || ""}
                          </span>
                        </button>
                      ))}
                      {filteredExercises.length === 0 && (
                        <p className="text-sm text-gray-500">
                          No hay resultados.
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-700">
                      Selecciona el objetivo:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setModalSelection(1)}
                        aria-pressed={modalSelection === 1}
                        className={`min-h-11 rounded-lg border px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:focus-visible:ring-emerald-300 ${modalSelection === 1 ? "border-emerald-600 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/50" : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"}`}
                      >
                        1. Full-body
                      </button>
                      <button
                        onClick={() => setModalSelection(2)}
                        aria-pressed={modalSelection === 2}
                        className={`min-h-11 rounded-lg border px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:focus-visible:ring-emerald-300 ${modalSelection === 2 ? "border-emerald-600 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/50" : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"}`}
                      >
                        2. Upper/Lower
                      </button>
                      <button
                        onClick={() => setModalSelection(3)}
                        aria-pressed={modalSelection === 3}
                        className={`min-h-11 rounded-lg border px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:focus-visible:ring-emerald-300 ${modalSelection === 3 ? "border-emerald-600 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/50" : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"}`}
                      >
                        3. Push/Pull/Legs
                      </button>
                      <button
                        onClick={() => setModalSelection(4)}
                        aria-pressed={modalSelection === 4}
                        className={`min-h-11 rounded-lg border px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:focus-visible:ring-emerald-300 ${modalSelection === 4 ? "border-emerald-600 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/50" : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"}`}
                      >
                        4. Fuerza
                      </button>
                      <button
                        onClick={() => setModalSelection(5)}
                        aria-pressed={modalSelection === 5}
                        className={`min-h-11 rounded-lg border px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:focus-visible:ring-emerald-300 ${modalSelection === 5 ? "border-emerald-600 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/50" : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"}`}
                      >
                        5. Hipertrofia
                      </button>
                      <button
                        onClick={() => setModalSelection(6)}
                        aria-pressed={modalSelection === 6}
                        className={`min-h-11 rounded-lg border px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:focus-visible:ring-emerald-300 ${modalSelection === 6 ? "border-emerald-600 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/50" : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"}`}
                      >
                        6. Resistencia
                      </button>
                      <button
                        onClick={() => setModalSelection(7)}
                        aria-pressed={modalSelection === 7}
                        className={`col-span-2 min-h-11 rounded-lg border px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:focus-visible:ring-emerald-300 ${modalSelection === 7 ? "border-emerald-600 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/50" : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"}`}
                      >
                        7. Personalizada
                      </button>
                    </div>

                    {modalSelection === 7 && (
                      <div className="mt-3 space-y-2 p-2 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-sm text-gray-700">
                          Configura tu rutina personalizada:
                        </p>
                        <div className="flex items-center gap-2">
                          <label className="text-sm">Split:</label>
                          <select
                            value={customSplit}
                            onChange={(
                              e: React.ChangeEvent<HTMLSelectElement>,
                            ) =>
                              setCustomSplit(
                                e.target.value as
                                  | "fullbody"
                                  | "upper_lower"
                                  | "ppl",
                              )
                            }
                            className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 border"
                          >
                            <option value="fullbody">Full-body</option>
                            <option value="upper_lower">Upper/Lower</option>
                            <option value="ppl">Push/Pull/Legs</option>
                          </select>
                          <label className="text-sm">Días:</label>
                          <select
                            value={customDays}
                            onChange={(e) =>
                              setCustomDays(Number(e.target.value))
                            }
                            className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 border"
                          >
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                            <option value={5}>5</option>
                            <option value={6}>6</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm">Enfoque:</label>
                          <select
                            value={customEmphasis}
                            onChange={(
                              e: React.ChangeEvent<HTMLSelectElement>,
                            ) =>
                              setCustomEmphasis(
                                e.target.value as
                                  | "fuerza"
                                  | "hipertrofia"
                                  | "resistencia",
                              )
                            }
                            className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 border"
                          >
                            <option value="fuerza">Fuerza</option>
                            <option value="hipertrofia">Hipertrofia</option>
                            <option value="resistencia">Resistencia</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setModalOpen(false);
                      setModalSelection(null);
                      setModalInput("");
                      setModalAction(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      if (modalAction === "search") {
                        const q = modalInput?.trim();
                        if (q) {
                          performSearch(q);
                        } else {
                          const sel = modalSelection;
                          if (!sel) {
                            toast.info(
                              "Selecciona una opción o escribe para buscar",
                            );
                            return;
                          }
                          const ex = filteredExercises[sel - 1];
                          if (ex) {
                            addAssistantMessage(
                              `💪 **${ex.name}**\n\n${ex.description || "Sin descripción"}\n\n🎯 Grupo: ${ex.muscleGroup}`,
                            );
                          }
                        }
                      }
                      if (modalAction === "suggest") {
                        const sel = modalSelection;
                        if (!sel) {
                          toast.info("Selecciona una opción");
                          return;
                        }
                        if (sel === 1) performSuggestRoutine("fullbody");
                        if (sel === 2) performSuggestRoutine("upper_lower");
                        if (sel === 3) performSuggestRoutine("ppl");
                        if (sel === 4) performSuggestRoutine("fuerza");
                        if (sel === 5) performSuggestRoutine("hipertrofia");
                        if (sel === 6) performSuggestRoutine("resistencia");
                        if (sel === 7)
                          performCustomSuggest(
                            customSplit,
                            customDays,
                            customEmphasis,
                          );
                      }
                      setModalOpen(false);
                      setModalInput("");
                      setModalSelection(null);
                      setModalAction(null);
                    }}
                    disabled={
                      modalAction === "search"
                        ? modalSelection === null && !modalInput.trim()
                        : modalSelection === null
                    }
                    className="min-h-11 rounded-lg bg-emerald-700 px-4 py-2 text-white transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600 dark:bg-emerald-300 dark:text-gray-950 dark:hover:bg-emerald-200 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
                  >
                    Aceptar
                  </button>
                </div>
              </div>
            </Modal>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-800">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === "user"
                        ? "bg-emerald-700 dark:bg-emerald-300"
                        : "bg-emerald-100 dark:bg-emerald-900/60"
                    }`}
                  >
                    {message.role === "user" ? (
                      <span className="text-white text-xs font-bold">Tú</span>
                    ) : (
                      <Sparkles aria-hidden="true" className="h-4 w-4 text-emerald-800 dark:text-emerald-200" />
                    )}
                  </div>

                  {/* Message */}
                  <div
                    className={`flex-1 rounded-2xl p-3 text-sm ${
                      message.role === "user"
                        ? "bg-emerald-700 text-white dark:bg-emerald-300 dark:text-gray-950"
                        : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed text-xs">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/60">
                    <Sparkles aria-hidden="true" className="h-4 w-4 text-emerald-800 dark:text-emerald-200" />
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-2xl p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  aria-label="Escribe tu pregunta"
                  placeholder="Escribe tu pregunta..."
                  className="min-h-11 flex-1 rounded-xl border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-emerald-300"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  className="min-h-11 bg-emerald-700 px-3 py-2 text-white hover:bg-emerald-800 focus-visible:ring-emerald-600 dark:bg-emerald-300 dark:text-gray-950 dark:hover:bg-emerald-200 dark:focus-visible:ring-emerald-300"
                  size="sm"
                  aria-label="Enviar mensaje"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

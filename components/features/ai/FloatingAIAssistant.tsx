"use client";

import React, { useState, useRef, useEffect } from "react";
import { WorkoutSession } from "@/types";
import { useGym } from "@/context/GymContext";
import { Button } from "@/components/ui/Button";
import {
  Bot,
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
import { getTrainerReply, TrainerLevel } from "@/lib/ai/trainerPersona";
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
        className={`fixed ${isInWorkout ? 'bottom-[120px]' : 'bottom-[176px]'} right-4 sm:right-6 z-40 p-4 bg-linear-to-br from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white rounded-full shadow-2xl shadow-blue-700/40 transition-all duration-300 hover:scale-110 group`}
        aria-label="Abrir asistente IA"
      >
        <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
      </button>
    );
  }

  // Widget del chat
  return (
    <div
      className={`fixed z-40 transition-all duration-300 ${
        isMinimized
          ? `${isInWorkout ? 'bottom-[120px]' : 'bottom-[176px]'} right-4 sm:right-6 w-80`
          : `${isInWorkout ? 'bottom-[120px]' : 'bottom-[176px]'} right-4 sm:right-6 w-96 h-[600px] max-h-[70vh] sm:max-h-[600px]`
      }`}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold">Asistente IA</h3>
              <p className="text-white/80 text-xs">Siempre disponible</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTrainerMode(!trainerMode)}
              className={`p-2 rounded-lg transition-colors ${trainerMode ? "bg-white/20" : "hover:bg-white/20"}`}
              aria-pressed={trainerMode}
              aria-label="Modo entrenador"
            >
              <span className="text-white text-xs">
                {trainerMode ? "Entrenador" : "Entrenador"}
              </span>
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
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
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
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
                          className={`text-left px-3 py-2 rounded-lg border ${modalSelection === idx + 1 ? "border-purple-500 bg-purple-50 dark:bg-gray-800" : "border-gray-200 dark:border-gray-700"}`}
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
                        className={`px-3 py-2 rounded-lg border ${modalSelection === 1 ? "border-purple-500 bg-purple-50 dark:bg-gray-800" : "border-gray-200 dark:border-gray-700"}`}
                      >
                        1. Full-body
                      </button>
                      <button
                        onClick={() => setModalSelection(2)}
                        className={`px-3 py-2 rounded-lg border ${modalSelection === 2 ? "border-purple-500 bg-purple-50 dark:bg-gray-800" : "border-gray-200 dark:border-gray-700"}`}
                      >
                        2. Upper/Lower
                      </button>
                      <button
                        onClick={() => setModalSelection(3)}
                        className={`px-3 py-2 rounded-lg border ${modalSelection === 3 ? "border-purple-500 bg-purple-50 dark:bg-gray-800" : "border-gray-200 dark:border-gray-700"}`}
                      >
                        3. Push/Pull/Legs
                      </button>
                      <button
                        onClick={() => setModalSelection(4)}
                        className={`px-3 py-2 rounded-lg border ${modalSelection === 4 ? "border-purple-500 bg-purple-50 dark:bg-gray-800" : "border-gray-200 dark:border-gray-700"}`}
                      >
                        4. Fuerza
                      </button>
                      <button
                        onClick={() => setModalSelection(5)}
                        className={`px-3 py-2 rounded-lg border ${modalSelection === 5 ? "border-purple-500 bg-purple-50 dark:bg-gray-800" : "border-gray-200 dark:border-gray-700"}`}
                      >
                        5. Hipertrofia
                      </button>
                      <button
                        onClick={() => setModalSelection(6)}
                        className={`px-3 py-2 rounded-lg border ${modalSelection === 6 ? "border-purple-500 bg-purple-50 dark:bg-gray-800" : "border-gray-200 dark:border-gray-700"}`}
                      >
                        6. Resistencia
                      </button>
                      <button
                        onClick={() => setModalSelection(7)}
                        className={`col-span-2 px-3 py-2 rounded-lg border ${modalSelection === 7 ? "border-purple-500 bg-purple-50 dark:bg-gray-800" : "border-gray-200 dark:border-gray-700"}`}
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
                    className={`px-4 py-2 rounded-lg text-white ${modalAction === "search" ? (modalSelection === null && !modalInput.trim() ? "bg-gray-400" : "bg-linear-to-r from-purple-600 to-blue-600") : modalSelection === null ? "bg-gray-400" : "bg-linear-to-r from-purple-600 to-blue-600"}`}
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
                        ? "bg-linear-to-br from-blue-600 to-cyan-600"
                        : "bg-linear-to-br from-purple-600 to-blue-600"
                    }`}
                  >
                    {message.role === "user" ? (
                      <span className="text-white text-xs font-bold">Tú</span>
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Message */}
                  <div
                    className={`flex-1 rounded-2xl p-3 text-sm ${
                      message.role === "user"
                        ? "bg-linear-to-br from-blue-600 to-cyan-600 text-white"
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
                  <div className="w-8 h-8 bg-linear-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
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
                  placeholder="Escribe tu pregunta..."
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-gray-100"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  className="px-3 py-2 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  size="sm"
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

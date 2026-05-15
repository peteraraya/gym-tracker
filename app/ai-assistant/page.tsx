'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useGym } from '@/context/GymContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/shared';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Send, Bot, User, Sparkles, Dumbbell, TrendingUp, AlertCircle } from '@/components/icons/lucide';
import { EXERCISE_DATABASE } from '@/data/exercises';
import { PageHeader, PageLayout, PageContent } from '@/layouts';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export default function AIAssistantPage() {
  const { sessions, routines } = useGym();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! 👋 Soy tu asistente de entrenamiento con IA. Puedo ayudarte con:\n\n• Preguntas sobre ejercicios y técnica\n• Sugerencias personalizadas basadas en tu historial\n• Análisis de tu progreso\n• Recomendaciones de rutinas\n• Consejos de nutrición y recuperación\n\n¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
      suggestions: [
        '¿Cómo mejorar mi press de banca?',
        'Analiza mi progreso reciente',
        '¿Qué ejercicios para ganar masa muscular?',
        'Sugiere una rutina para principiantes'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Función para generar respuestas basadas en el contexto del usuario
  const generateResponse = async (userMessage: string): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase();

    // Análisis de progreso
    if (lowerMessage.includes('progreso') || lowerMessage.includes('análisis') || lowerMessage.includes('analiza')) {
      const recentSessions = sessions.slice(-5);
      if (recentSessions.length === 0) {
        return '📊 Aún no tienes sesiones registradas. ¡Empieza a entrenar para que pueda analizar tu progreso!';
      }

      const totalSessions = sessions.length;
      const totalExercises = recentSessions.reduce((sum, s) => sum + s.exercises.length, 0);
      const avgDuration = recentSessions.reduce((sum, s) => sum + (s.totalDuration || 0), 0) / recentSessions.length;

      return `📊 **Análisis de tu progreso:**\n\n✅ Total de sesiones: ${totalSessions}\n⏱️ Duración promedio: ${Math.floor(avgDuration / 60)} minutos\n💪 Ejercicios en últimas 5 sesiones: ${totalExercises}\n\n**Observaciones:**\n• ${totalSessions > 10 ? '¡Excelente consistencia!' : 'Sigue así, la consistencia es clave'}\n• ${avgDuration > 3600 ? 'Tus sesiones son largas, considera dividirlas' : 'Duración óptima de entrenamiento'}\n\n¿Quieres que analice algún ejercicio específico?`;
    }

    // Preguntas sobre ejercicios específicos
    const exerciseMatch = EXERCISE_DATABASE.find(ex => 
      lowerMessage.includes(ex.name.toLowerCase())
    );

    if (exerciseMatch) {
      return `💪 **${exerciseMatch.name}**\n\n📝 **Descripción:**\n${exerciseMatch.description || 'No disponible'}\n\n🎯 **Grupo muscular:**\n${exerciseMatch.muscleGroup || 'No especificado'}\n\n⚙️ **Equipamiento:**\n${exerciseMatch.equipment || 'No especificado'}\n\n💡 **Consejos de técnica:**\n${exerciseMatch.technique?.map((t, i) => `${i + 1}. ${t}`).join('\n') || 'Mantén una buena forma y controla el movimiento'}\n\n${exerciseMatch.recommendedSets ? `📊 Series recomendadas: ${exerciseMatch.recommendedSets}` : ''}\n${exerciseMatch.recommendedReps ? `🔢 Repeticiones: ${exerciseMatch.recommendedReps}` : ''}\n${exerciseMatch.restTime ? `⏱️ Descanso: ${exerciseMatch.restTime}` : ''}`;
    }

    // Sugerencias de rutinas
    if (lowerMessage.includes('rutina') || lowerMessage.includes('programa')) {
      if (lowerMessage.includes('principiante')) {
        return `🌱 **Rutina para Principiantes (3 días/semana):**\n\n**Día 1 - Cuerpo Completo:**\n• Sentadillas: 3x10\n• Press de banca: 3x10\n• Remo con barra: 3x10\n• Press militar: 3x8\n• Plancha: 3x30s\n\n**Día 2 - Descanso activo**\n\n**Día 3 - Cuerpo Completo:**\n• Peso muerto: 3x8\n• Fondos: 3x10\n• Dominadas asistidas: 3x8\n• Curl de bíceps: 3x12\n• Extensiones de tríceps: 3x12\n\n💡 **Consejos:**\n• Empieza con pesos ligeros\n• Enfócate en la técnica\n• Descansa 48h entre sesiones\n• Aumenta peso gradualmente`;
      }

      return `🏋️ **Tipos de rutinas disponibles:**\n\n1. **Full Body** (3 días/semana)\n   Ideal para principiantes\n\n2. **Push/Pull/Legs** (6 días/semana)\n   Para intermedios/avanzados\n\n3. **Upper/Lower** (4 días/semana)\n   Balance entre volumen y recuperación\n\n4. **Bro Split** (5 días/semana)\n   Un grupo muscular por día\n\n¿Cuál te interesa? Puedo darte más detalles.`;
    }

    // Preguntas sobre técnica
    if (lowerMessage.includes('técnica') || lowerMessage.includes('forma') || lowerMessage.includes('cómo hacer')) {
      return `🎯 **Principios de buena técnica:**\n\n1. **Control del movimiento**\n   • Fase concéntrica: 1-2 segundos\n   • Fase excéntrica: 2-3 segundos\n   • Sin rebotes ni impulso\n\n2. **Rango de movimiento completo**\n   • Estira completamente el músculo\n   • Contrae al máximo en el pico\n\n3. **Respiración correcta**\n   • Exhala en el esfuerzo\n   • Inhala en la fase fácil\n\n4. **Postura y alineación**\n   • Core activado\n   • Columna neutral\n   • Articulaciones alineadas\n\n¿Sobre qué ejercicio específico quieres saber?`;
    }

    // Nutrición
    if (lowerMessage.includes('nutrición') || lowerMessage.includes('dieta') || lowerMessage.includes('proteína')) {
      return `🍽️ **Guía básica de nutrición:**\n\n**Proteína:**\n• 1.6-2.2g por kg de peso corporal\n• Distribuida en 4-5 comidas\n• Fuentes: pollo, pescado, huevos, legumbres\n\n**Carbohidratos:**\n• Pre-entreno: carbos complejos (avena, arroz)\n• Post-entreno: carbos simples + proteína\n\n**Grasas saludables:**\n• Aguacate, frutos secos, aceite de oliva\n• 20-30% de calorías totales\n\n**Hidratación:**\n• 3-4 litros de agua al día\n• Más durante entrenamiento\n\n💡 La nutrición es 70% del éxito en fitness`;
    }

    // Recuperación
    if (lowerMessage.includes('recuperación') || lowerMessage.includes('descanso') || lowerMessage.includes('dolor')) {
      return `😴 **Guía de recuperación:**\n\n**Sueño:**\n• 7-9 horas por noche\n• Fundamental para crecimiento muscular\n\n**Descanso activo:**\n• Caminar, yoga, estiramientos\n• Mejora circulación y recuperación\n\n**Nutrición post-entreno:**\n• Proteína + carbohidratos en 30-60 min\n• Ayuda a reparar músculo\n\n**Manejo del dolor:**\n• DOMS normal: 24-72h después\n• Dolor agudo: detén y consulta médico\n• Foam rolling y estiramientos ayudan\n\n⚠️ El descanso es cuando creces, no en el gym`;
    }

    // Respuesta por defecto
    return `🤔 Interesante pregunta. Aunque soy un asistente básico, puedo ayudarte con:\n\n• Información sobre ejercicios específicos\n• Análisis de tu progreso\n• Sugerencias de rutinas\n• Consejos de técnica\n• Guías de nutrición y recuperación\n\n¿Podrías reformular tu pregunta o elegir uno de estos temas?`;
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000));

    const responseContent = await generateResponse(userMessage.content);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: responseContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <ProtectedRoute>
      <PageLayout>
        <PageHeader
          title="Asistente IA"
          subtitle="Tu entrenador personal inteligente"
          icon={<Sparkles className="w-7 h-7 text-white" />}
          gradient="from-purple-700 via-indigo-700 to-blue-800"
        >
          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-3 mt-4">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 shadow-md">
              <div className="flex items-center gap-3">
                <Dumbbell className="w-6 h-6 text-white" />
                <div>
                  <p className="text-xl font-bold text-white">
                    {EXERCISE_DATABASE.length}
                  </p>
                  <p className="text-xs text-white/80">
                    Ejercicios en base de datos
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 shadow-md">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-white" />
                <div>
                  <p className="text-xl font-bold text-white">
                    {sessions.length}
                  </p>
                  <p className="text-xs text-white/80">
                    Sesiones registradas
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 shadow-md">
              <div className="flex items-center gap-3">
                <Bot className="w-6 h-6 text-white" />
                <div>
                  <p className="text-xl font-bold text-white">
                    24/7
                  </p>
                  <p className="text-xs text-white/80">
                    Disponible siempre
                  </p>
                </div>
              </div>
            </div>
          </div>
        </PageHeader>

        <PageContent maxWidth="4xl">

          {/* Chat Container */}
          <Card className="shadow-2xl">
            <CardContent className="p-0">
              {/* Messages */}
              <div className="h-[500px] overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user'
                          ? 'bg-linear-to-br from-blue-600 to-cyan-600'
                          : 'bg-linear-to-br from-purple-600 to-pink-600'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <Bot className="w-5 h-5 text-white" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div
                      className={`flex-1 max-w-[80%] ${
                        message.role === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`rounded-2xl p-3 ${
                          message.role === 'user'
                            ? 'bg-linear-to-br from-blue-600 to-cyan-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </p>
                      </div>

                      {/* Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400 px-2">
                            Sugerencias:
                          </p>
                          {message.suggestions.map((suggestion, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="block w-full text-left px-3 py-2 text-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-2">
                        {message.timestamp.toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 items-center">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-linear-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 flex items-center gap-3">
                      <LoadingSpinner size="sm" color="gray" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Escribiendo...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe tu pregunta..."
                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-gray-100"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="px-5 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>

                <div className="mt-3 flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    Este es un asistente básico basado en reglas. Para análisis avanzado con IA real, considera integrar OpenAI o Claude API.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </PageContent>
      </PageLayout>
    </ProtectedRoute>
  );
}

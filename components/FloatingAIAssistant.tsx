'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useGym } from '@/context/GymContext';
import { Button } from '@/components/ui/Button';
import { Bot, X, Send, Sparkles, Minimize2, Maximize2 } from '@/components/icons/lucide';
import { EXERCISE_DATABASE } from '@/data/exercises';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function FloatingAIAssistant() {
  const { sessions } = useGym();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! 👋 Soy tu asistente de entrenamiento. ¿En qué puedo ayudarte?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const generateResponse = async (userMessage: string): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase();

    // Análisis de progreso
    if (lowerMessage.includes('progreso') || lowerMessage.includes('análisis')) {
      const recentSessions = sessions.slice(-5);
      if (recentSessions.length === 0) {
        return '📊 Aún no tienes sesiones registradas. ¡Empieza a entrenar!';
      }

      const totalSessions = sessions.length;
      const avgDuration = recentSessions.reduce((sum, s) => sum + (s.totalDuration || 0), 0) / recentSessions.length;

      return `📊 **Análisis rápido:**\n\n✅ Sesiones: ${totalSessions}\n⏱️ Duración promedio: ${Math.floor(avgDuration / 60)} min\n\n${totalSessions > 10 ? '¡Excelente consistencia!' : 'Sigue así 💪'}`;
    }

    // Preguntas sobre ejercicios
    const exerciseMatch = EXERCISE_DATABASE.find(ex => 
      lowerMessage.includes(ex.name.toLowerCase())
    );

    if (exerciseMatch) {
      return `💪 **${exerciseMatch.name}**\n\n${exerciseMatch.description || 'Ejercicio efectivo'}\n\n🎯 Grupo: ${exerciseMatch.muscleGroup}\n⚙️ Equipo: ${exerciseMatch.equipment || 'Variado'}\n\n${exerciseMatch.recommendedSets ? `📊 ${exerciseMatch.recommendedSets}` : ''}\n${exerciseMatch.recommendedReps ? `🔢 ${exerciseMatch.recommendedReps}` : ''}`;
    }

    // Técnica
    if (lowerMessage.includes('técnica') || lowerMessage.includes('forma')) {
      return `🎯 **Principios clave:**\n\n1. Control del movimiento\n2. Rango completo\n3. Respiración correcta\n4. Postura alineada\n\n¿Sobre qué ejercicio?`;
    }

    // Nutrición
    if (lowerMessage.includes('nutrición') || lowerMessage.includes('proteína')) {
      return `🍽️ **Nutrición básica:**\n\n• Proteína: 1.6-2.2g/kg\n• Carbos pre-entreno\n• Hidratación: 3-4L/día\n\n💡 La nutrición es 70% del éxito`;
    }

    // Respuesta por defecto
    return `Puedo ayudarte con:\n\n• Análisis de progreso\n• Info de ejercicios\n• Técnica y forma\n• Nutrición básica\n\n¿Qué necesitas?`;
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

    await new Promise(resolve => setTimeout(resolve, 800));

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Botón flotante
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110 group"
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
      className={`fixed z-50 transition-all duration-300 ${
        isMinimized
          ? 'bottom-6 right-6 w-80'
          : 'bottom-6 right-6 w-96 h-[600px]'
      }`}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between">
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
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label={isMinimized ? 'Maximizar' : 'Minimizar'}
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
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-800">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-cyan-600'
                        : 'bg-gradient-to-br from-purple-600 to-pink-600'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <span className="text-white text-xs font-bold">Tú</span>
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Message */}
                  <div
                    className={`flex-1 rounded-2xl p-3 text-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
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
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
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
                  className="px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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

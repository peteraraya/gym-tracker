/**
 * AI Assistant Integration Layer
 * 
 * Este archivo proporciona la estructura para integrar APIs de IA reales
 * como OpenAI GPT-4, Anthropic Claude, o modelos locales con Ollama.
 * 
 * NOTA: Actualmente el asistente usa respuestas basadas en reglas.
 * Para habilitar IA real, descomenta y configura una de las opciones abajo.
 */

import type { WorkoutSession, Routine, UserProfile } from '@/types';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface UserContext {
  sessions: WorkoutSession[];
  routines: Routine[];
  profile?: UserProfile;
}

/**
 * Genera el contexto del sistema basado en los datos del usuario
 */
export function generateSystemPrompt(context: UserContext): string {
  const { sessions, routines, profile } = context;
  
  const totalSessions = sessions.length;
  const recentSessions = sessions.slice(-5);
  const totalExercises = recentSessions.reduce((sum, s) => sum + s.exercises.length, 0);
  
  // Ejercicios más frecuentes
  const exerciseFrequency: { [key: string]: number } = {};
  sessions.forEach(session => {
    session.exercises.forEach(ex => {
      exerciseFrequency[ex.exerciseName || ''] = (exerciseFrequency[ex.exerciseName || ''] || 0) + 1;
    });
  });
  
  const topExercises = Object.entries(exerciseFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);

  return `Eres un entrenador personal experto, motivador y amigable especializado en fitness y nutrición.

CONTEXTO DEL USUARIO:
- Sesiones totales registradas: ${totalSessions}
- Ejercicios en últimas 5 sesiones: ${totalExercises}
- Ejercicios más frecuentes: ${topExercises.join(', ') || 'Ninguno aún'}
- Rutinas creadas: ${routines.length}
${profile ? `- Nivel de fitness: ${profile.fitnessLevel || 'No especificado'}` : ''}
${profile ? `- Objetivo: ${profile.fitnessGoal || 'No especificado'}` : ''}
${profile ? `- Días disponibles por semana: ${profile.weeklyWorkouts || 'No especificado'}` : ''}

INSTRUCCIONES:
1. Proporciona respuestas personalizadas basadas en el historial del usuario
2. Sé motivador pero realista
3. Usa ejemplos concretos y prácticos
4. Responde siempre en español
5. Si no tienes información suficiente, pregunta antes de asumir
6. Enfócate en seguridad y técnica correcta
7. Adapta las recomendaciones al nivel del usuario

FORMATO DE RESPUESTAS:
- Usa emojis relevantes para hacer las respuestas más amigables
- Estructura la información con bullets o números cuando sea apropiado
- Sé conciso pero completo
- Incluye consejos prácticos accionables`;
}

/**
 * OPCIÓN 1: OpenAI GPT-4
 * 
 * Instalación: npm install openai
 * Configuración: Agregar OPENAI_API_KEY en .env.local
 */
export async function generateOpenAIResponse(
  messages: AIMessage[],
  context: UserContext
): Promise<string> {
  // Descomenta para usar OpenAI
  /*
  const OpenAI = require('openai');
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const systemPrompt = generateSystemPrompt(context);

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ],
    temperature: 0.7,
    max_tokens: 800,
    presence_penalty: 0.1,
    frequency_penalty: 0.1
  });

  return response.choices[0].message.content || 'Lo siento, no pude generar una respuesta.';
  */
  
  throw new Error('OpenAI integration not configured. Add OPENAI_API_KEY to .env.local');
}

/**
 * OPCIÓN 2: Anthropic Claude
 * 
 * Instalación: npm install @anthropic-ai/sdk
 * Configuración: Agregar ANTHROPIC_API_KEY en .env.local
 */
export async function generateClaudeResponse(
  messages: AIMessage[],
  context: UserContext
): Promise<string> {
  // Descomenta para usar Claude
  /*
  const Anthropic = require('@anthropic-ai/sdk');
  
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  const systemPrompt = generateSystemPrompt(context);

  const response = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map(m => ({
      role: m.role === 'system' ? 'user' : m.role,
      content: m.content
    }))
  });

  return response.content[0].text;
  */
  
  throw new Error('Claude integration not configured. Add ANTHROPIC_API_KEY to .env.local');
}

/**
 * OPCIÓN 3: Ollama (Local, Gratis)
 * 
 * Instalación: 
 * 1. Instalar Ollama: https://ollama.ai
 * 2. Descargar modelo: ollama pull llama2
 * 3. npm install ollama
 */
export async function generateOllamaResponse(
  messages: AIMessage[],
  context: UserContext
): Promise<string> {
  // Descomenta para usar Ollama
  /*
  const ollama = require('ollama');
  
  const systemPrompt = generateSystemPrompt(context);
  
  const fullMessages = [
    { role: 'system', content: systemPrompt },
    ...messages
  ];

  const response = await ollama.chat({
    model: 'llama2',
    messages: fullMessages,
    stream: false
  });

  return response.message.content;
  */
  
  throw new Error('Ollama integration not configured. Install Ollama and run: ollama pull llama2');
}

/**
 * OPCIÓN 4: Google Gemini
 * 
 * Instalación: npm install @google/generative-ai
 * Configuración: Agregar GOOGLE_API_KEY en .env.local
 */
export async function generateGeminiResponse(
  messages: AIMessage[],
  context: UserContext
): Promise<string> {
  // Descomenta para usar Gemini
  /*
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const systemPrompt = generateSystemPrompt(context);
  
  // Gemini no tiene system messages, así que lo incluimos en el primer mensaje
  const prompt = `${systemPrompt}\n\nUsuario: ${messages[messages.length - 1].content}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  
  return response.text();
  */
  
  throw new Error('Gemini integration not configured. Add GOOGLE_API_KEY to .env.local');
}

/**
 * Función principal que selecciona el proveedor de IA
 * 
 * Para habilitar, descomenta el proveedor deseado y configura las API keys
 */
export async function generateAIResponse(
  userMessage: string,
  conversationHistory: AIMessage[],
  context: UserContext
): Promise<string> {
  const messages: AIMessage[] = [
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ];

  // Selecciona el proveedor (descomenta el que quieras usar)
  
  // return await generateOpenAIResponse(messages, context);
  // return await generateClaudeResponse(messages, context);
  // return await generateOllamaResponse(messages, context);
  // return await generateGeminiResponse(messages, context);
  
  throw new Error('No AI provider configured. See lib/ai/assistant.ts for setup instructions.');
}

/**
 * Ejemplo de uso en un API route:
 * 
 * // app/api/ai-chat/route.ts
 * import { generateAIResponse } from '@/lib/ai/assistant';
 * 
 * export async function POST(request: Request) {
 *   const { message, history, context } = await request.json();
 *   
 *   try {
 *     const response = await generateAIResponse(message, history, context);
 *     return Response.json({ response });
 *   } catch (error) {
 *     return Response.json({ error: error.message }, { status: 500 });
 *   }
 * }
 */

/**
 * Estimación de costos por proveedor (aproximado):
 * 
 * OpenAI GPT-4:
 * - Input: $0.03 / 1K tokens
 * - Output: $0.06 / 1K tokens
 * - Conversación típica: ~$0.10-0.30
 * 
 * Anthropic Claude:
 * - Input: $0.015 / 1K tokens
 * - Output: $0.075 / 1K tokens
 * - Similar a GPT-4
 * 
 * Google Gemini:
 * - Tier gratuito: 60 requests/min
 * - Pro: $0.00025 / 1K chars
 * - Más económico
 * 
 * Ollama (Local):
 * - Completamente gratis
 * - Requiere GPU/CPU potente
 * - Privacidad total
 */

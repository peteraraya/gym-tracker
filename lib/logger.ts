/**
 * Sistema de logging condicional para desarrollo/producción
 */

const isDevelopment = process.env.NODE_ENV === "development";
const isTest = process.env.NODE_ENV === "test";

type LogArgs = unknown[];

export const logger = {
  log: (...args: LogArgs) => {
    if (isDevelopment || isTest) {
      console.log("[LOG]", ...args);
    }
  },

  info: (...args: LogArgs) => {
    if (isDevelopment || isTest) {
      console.info("[INFO]", ...args);
    }
  },

  warn: (...args: LogArgs) => {
    if (isDevelopment || isTest) {
      console.warn("[WARN]", ...args);
    }
  },

  error: (...args: LogArgs) => {
    // Siempre logear errores, incluso en producción
    console.error("[ERROR]", ...args);

    // En producción, podrías enviar a un servicio como Sentry
    if (!isDevelopment && !isTest) {
      // TODO: Integrar con servicio de error tracking
      // Sentry.captureException(args[0]);
    }
  },

  debug: (...args: LogArgs) => {
    if (isDevelopment) {
      console.debug("[DEBUG]", ...args);
    }
  },

  group: (label: string) => {
    if (isDevelopment) {
      console.group(label);
    }
  },

  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd();
    }
  },

  table: (data: Record<string, unknown> | unknown[]) => {
    if (isDevelopment) {
      console.table(data);
    }
  },

  time: (label: string) => {
    if (isDevelopment) {
      console.time(label);
    }
  },

  timeEnd: (label: string) => {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  },
};

// Export individual functions for convenience
export const {
  log,
  info,
  warn,
  error,
  debug,
  group,
  groupEnd,
  table,
  time,
  timeEnd,
} = logger;

export default logger;

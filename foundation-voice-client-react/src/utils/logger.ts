/**
 * Structured logging utility for the Pipecat WebSocket client
 * Provides consistent log formatting and categorization
 */

// Define log levels
export type LogLevel = "debug" | "info" | "warn" | "error";

// Define log categories
export type LogCategory =
  | "transport"
  | "audio"
  | "connection"
  | "ui"
  | "conversation"
  | "event"
  | "general";

// Configure which log levels are enabled
const LOG_LEVEL_ENABLED = {
  debug: process.env.NODE_ENV !== "production",
  info: true,
  warn: true,
  error: true,
};

// Configure which categories are enabled
const CATEGORY_ENABLED: Record<LogCategory, boolean> = {
  transport: true,
  audio: true,
  connection: true,
  ui: true,
  conversation: true,
  event: true,
  general: true,
};

// Add colors for console output (works in most browsers)
const LOG_LEVEL_STYLES: Record<LogLevel, string> = {
  debug: "color: #6b7280", // gray
  info: "color: #3b82f6", // blue
  warn: "color: #f59e0b", // amber
  error: "color: #ef4444", // red
};

// Add colors for categories
const CATEGORY_STYLES: Record<LogCategory, string> = {
  transport: "color: #8b5cf6", // purple
  audio: "color: #10b981", // green
  connection: "color: #f59e0b", // amber
  ui: "color: #3b82f6", // blue
  conversation: "color: #ec4899", // pink
  event: "color: #6366f1", // indigo
  general: "color: #6b7280", // gray
};

/**
 * Creates a formatted log message with timestamp, category, and level
 */
function formatLogMessage(
  level: LogLevel,
  category: LogCategory,
  message: string,
  data?: any,
): [string, string, string, any?] {
  const timestamp = new Date().toISOString().substring(11, 23); // HH:MM:SS.mmm format
  const formatStr = `%c[${timestamp}] [${category.toUpperCase()}] %c${message}`;
  const categoryStyle = CATEGORY_STYLES[category];
  const levelStyle = LOG_LEVEL_STYLES[level];

  return [formatStr, categoryStyle, levelStyle, data];
}

/**
 * Determines if a log should be displayed based on level and category
 */
function shouldLog(level: LogLevel, category: LogCategory): boolean {
  return LOG_LEVEL_ENABLED[level] && CATEGORY_ENABLED[category];
}

/**
 * Logger factory that creates a logger for a specific category
 */
export function createLogger(category: LogCategory) {
  return {
    debug(message: string, data?: any): void {
      if (shouldLog("debug", category)) {
        console.debug(...formatLogMessage("debug", category, message, data));
      }
    },

    info(message: string, data?: any): void {
      if (shouldLog("info", category)) {
        console.info(...formatLogMessage("info", category, message, data));
      }
    },

    warn(message: string, data?: any): void {
      if (shouldLog("warn", category)) {
        console.warn(...formatLogMessage("warn", category, message, data));
      }
    },

    error(message: string, data?: any): void {
      if (shouldLog("error", category)) {
        console.error(...formatLogMessage("error", category, message, data));
      }
    },
  };
}

// Create default loggers for each category
export const log = {
  transport: createLogger("transport"),
  audio: createLogger("audio"),
  connection: createLogger("connection"),
  ui: createLogger("ui"),
  conversation: createLogger("conversation"),
  event: createLogger("event"),
  general: createLogger("general"),
};

// Enable or disable logging for specific categories
export function configureLogging(
  categories: Partial<Record<LogCategory, boolean>> = {},
  levels: Partial<Record<LogLevel, boolean>> = {},
): void {
  // Update category configuration
  Object.entries(categories).forEach(([category, enabled]) => {
    if (category in CATEGORY_ENABLED) {
      CATEGORY_ENABLED[category as LogCategory] = enabled;
    }
  });

  // Update level configuration
  Object.entries(levels).forEach(([level, enabled]) => {
    if (level in LOG_LEVEL_ENABLED) {
      LOG_LEVEL_ENABLED[level as LogLevel] = enabled;
    }
  });
}

// Helper function to log performance metrics
export function logPerformance(label: string, startTime: number): void {
  const duration = performance.now() - startTime;
  log.general.debug(`Performance [${label}]: ${duration.toFixed(2)}ms`);
}
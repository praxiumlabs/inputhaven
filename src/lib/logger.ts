type LogLevel = "error" | "warn" | "info" | "debug";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context && { context }),
  };

  const json = JSON.stringify(entry);

  switch (level) {
    case "error":
      console.error(json);
      break;
    case "warn":
      console.warn(json);
      break;
    case "debug":
      if (process.env.NODE_ENV === "development") {
        console.log(json);
      }
      break;
    default:
      console.log(json);
  }
}

export const logger = {
  error: (message: string, context?: Record<string, unknown>) => log("error", message, context),
  warn: (message: string, context?: Record<string, unknown>) => log("warn", message, context),
  info: (message: string, context?: Record<string, unknown>) => log("info", message, context),
  debug: (message: string, context?: Record<string, unknown>) => log("debug", message, context),
};

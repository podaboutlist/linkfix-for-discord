import winston, { Logger } from "winston";

import { EnvironmentMode } from "../environment";

let logger: Logger | null = null;

export function initLogger(
  environmentMode: EnvironmentMode,
  namespace: "bot" | "commands",
): void {
  const logLevel = environmentMode === "development" ? "debug" : "info";

  const cliFormat = winston.format.cli();
  const fileFormat = winston.format.combine(
    winston.format.timestamp(),
    // TODO: Add stacktraces or at the minimum, line number on error
    winston.format.printf(({ timestamp, label, level, message }) => {
      return `[${timestamp}] ${namespace}/${label} - ${level}: ${message}`;
    }),
  );

  logger = winston.createLogger({
    level: logLevel,
    transports: [
      new winston.transports.Console({
        level: logLevel,
        format: cliFormat,
      }),
      new winston.transports.File({
        level: logLevel,
        format: fileFormat,
        filename: `logs/${namespace}.combined.log`,
      }),
      new winston.transports.File({
        level: "error",
        format: fileFormat,
        filename: `logs/${namespace}.error.log`,
      }),
    ],
  });
}

export function loggerAvailable(): boolean {
  return logger !== null;
}

export function log(level: string, msg: string, label?: string): void {
  if (!logger) {
    throw new Error("Logger is null! Did you forget to initialize the logger?");
  }

  logger.log(level, msg, {
    label: label ?? "default",
  });
}

export function error(msg: string, label?: string): void {
  log("error", msg, label);
}

export function warn(msg: string, label?: string): void {
  log("warn", msg, label);
}

export function info(msg: string, label?: string): void {
  log("info", msg, label);
}

export function debug(msg: string, label?: string): void {
  log("debug", msg, label);
}

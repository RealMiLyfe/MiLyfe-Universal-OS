/**
 * Structured logging + error capture.
 *
 * Emits single-line JSON to stdout/stderr so log aggregators (Vercel,
 * OpenObserve, Datadog, CloudWatch, etc.) can parse fields directly.
 *
 * Error capture is pluggable via `registerErrorSink` so an APM/error tracker
 * (e.g. Sentry, GlitchTip) can be wired in without this module depending on it.
 * If no sink is registered, errors are still logged as structured JSON.
 *
 * Usage:
 *   log.info('ubi.distribute', { distributed: 42 });
 *   captureError(err, { route: '/api/cron/ubi' });
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogFields = Record<string, unknown>;

type ErrorSink = (error: Error, context?: LogFields) => void;

let errorSink: ErrorSink | null = null;

/**
 * Register an external error sink (e.g. Sentry.captureException).
 * Call once at app startup. Safe to leave unregistered.
 */
export function registerErrorSink(sink: ErrorSink): void {
  errorSink = sink;
}

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function minLevel(): LogLevel {
  const env = (process.env.LOG_LEVEL || '').toLowerCase();
  if (env === 'debug' || env === 'info' || env === 'warn' || env === 'error') {
    return env;
  }
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
}

function emit(level: LogLevel, event: string, fields?: LogFields): void {
  if (LEVEL_WEIGHT[level] < LEVEL_WEIGHT[minLevel()]) return;

  const record = {
    ts: new Date().toISOString(),
    level,
    event,
    ...(fields || {}),
  };

  const line = safeStringify(record);
  if (level === 'error') {
    // eslint-disable-next-line no-console
    console.error(line);
  } else if (level === 'warn') {
    // eslint-disable-next-line no-console
    console.warn(line);
  } else {
    // eslint-disable-next-line no-console
    console.log(line);
  }
}

function safeStringify(obj: unknown): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return JSON.stringify({ ts: new Date().toISOString(), level: 'error', event: 'log.serialize_failed' });
  }
}

export const log = {
  debug: (event: string, fields?: LogFields) => emit('debug', event, fields),
  info: (event: string, fields?: LogFields) => emit('info', event, fields),
  warn: (event: string, fields?: LogFields) => emit('warn', event, fields),
  error: (event: string, fields?: LogFields) => emit('error', event, fields),
};

/**
 * Capture an error: always logs structured JSON, and forwards to the
 * registered sink (if any). Never throws.
 */
export function captureError(error: unknown, context?: LogFields): void {
  const err = error instanceof Error ? error : new Error(String(error));

  emit('error', 'error.captured', {
    ...(context || {}),
    error_name: err.name,
    error_message: err.message,
    stack: err.stack,
  });

  if (errorSink) {
    try {
      errorSink(err, context);
    } catch {
      // A failing sink must never break the request path.
    }
  }
}

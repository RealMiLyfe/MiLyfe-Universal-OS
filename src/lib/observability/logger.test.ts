import { describe, it, expect, vi, afterEach } from 'vitest';
import { log, captureError, registerErrorSink } from './logger';

afterEach(() => {
  vi.restoreAllMocks();
  // Reset any registered sink to a no-op between tests.
  registerErrorSink(() => {});
});

describe('structured logger', () => {
  it('emits single-line JSON with ts, level, and event', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    log.info('test.event', { foo: 'bar' });
    expect(spy).toHaveBeenCalledOnce();
    const parsed = JSON.parse(spy.mock.calls[0][0] as string);
    expect(parsed.level).toBe('info');
    expect(parsed.event).toBe('test.event');
    expect(parsed.foo).toBe('bar');
    expect(typeof parsed.ts).toBe('string');
  });

  it('routes error level to console.error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    log.error('boom', {});
    expect(spy).toHaveBeenCalledOnce();
  });
});

describe('captureError', () => {
  it('logs structured error data and forwards to the registered sink', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const sink = vi.fn();
    registerErrorSink(sink);

    const boom = new Error('kaboom');
    captureError(boom, { route: '/api/x' });

    expect(errSpy).toHaveBeenCalled();
    expect(sink).toHaveBeenCalledOnce();
    expect(sink.mock.calls[0][0]).toBe(boom);
    expect(sink.mock.calls[0][1]).toMatchObject({ route: '/api/x' });
  });

  it('coerces non-Error values into Error without throwing', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const sink = vi.fn();
    registerErrorSink(sink);
    expect(() => captureError('a string failure')).not.toThrow();
    expect(sink.mock.calls[0][0]).toBeInstanceOf(Error);
    expect((sink.mock.calls[0][0] as Error).message).toBe('a string failure');
  });

  it('never throws even if the sink throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    registerErrorSink(() => {
      throw new Error('sink failed');
    });
    expect(() => captureError(new Error('x'))).not.toThrow();
  });
});

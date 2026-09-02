import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isAuthorizedCronRequest } from './cron';

const SECRET = 'test-cron-secret-value';

function req(headers: Record<string, string>): Request {
  return new Request('https://example.com/api/cron/x', { headers });
}

describe('isAuthorizedCronRequest', () => {
  const original = process.env.CRON_SECRET;

  beforeEach(() => {
    process.env.CRON_SECRET = SECRET;
  });

  afterEach(() => {
    if (original === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = original;
  });

  it('accepts a valid Authorization: Bearer <secret>', () => {
    expect(isAuthorizedCronRequest(req({ authorization: `Bearer ${SECRET}` }))).toBe(true);
  });

  it('accepts a valid x-cron-secret header', () => {
    expect(isAuthorizedCronRequest(req({ 'x-cron-secret': SECRET }))).toBe(true);
  });

  it('rejects a wrong bearer token', () => {
    expect(isAuthorizedCronRequest(req({ authorization: 'Bearer nope' }))).toBe(false);
  });

  it('rejects a wrong x-cron-secret', () => {
    expect(isAuthorizedCronRequest(req({ 'x-cron-secret': 'nope' }))).toBe(false);
  });

  it('rejects when no auth headers are present', () => {
    expect(isAuthorizedCronRequest(req({}))).toBe(false);
  });

  it('rejects a malformed authorization header', () => {
    expect(isAuthorizedCronRequest(req({ authorization: SECRET }))).toBe(false);
  });

  it('fails closed when CRON_SECRET is not configured', () => {
    delete process.env.CRON_SECRET;
    expect(isAuthorizedCronRequest(req({ authorization: `Bearer ${SECRET}` }))).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import { activeDevices, emptyRegistry, registerDevice, revokeDevice } from '@/trunk/midevice';

describe('midevice (devices under MiID)', () => {
  it('registers once, revokes with tombstone', () => {
    let r = registerDevice(emptyRegistry(), 'alice', 'd1', 'phone', '2026-01-01T00:00:00Z');
    expect(() => registerDevice(r, 'alice', 'd1', 'phone', '2026-01-02T00:00:00Z')).toThrow('DEVICE_ALREADY_ACTIVE');
    r = revokeDevice(r, 'alice', 'd1', '2026-02-01T00:00:00Z');
    expect(activeDevices(r, 'alice')).toHaveLength(0);
    expect(r.devices[0].revokedAt).toBe('2026-02-01T00:00:00Z');
  });
  it("cannot revoke another owner's device", () => {
    let r = registerDevice(emptyRegistry(), 'alice', 'd1', 'phone', '2026-01-01T00:00:00Z');
    r = revokeDevice(r, 'mallory', 'd1', '2026-02-01T00:00:00Z');
    expect(activeDevices(r, 'alice')).toHaveLength(1);
  });
});

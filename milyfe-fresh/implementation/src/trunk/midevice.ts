// MiDevice — one profile across phone, laptop, and beyond. Registers devices
// under a MiID; recovery and delegation ride on MiID lifecycle, never on a
// branch. Devices hold vault keys; keys never leave the device.
export interface Device {
  id: string;
  owner: string; // MiID
  label: string;
  addedAt: string; // ISO
  revokedAt?: string; // set on revoke — revoked devices stay listed (tombstone)
}

export interface DeviceRegistry {
  devices: Device[];
}

export function emptyRegistry(): DeviceRegistry {
  return { devices: [] };
}

export function registerDevice(reg: DeviceRegistry, owner: string, id: string, label: string, nowIso: string): DeviceRegistry {
  if (reg.devices.some((d) => d.id === id && !d.revokedAt)) throw new Error('DEVICE_ALREADY_ACTIVE');
  return { devices: [...reg.devices, { id, owner, label, addedAt: nowIso }] };
}

export function revokeDevice(reg: DeviceRegistry, owner: string, id: string, nowIso: string): DeviceRegistry {
  return {
    devices: reg.devices.map((d) => (d.id === id && d.owner === owner && !d.revokedAt ? { ...d, revokedAt: nowIso } : d)),
  };
}

export function activeDevices(reg: DeviceRegistry, owner: string): Device[] {
  return reg.devices.filter((d) => d.owner === owner && !d.revokedAt);
}

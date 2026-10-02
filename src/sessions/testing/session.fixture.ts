import type { Session } from '../../../generated/prisma/client.js';

const testDate = new Date('2026-01-01T00:00:00.000Z');

export function createSessionFixture(
  overrides: Partial<Session> = {},
): Session {
  return {
    id: '00000000-0000-4000-8000-000000000001',
    userId: '00000000-0000-4000-8000-000000000002',
    refreshHash: 'refresh-hash',
    revokedAt: null,
    expiresAt: new Date('2099-01-01T00:00:00.000Z'),
    createdAt: testDate,
    updatedAt: testDate,
    ...overrides,
  };
}

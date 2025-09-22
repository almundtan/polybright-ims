import { DateTime } from 'luxon';
import { prisma } from '@/utils/prisma';

export interface SyncPushInput {
  clientId: string;
  lastSyncedAt: string;
  mutations: Array<{
    type: string;
    payload: unknown;
  }>;
}

export const SyncService = {
  async push(orgId: string, deviceId: string, input: SyncPushInput) {
    const serverClock = DateTime.utc();

    await prisma.deviceSyncState.upsert({
      where: { orgId_deviceId: { orgId, deviceId } },
      update: {
        lastSyncedAt: serverClock.toJSDate(),
        serverClock: serverClock.toJSDate()
      },
      create: {
        orgId,
        deviceId,
        lastSyncedAt: serverClock.toJSDate(),
        serverClock: serverClock.toJSDate()
      }
    });

    type AuditLogPayload = Parameters<typeof prisma.auditLog.create>[0]['data']['payload'];

    await prisma.auditLog.create({
      data: {
        orgId,
        entity: 'SyncMutation',
        entityId: deviceId,
        action: 'PUSH',
        payload: input as unknown as AuditLogPayload
      }
    });

    return {
      status: 'accepted',
      serverClock: serverClock.toISO()
    };
  },

  async pull(orgId: string, since: Date) {
    const changes = await prisma.stockLedger.findMany({
      where: {
        orgId,
        createdAt: { gt: since }
      },
      include: {
        product: true,
        warehouse: true
      },
      orderBy: { createdAt: 'asc' },
      take: 200
    });

    const serverClock = DateTime.utc().toISO();

    return {
      serverClock,
      changes
    };
  }
};

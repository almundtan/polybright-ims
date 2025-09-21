import { prisma } from '@/utils/prisma';
import { AuditLogEntry } from '@/types/logs';

export const logAudit = async (orgId: string, entry: AuditLogEntry) => {
  try {
    await prisma.auditLog.create({
      data: {
        orgId,
        entity: entry.entity,
        entityId: entry.entityId,
        action: entry.action,
        payload: entry.payload as object,
        userId: entry.userId
      }
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Audit log failed', error);
    }
  }
};

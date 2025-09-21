import { prisma } from '@/utils/prisma';
import { logAudit } from '@/utils/audit';

export interface WarehouseInput {
  name: string;
  code: string;
  address?: string;
}

export const WarehouseService = {
  async list(orgId: string) {
    return prisma.warehouse.findMany({
      where: { orgId },
      orderBy: { name: 'asc' }
    });
  },

  async create(orgId: string, data: WarehouseInput, userId: string) {
    const warehouse = await prisma.warehouse.create({ data: { orgId, ...data } });
    await logAudit(orgId, {
      entity: 'Warehouse',
      entityId: warehouse.id,
      action: 'CREATE',
      payload: warehouse,
      userId
    });
    return warehouse;
  },

  async update(orgId: string, id: string, data: Partial<WarehouseInput>, userId: string) {
    const warehouse = await prisma.warehouse.update({ where: { id, orgId }, data });
    await logAudit(orgId, {
      entity: 'Warehouse',
      entityId: id,
      action: 'UPDATE',
      payload: data,
      userId
    });
    return warehouse;
  },

  async remove(orgId: string, id: string, userId: string) {
    await prisma.warehouse.delete({ where: { id, orgId } });
    await logAudit(orgId, {
      entity: 'Warehouse',
      entityId: id,
      action: 'DELETE',
      payload: {},
      userId
    });
  }
};

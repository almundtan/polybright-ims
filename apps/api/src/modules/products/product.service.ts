import { prisma } from '@/utils/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { AuditLogEntry } from '@/types/logs';
import { logAudit } from '@/utils/audit';

export interface ProductFilters {
  search?: string;
  limit?: number;
  offset?: number;
}

export interface UpsertProductInput {
  orgId: string;
  name: string;
  sku: string;
  barcode?: string;
  uom: string;
}

export const ProductService = {
  async list(orgId: string, filters: ProductFilters) {
    const where = {
      orgId,
      ...(filters.search
        ? {
            OR: [
              { name: { contains: filters.search, mode: 'insensitive' } },
              { sku: { contains: filters.search, mode: 'insensitive' } },
              { barcode: { contains: filters.search, mode: 'insensitive' } }
            ]
          }
        : {})
    };

    const [items, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        take: filters.limit ?? 20,
        skip: filters.offset ?? 0,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    return { items, total };
  },

  async create(input: UpsertProductInput, userId: string) {
    const product = await prisma.product.create({
      data: input
    });

    await prisma.inventoryBalance.create({
      data: {
        orgId: input.orgId,
        productId: product.id,
        warehouseId: (await prisma.warehouse.findFirst({ where: { orgId: input.orgId } }))?.id ??
          (await prisma.warehouse.create({
            data: { orgId: input.orgId, name: 'Default', code: 'DEFAULT' }
          })).id,
        qty: new Decimal(0)
      }
    }).catch(() => undefined);

    await logAudit(input.orgId, {
      entity: 'Product',
      entityId: product.id,
      action: 'CREATE',
      payload: product,
      userId
    });

    return product;
  },

  async update(id: string, orgId: string, data: Partial<UpsertProductInput>, userId: string) {
    const product = await prisma.product.update({
      where: { id, orgId },
      data
    });

    await logAudit(orgId, {
      entity: 'Product',
      entityId: product.id,
      action: 'UPDATE',
      payload: data,
      userId
    });

    return product;
  },

  async remove(id: string, orgId: string, userId: string) {
    await prisma.product.delete({ where: { id, orgId } });
    await logAudit(orgId, {
      entity: 'Product',
      entityId: id,
      action: 'DELETE',
      payload: {},
      userId
    });
  },

  async byId(id: string, orgId: string) {
    return prisma.product.findFirst({ where: { id, orgId } });
  },

  async byBarcode(orgId: string, barcode: string) {
    return prisma.product.findFirst({ where: { orgId, barcode } });
  }
};

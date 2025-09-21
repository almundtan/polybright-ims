import { prisma } from '@/utils/prisma';

export interface InventoryFilters {
  warehouseId?: string;
  productId?: string;
  limit?: number;
  offset?: number;
}

export const InventoryService = {
  async getBalances(orgId: string, filters: InventoryFilters) {
    const where = {
      orgId,
      ...(filters.warehouseId ? { warehouseId: filters.warehouseId } : {}),
      ...(filters.productId ? { productId: filters.productId } : {})
    };

    const [items, total] = await prisma.$transaction([
      prisma.inventoryBalance.findMany({
        where,
        include: {
          warehouse: true,
          product: true
        },
        take: filters.limit ?? 20,
        skip: filters.offset ?? 0,
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.inventoryBalance.count({ where })
    ]);

    return {
      items,
      total
    };
  }
};

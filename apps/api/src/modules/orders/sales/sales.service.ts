import { prisma } from '@/utils/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export interface SalesOrderItemInput {
  productId: string;
  qty: number;
  unitPricePhp: number;
}

export interface SalesOrderInput {
  customerName: string;
  items: SalesOrderItemInput[];
}

export const SalesOrderService = {
  async list(orgId: string) {
    return prisma.salesOrder.findMany({
      where: { orgId },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
  },

  async create(orgId: string, input: SalesOrderInput) {
    return prisma.salesOrder.create({
      data: {
        orgId,
        customerName: input.customerName,
        status: 'OPEN',
        items: {
          create: input.items.map((item) => ({
            productId: item.productId,
            qty: new Decimal(item.qty),
            unitPrice: new Decimal(item.unitPricePhp)
          }))
        }
      },
      include: { items: true }
    });
  },

  async update(orgId: string, id: string, input: SalesOrderInput) {
    await prisma.salesOrder.update({
      where: { id, orgId },
      data: {
        customerName: input.customerName,
        items: {
          deleteMany: {},
          create: input.items.map((item) => ({
            productId: item.productId,
            qty: new Decimal(item.qty),
            unitPrice: new Decimal(item.unitPricePhp)
          }))
        }
      }
    });

    return prisma.salesOrder.findUnique({ where: { id }, include: { items: true } });
  },

  async fulfill(orgId: string, id: string, warehouseId: string) {
    return prisma.$transaction(async (tx) => {
      const so = await tx.salesOrder.findFirst({
        where: { id, orgId },
        include: { items: true }
      });

      if (!so) {
        throw Object.assign(new Error('SO not found'), { status: 404, name: 'SO_NOT_FOUND' });
      }

      if (so.status === 'FULFILLED' || so.status === 'CLOSED') {
        return so;
      }

      for (const item of so.items) {
        await tx.inventoryBalance.upsert({
          where: {
            orgId_warehouseId_productId: { orgId, warehouseId, productId: item.productId }
          },
          update: {
            qty: { decrement: item.qty }
          },
          create: {
            orgId,
            warehouseId,
            productId: item.productId,
            qty: item.qty.neg()
          }
        });

        await tx.stockLedger.create({
          data: {
            orgId,
            warehouseId,
            productId: item.productId,
            qty: item.qty.neg(),
            type: 'ISSUE',
            refType: 'SO',
            refId: so.id
          }
        });
      }

      return tx.salesOrder.update({
        where: { id },
        data: { status: 'FULFILLED' },
        include: { items: true }
      });
    });
  }
};

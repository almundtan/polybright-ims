import { prisma } from '@/utils/prisma';
import type { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface PurchaseOrderItemInput {
  productId: string;
  qty: number;
  unitPricePhp: number;
}

export interface PurchaseOrderInput {
  supplierName: string;
  items: PurchaseOrderItemInput[];
}

export const PurchaseOrderService = {
  async list(orgId: string) {
    return prisma.purchaseOrder.findMany({
      where: { orgId },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
  },

  async create(orgId: string, userId: string, input: PurchaseOrderInput) {
    return prisma.purchaseOrder.create({
      data: {
        orgId,
        supplierName: input.supplierName,
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

  async update(orgId: string, id: string, input: PurchaseOrderInput) {
    await prisma.purchaseOrder.update({
      where: { id, orgId },
      data: {
        supplierName: input.supplierName,
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

    return prisma.purchaseOrder.findUnique({ where: { id }, include: { items: true } });
  },

  async receive(orgId: string, id: string, warehouseId: string) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const po = await tx.purchaseOrder.findFirst({
        where: { id, orgId },
        include: { items: true }
      });

      if (!po) {
        throw Object.assign(new Error('PO not found'), { status: 404, name: 'PO_NOT_FOUND' });
      }

      if (po.status === 'RECEIVED' || po.status === 'CLOSED') {
        return po;
      }

      for (const item of po.items) {
        await tx.inventoryBalance.upsert({
          where: {
            orgId_warehouseId_productId: { orgId, warehouseId, productId: item.productId }
          },
          update: {
            qty: { increment: item.qty }
          },
          create: {
            orgId,
            warehouseId,
            productId: item.productId,
            qty: item.qty
          }
        });

        await tx.stockLedger.create({
          data: {
            orgId,
            warehouseId,
            productId: item.productId,
            qty: item.qty,
            type: 'RECEIPT',
            refType: 'PO',
            refId: po.id
          }
        });
      }

      return tx.purchaseOrder.update({
        where: { id },
        data: { status: 'RECEIVED' },
        include: { items: true }
      });
    });
  }
};

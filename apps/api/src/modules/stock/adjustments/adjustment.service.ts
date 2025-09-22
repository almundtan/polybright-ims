import { prisma } from '@/utils/prisma';
import type { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { logAudit } from '@/utils/audit';

export interface StockAdjustmentInput {
  warehouseId: string;
  productId: string;
  qty: number;
  reason: string;
}

export const StockAdjustmentService = {
  async create(orgId: string, userId: string, input: StockAdjustmentInput) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const inventory = await tx.inventoryBalance.upsert({
        where: {
          orgId_warehouseId_productId: {
            orgId,
            warehouseId: input.warehouseId,
            productId: input.productId
          }
        },
        update: {
          qty: { increment: new Decimal(input.qty) }
        },
        create: {
          orgId,
          warehouseId: input.warehouseId,
          productId: input.productId,
          qty: new Decimal(input.qty)
        }
      });

      const ledger = await tx.stockLedger.create({
        data: {
          orgId,
          warehouseId: input.warehouseId,
          productId: input.productId,
          qty: new Decimal(input.qty),
          type: input.qty >= 0 ? 'ADJUST' : 'ADJUST',
          refType: 'ADJ',
          refId: inventory.id
        }
      });

      await tx.auditLog.create({
        data: {
          orgId,
          entity: 'InventoryBalance',
          entityId: inventory.id,
          action: 'ADJUST',
          payload: { ...input, ledgerId: ledger.id },
          userId
        }
      });

      return { inventory, ledger };
    });
  }
};

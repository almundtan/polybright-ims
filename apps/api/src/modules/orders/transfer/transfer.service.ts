import { prisma } from '@/utils/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export interface TransferLineInput {
  productId: string;
  qty: number;
}

export interface TransferInput {
  fromWarehouseId: string;
  toWarehouseId: string;
  lines: TransferLineInput[];
}

export const TransferService = {
  async create(orgId: string, input: TransferInput) {
    return prisma.$transaction(async (tx) => {
      const transfer = await tx.transfer.create({
        data: {
          orgId,
          fromWarehouseId: input.fromWarehouseId,
          toWarehouseId: input.toWarehouseId,
          items: {
            create: input.lines.map((line) => ({
              productId: line.productId,
              qty: new Decimal(line.qty)
            }))
          }
        },
        include: { items: true }
      });

      for (const line of transfer.items) {
        await tx.inventoryBalance.upsert({
          where: {
            orgId_warehouseId_productId: {
              orgId,
              warehouseId: transfer.fromWarehouseId,
              productId: line.productId
            }
          },
          update: {
            qty: { decrement: line.qty }
          },
          create: {
            orgId,
            warehouseId: transfer.fromWarehouseId,
            productId: line.productId,
            qty: line.qty.neg()
          }
        });

        await tx.inventoryBalance.upsert({
          where: {
            orgId_warehouseId_productId: {
              orgId,
              warehouseId: transfer.toWarehouseId,
              productId: line.productId
            }
          },
          update: {
            qty: { increment: line.qty }
          },
          create: {
            orgId,
            warehouseId: transfer.toWarehouseId,
            productId: line.productId,
            qty: line.qty
          }
        });

        await tx.stockLedger.createMany({
          data: [
            {
              orgId,
              warehouseId: transfer.fromWarehouseId,
              productId: line.productId,
              qty: line.qty.neg(),
              type: 'TRANSFER_OUT',
              refType: 'TX',
              refId: transfer.id
            },
            {
              orgId,
              warehouseId: transfer.toWarehouseId,
              productId: line.productId,
              qty: line.qty,
              type: 'TRANSFER_IN',
              refType: 'TX',
              refId: transfer.id
            }
          ]
        });
      }

      return transfer;
    });
  }
};

import { prisma } from '@/utils/prisma';
import type { Prisma } from '@prisma/client';
import { DateTime } from 'luxon';

type StockLedgerWithRelations = Prisma.StockLedgerGetPayload<{
  include: { warehouse: true; product: true };
}>;

export interface LedgerFilter {
  from?: string;
  to?: string;
  warehouseId?: string;
  productId?: string;
}

export const ReportService = {
  async ledger(orgId: string, filters: LedgerFilter) {
    const where = {
      orgId,
      createdAt: {
        gte: filters.from ? DateTime.fromISO(filters.from).toJSDate() : undefined,
        lte: filters.to ? DateTime.fromISO(filters.to).toJSDate() : undefined
      },
      warehouseId: filters.warehouseId,
      productId: filters.productId
    };

    const rows: StockLedgerWithRelations[] = await prisma.stockLedger.findMany({
      where,
      include: {
        warehouse: true,
        product: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return rows.map((row) => ({
      id: row.id,
      createdAt: row.createdAt,
      warehouse: row.warehouse.name,
      product: row.product.name,
      qty: row.qty,
      type: row.type,
      refType: row.refType,
      refId: row.refId
    }));
  }
};

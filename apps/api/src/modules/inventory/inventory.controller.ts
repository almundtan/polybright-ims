import { Request, Response } from 'express';
import { InventoryService } from './inventory.service';

export const listInventory = async (req: Request, res: Response) => {
  const { orgId } = req.user!;
  const { warehouseId, productId, limit, offset } = req.query as {
    warehouseId?: string;
    productId?: string;
    limit?: string;
    offset?: string;
  };

  const result = await InventoryService.getBalances(orgId, {
    warehouseId,
    productId,
    limit: limit ? Number(limit) : 20,
    offset: offset ? Number(offset) : 0
  });

  res.json(result);
};

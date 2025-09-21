import { Request, Response } from 'express';
import { StockAdjustmentService } from './adjustment.service';

export const createAdjustment = async (req: Request, res: Response) => {
  const { orgId, id: userId } = req.user!;
  const result = await StockAdjustmentService.create(orgId, userId, req.body);
  res.status(201).json(result);
};

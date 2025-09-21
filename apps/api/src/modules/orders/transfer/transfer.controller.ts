import { Request, Response } from 'express';
import { TransferService } from './transfer.service';

export const createTransfer = async (req: Request, res: Response) => {
  const { orgId } = req.user!;
  const transfer = await TransferService.create(orgId, req.body);
  res.status(201).json(transfer);
};

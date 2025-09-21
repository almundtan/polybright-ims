import { Request, Response } from 'express';
import { PurchaseOrderService } from './purchase.service';

export const listPOs = async (req: Request, res: Response) => {
  const { orgId } = req.user!;
  const orders = await PurchaseOrderService.list(orgId);
  res.json({ items: orders });
};

export const createPO = async (req: Request, res: Response) => {
  const { orgId, id: userId } = req.user!;
  const order = await PurchaseOrderService.create(orgId, userId, req.body);
  res.status(201).json(order);
};

export const updatePO = async (req: Request, res: Response) => {
  const { orgId } = req.user!;
  const { id } = req.params;
  const order = await PurchaseOrderService.update(orgId, id, req.body);
  res.json(order);
};

export const receivePO = async (req: Request, res: Response) => {
  const { orgId } = req.user!;
  const { id } = req.params;
  const { warehouseId } = req.body as { warehouseId: string };
  const order = await PurchaseOrderService.receive(orgId, id, warehouseId);
  res.json(order);
};

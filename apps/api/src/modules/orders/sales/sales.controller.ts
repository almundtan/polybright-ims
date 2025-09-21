import { Request, Response } from 'express';
import { SalesOrderService } from './sales.service';

export const listSOs = async (req: Request, res: Response) => {
  const { orgId } = req.user!;
  const orders = await SalesOrderService.list(orgId);
  res.json({ items: orders });
};

export const createSO = async (req: Request, res: Response) => {
  const { orgId } = req.user!;
  const order = await SalesOrderService.create(orgId, req.body);
  res.status(201).json(order);
};

export const updateSO = async (req: Request, res: Response) => {
  const { orgId } = req.user!;
  const { id } = req.params;
  const order = await SalesOrderService.update(orgId, id, req.body);
  res.json(order);
};

export const fulfillSO = async (req: Request, res: Response) => {
  const { orgId } = req.user!;
  const { id } = req.params;
  const { warehouseId } = req.body as { warehouseId: string };
  const order = await SalesOrderService.fulfill(orgId, id, warehouseId);
  res.json(order);
};

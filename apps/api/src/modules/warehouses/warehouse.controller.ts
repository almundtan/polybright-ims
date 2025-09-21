import { Request, Response } from 'express';
import { WarehouseService } from './warehouse.service';

export const listWarehouses = async (req: Request, res: Response) => {
  const { orgId } = req.user!;
  const warehouses = await WarehouseService.list(orgId);
  res.json({ items: warehouses });
};

export const createWarehouse = async (req: Request, res: Response) => {
  const { orgId, id: userId } = req.user!;
  const warehouse = await WarehouseService.create(orgId, req.body, userId);
  res.status(201).json(warehouse);
};

export const updateWarehouse = async (req: Request, res: Response) => {
  const { orgId, id: userId } = req.user!;
  const { id } = req.params;
  const warehouse = await WarehouseService.update(orgId, id, req.body, userId);
  res.json(warehouse);
};

export const deleteWarehouse = async (req: Request, res: Response) => {
  const { orgId, id: userId } = req.user!;
  const { id } = req.params;
  await WarehouseService.remove(orgId, id, userId);
  res.status(204).send();
};

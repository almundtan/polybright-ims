import { Request, Response } from 'express';
import { ProductService } from './product.service';

export const listProducts = async (req: Request, res: Response) => {
  const { orgId } = req.user!;
  const { search, limit, offset } = req.query as {
    search?: string;
    limit?: string;
    offset?: string;
  };
  const result = await ProductService.list(orgId, {
    search,
    limit: limit ? Number(limit) : 20,
    offset: offset ? Number(offset) : 0
  });
  res.json(result);
};

export const createProduct = async (req: Request, res: Response) => {
  const { orgId, id: userId } = req.user!;
  const product = await ProductService.create({ orgId, ...req.body }, userId);
  res.status(201).json(product);
};

export const updateProduct = async (req: Request, res: Response) => {
  const { orgId, id: userId } = req.user!;
  const { id } = req.params;
  const product = await ProductService.update(id, orgId, req.body, userId);
  res.json(product);
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { orgId, id: userId } = req.user!;
  const { id } = req.params;
  await ProductService.remove(id, orgId, userId);
  res.status(204).send();
};

export const productByBarcode = async (req: Request, res: Response) => {
  const { orgId } = req.user!;
  const { code } = req.params;
  const product = await ProductService.byBarcode(orgId, code);
  if (!product) {
    return res.status(404).json({ error: 'Not found', code: 'PRODUCT_NOT_FOUND' });
  }
  res.json(product);
};

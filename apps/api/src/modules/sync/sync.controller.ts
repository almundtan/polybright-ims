import { Request, Response } from 'express';
import { SyncService } from './sync.service';

export const pushSync = async (req: Request, res: Response) => {
  const { orgId } = req.user!;
  const { clientId, lastSyncedAt, mutations } = req.body;
  const result = await SyncService.push(orgId, clientId, {
    clientId,
    lastSyncedAt,
    mutations
  });
  res.json(result);
};

export const pullSync = async (req: Request, res: Response) => {
  const { orgId } = req.user!;
  const { since } = req.query as { since?: string };
  const date = since ? new Date(since) : new Date(Date.now() - 1000 * 60 * 60 * 24);
  const result = await SyncService.pull(orgId, date);
  res.json(result);
};

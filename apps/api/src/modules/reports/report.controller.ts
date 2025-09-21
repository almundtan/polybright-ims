import { Request, Response } from 'express';
import { ReportService } from './report.service';

export const ledgerReport = async (req: Request, res: Response) => {
  const { orgId } = req.user!;
  const rows = await ReportService.ledger(orgId, req.query as any);
  res.json({ rows });
};

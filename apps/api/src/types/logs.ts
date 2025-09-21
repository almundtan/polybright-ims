export interface AuditLogEntry {
  entity: string;
  entityId: string;
  action: string;
  payload: unknown;
  userId?: string;
}

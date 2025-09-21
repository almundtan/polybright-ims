# ADR-002: Offline Sync Design

- **Context**: IMS must tolerate field operations offline and replay work when connectivity returns.
- **Decision**: Clients queue mutations locally (IndexedDB on web, SQLite on mobile) and post them to `/api/sync/push` once online.
- **Decision**: Server records mutations in an audit log, applies last-write-wins per entity, and exposes `/api/sync/pull?since=` for change feeds.
- **Decision**: Quantity conflicts favour the server state; deltas are captured in `StockLedger` for post-hoc review.
- **Consequences**: Simpler than CRDTs; introduces possibility of temporary divergence but keeps audit trail for reconciliation.
- **Status**: Accepted.

# ADR-001: Monolith with Next.js + Express + Prisma

- **Context**: Polybright IMS needs shared code for web + mobile while delivering REST APIs and SSR pages.
- **Decision**: Keep a single repository with three apps (Express API, Next.js web, Expo mobile) that share env + types.
- **Decision**: Express + Prisma deliver transactional logic (ledger, inventory) with PostgreSQL for durability.
- **Decision**: Next.js serves the operator console, while Expo consumes the same API for mobility.
- **Consequences**: Shared Prisma schema keeps models consistent; deployments can split (Render API, Vercel web) without microservices overhead.
- **Status**: Accepted.

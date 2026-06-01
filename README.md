# ValuHire

ValuHire is a full-stack technical hiring platform for recruiter-led assessments and live technical interviews.

## Local Setup

1. Copy `.env.example` to `.env` and adjust secrets.
2. Install dependencies with `npm install`.
3. Start infrastructure and apps with `docker compose up`.
4. Run migrations with `npm run prisma:migrate`.
5. Seed the admin user with `npm run prisma:seed`.

## Planned Local Services

- Web: `http://localhost:5173`
- API: `http://localhost:4000`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

## Docs

- [Implementation Plan](IMPLEMENTATION_PLAN.md)
- [Future Enhancements](FUTURE_ENHANCEMENTS.md)

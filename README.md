# ValuHire

ValuHire is a full-stack technical hiring platform for recruiter-led assessments and live technical interviews.

## Local Setup

1. Copy `.env.example` to `.env` and adjust secrets.
2. Install dependencies with `npm install`.
3. Start infrastructure and apps with `docker compose up`.
4. Run migrations with `npm run prisma:migrate`.
5. Seed the admin user with `npm run prisma:seed`.

## Local Services

- Web: `http://localhost:5173`
- API: `http://localhost:4000`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

## Implemented V1 Areas

- Auth: candidate/recruiter registration, login, refresh, logout, `/auth/me`, role checks, and approved-company checks.
- Admin: company approval/ban and user ban workflows.
- Recruiter: campaign CRUD, assessment builder, invite links, rankings, interview scheduling, and feedback.
- Candidate: public campaign applications, invite entry, timed assessment sessions, MCQ answers, proctoring events, submissions, and history.
- Runner: BullMQ submission worker with Python, JavaScript, C++, and Java adapters plus Docker command planning.
- Realtime: Socket.IO collaboration and WebRTC signaling events for interview rooms.
- UI: Stitch-derived React screens for login, recruiter dashboard, builder, candidate workspace, assessment room, results, interviews, and admin moderation.

## Useful Commands

- Run all checks: `npm test`
- Run API tests: `npm run test --workspace apps/api`
- Run runner tests: `npm run test --workspace services/runner`
- Build web app: `npm run build --workspace apps/web`
- Validate Prisma schema: `DATABASE_URL="postgresql://valuhire:valuhire@localhost:5432/valuhire?schema=public" npx prisma validate`

## Runtime Notes

- The code runner defaults to local process execution unless `VALUHIRE_USE_DOCKER=true` is set.
- Docker execution uses no network, memory limits, CPU limits, timeout, and per-test output limits.
- Local sandboxed environments may block child-process execution. In that case runner execution is recorded as `RUNTIME_ERROR`; Docker/container runtime is the intended production path.

## Docs

- [Implementation Plan](IMPLEMENTATION_PLAN.md)
- [Future Enhancements](FUTURE_ENHANCEMENTS.md)
- [Phase Progress](TASK_PROGRESS.md)
- [Stitch Design Project](docs/STITCH_DESIGN_PROJECT.md)

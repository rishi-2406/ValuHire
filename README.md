# ValuHire 🚀

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**ValuHire** is a full-stack, enterprise-grade technical hiring platform designed for recruiter-led assessments, take-home assignments, and live collaborative technical interviews. Built with modern web technologies, it provides a seamless experience for recruiters to evaluate candidates and for candidates to showcase their skills.

---

## ✨ Features

### 🏢 For Recruiters
- **Campaign Management:** Create and manage hiring campaigns with custom assessment flows.
- **Assessment Builder:** Construct technical tests with multiple-choice questions (MCQs) and coding challenges.
- **Candidate Tracking:** Track candidate progress, view rankings, and analyze detailed feedback.
- **Live Interviews:** Schedule and conduct live coding interviews with collaborative IDEs and WebRTC-based communication.
- **Invite System:** Generate secure invite links for candidates to join assessments.

### 🧑‍💻 For Candidates
- **Assessment Workspace:** A robust, browser-based IDE powered by Monaco Editor for solving coding challenges.
- **Live Collaboration:** Real-time pairing sessions with recruiters using Socket.IO and WebRTC.
- **Multi-language Support:** Execute code in Python, JavaScript, C++, and Java.
- **Proctoring:** Built-in event tracking and proctoring to ensure assessment integrity.

### 🛡️ Administration
- **Role-based Access Control (RBAC):** Distinct roles for Admins, Recruiters, and Candidates.
- **Company Management:** Approve, reject, or ban companies and users to maintain platform quality.

---

## 🛠️ Tech Stack

ValuHire is built as a monorepo containing multiple services, ensuring high performance, scalability, and developer productivity.

**Frontend (`apps/web`)**
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS + Lucide Icons
- **Editor:** Monaco Editor
- **Real-time:** Socket.IO Client

**Backend (`apps/api`)**
- **Framework:** Node.js + Express
- **Database ORM:** Prisma
- **Real-time:** Socket.IO
- **Authentication:** JWT + bcryptjs
- **Queueing:** BullMQ

**Code Runner (`services/runner`)**
- **Architecture:** BullMQ worker processing code execution jobs
- **Execution:** Supports both local sandboxed execution and secure Docker-based runtime isolation
- **Languages:** Node.js, Python, C++, Java

**Infrastructure**
- **Database:** PostgreSQL
- **Cache & Message Broker:** Redis

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Docker](https://www.docker.com/) & Docker Compose
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/valuhire.git
   cd valuhire
   ```

2. **Environment Variables:**
   Copy the example environment file and adjust the secrets as needed.
   ```bash
   cp .env.example .env
   ```

3. **Install Dependencies:**
   Install packages across all workspaces.
   ```bash
   npm install
   ```

4. **Start Infrastructure:**
   Spin up PostgreSQL and Redis using Docker.
   ```bash
   docker compose up -d
   ```

5. **Database Setup:**
   Run migrations and seed the database with the initial admin user.
   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```

6. **Start Development Servers:**
   Launch the Web app, API, and Code Runner concurrently.
   ```bash
   npm run dev
   ```

### 📍 Local Services

Once started, the services will be available at:
- **Web App:** [http://localhost:5173](http://localhost:5173)
- **API Server:** [http://localhost:4000](http://localhost:4000)
- **PostgreSQL:** `localhost:5432`
- **Redis:** `localhost:6379`

---

## 💻 Commands Reference

| Command | Description |
|---|---|
| `npm run dev` | Start all apps (Web, API, Runner) in development mode. |
| `npm test` | Run tests across all workspaces. |
| `npm run test --workspace apps/api` | Run API specific tests. |
| `npm run test --workspace services/runner` | Run Code Runner specific tests. |
| `npm run build --workspace apps/web` | Build the frontend for production. |
| `npm run prisma:generate` | Generate Prisma client. |
| `npm run prisma:migrate` | Apply pending database migrations. |

---

## 🐳 Code Runner Architecture

The execution environment is designed to handle untrusted code safely.
- **Local Mode:** Defaults to local process execution (useful for rapid development).
- **Docker Mode:** Set `VALUHIRE_USE_DOCKER=true` in your `.env` to execute code within isolated Docker containers. This enforces no-network rules, memory limits, CPU constraints, and timeouts. This is the **intended production path**.
- *Note:* If local sandboxed environments block child-process execution, the runner will record a `RUNTIME_ERROR`. Switch to Docker mode to resolve this.

---

## 📚 Documentation

For deeper dives into the architecture and project planning, refer to:
- [Implementation Plan](IMPLEMENTATION_PLAN.md)
- [Future Enhancements](FUTURE_ENHANCEMENTS.md)
- [Phase Progress](TASK_PROGRESS.md)
- [Stitch Design Project](docs/STITCH_DESIGN_PROJECT.md)

---

<p align="center">
  Built with ❤️ by the ValuHire Team
</p>

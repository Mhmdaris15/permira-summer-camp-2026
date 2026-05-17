<div align="center">

# 🌶️ PERMIRA Summer Camp 2026

### Taste of Nusantara · Culinary Diplomacy Through Shared Experience

A production-grade web platform for a three-day cultural exchange between
Indonesian and Russian students — landing site, AI-powered host chatbot,
participant registration with document uploads, and an admin dashboard.

[![CI](https://img.shields.io/github/actions/workflow/status/permira/summercamp-2026/ci.yml?branch=main&label=CI&style=flat-square)](./.github/workflows/ci.yml)
[![Docker](https://img.shields.io/github/actions/workflow/status/permira/summercamp-2026/docker.yml?branch=main&label=docker&style=flat-square)](./.github/workflows/docker.yml)
![Node](https://img.shields.io/badge/node-22+-339933?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/react-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/typescript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/tailwind-4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)
![SurrealDB](https://img.shields.io/badge/db-surrealdb-FF00A0?style=flat-square&logo=surrealdb&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

</div>

---

## ✨ Features

- **Immersive landing site** — narrative-driven storytelling (hero, three-day journey, culinary highlights, cultural exchange, gallery, CTA) with smooth scroll, GSAP/Lenis choreography, and a warm spice-inspired design system
- **AI host chatbot** — Google Gemini-powered assistant grounded in a dynamic, admin-editable knowledge base; multi-turn, session-persistent, with typing indicator and graceful fallbacks
- **Registration with documents** — multi-step form, inline validation, multipart passport + signed-consent uploads, honeypot anti-spam, optimistic UI
- **Admin dashboard** — JWT-protected `/admin` and `/admin/participants` with knowledge-base CMS, searchable & filterable participants table, document preview, status workflow (pending → accepted/waitlist/rejected), edit & delete with confirmation
- **Production-ready backend** — Express + SurrealDB embedded, helmet, rate limiting, structured pino logging, graceful shutdown, retry-on-boot DB init
- **One-click deploy** — Dockerized, compose-ready, Coolify-compatible with persistent volumes for participant data and uploaded files

---

## 🛠️ Tech Stack

| Layer        | Technology                                                                     |
| ------------ | ------------------------------------------------------------------------------ |
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS v4, Framer Motion, GSAP, Lenis      |
| **Backend**  | Node.js 22, Express 5, TypeScript                                              |
| **Database** | SurrealDB (embedded, in-process via `@surrealdb/node`) with JSON snapshotting  |
| **AI**       | Google Gemini (`gemini-2.5-flash-lite` default), provider-agnostic interface   |
| **Auth**     | JWT (HS256, 24h TTL) issued from a shared `ADMIN_TOKEN` secret                 |
| **Files**    | Disk storage with UUID filenames; protected streaming via authenticated routes |
| **Infra**    | Docker, nginx (SPA + reverse proxy), GitHub Actions, Coolify-ready             |

---

## 🏛️ System Architecture

```
                                     ┌──────────────────────┐
                                     │   Browser (SPA)      │
                                     │   React + Tailwind   │
                                     └──────────┬───────────┘
                                                │ HTTPS
                                ┌───────────────▼───────────────┐
                                │      nginx (web container)    │
                                │   • serves static dist/       │
                                │   • SPA fallback              │
                                │   • reverse-proxies /api/*    │
                                └───────────────┬───────────────┘
                                                │ HTTP (internal)
                                ┌───────────────▼───────────────┐
                                │   Express API (api container) │
                                │   • helmet, rate limit, CORS  │
                                │   • JWT auth, multer uploads  │
                                │   • pino structured logging   │
                                └───┬─────────────┬─────────────┘
                                    │             │
              ┌─────────────────────┘             └────────────────────┐
              ▼                                                        ▼
   ┌──────────────────────┐                              ┌──────────────────────┐
   │  SurrealDB (in-mem)  │                              │   Google Gemini      │
   │  + JSON snapshot     │                              │  (HTTPS, env-keyed)  │
   │  on /app/server/data │                              └──────────────────────┘
   └──────────────────────┘
              │
   Persistent Docker volume:
   • permira-data    → snapshot
   • permira-uploads → passport / consent files
```

**Key choices**

- **Two containers, one private network.** Web (nginx) is the only public surface. The API is reachable only via the internal `permira-net` bridge — your firewall rules become trivial.
- **DB embedded, not separate.** At participant scale (hundreds), running SurrealDB in-process with JSON snapshots is dramatically simpler than a third container. Swappable later — see [DEPLOYMENT.md](./DEPLOYMENT.md).
- **Files on disk, referenced by UUID in DB.** Same code path swaps to S3 by editing one file (`server/services/files.ts`).

---

## 📁 Folder Structure

```
.
├── src/                         # React frontend
│   ├── components/              # Sectioned UI (Hero, Cuisine, Chat, …)
│   │   ├── admin/               # Admin-only widgets (table, modals, pills)
│   │   ├── chat/                # Chat widget + useChat hook
│   │   └── registration/        # Form, fields, modal, validation
│   ├── data/                    # Static content (dishes, journey)
│   ├── lib/                     # API clients, hooks, helpers
│   ├── pages/                   # Route components (Landing, Admin, …)
│   ├── App.tsx                  # Router shell
│   └── main.tsx
│
├── server/                      # Express backend
│   ├── routes/                  # auth · chat · knowledge · registrations · files
│   ├── services/                # Domain layer (participants, files)
│   ├── scripts/                 # One-shot scripts (seed)
│   ├── data/                    # JSON-snapshot DB + knowledge base
│   ├── uploads/                 # Uploaded passport/consent docs (gitignored)
│   ├── auth.ts                  # JWT middleware + token utilities
│   ├── db.ts                    # SurrealDB init + schema + snapshotting
│   ├── llm.ts                   # Gemini client + system prompt
│   ├── logger.ts                # pino instance
│   ├── knowledge.ts             # KB load/save/compose helpers
│   ├── types.ts                 # Shared TS types
│   ├── index.ts                 # App entrypoint
│   └── tsconfig.json            # Server-only TS config
│
├── infra/
│   └── nginx.conf               # SPA + reverse-proxy config
│
├── .github/workflows/
│   ├── ci.yml                   # Lint · typecheck · build
│   └── docker.yml               # Multi-image Docker build
│
├── Dockerfile.web               # Frontend (multi-stage → nginx)
├── Dockerfile.api               # Backend (multi-stage → node)
├── docker-compose.yml           # Production compose (Coolify-ready)
├── docker-compose.dev.yml       # Local override (bind mounts, hot reload)
├── .dockerignore
├── .env.example
├── DEPLOYMENT.md                # Step-by-step Coolify guide
└── README.md
```

---

## 🚀 Local Development

### Prerequisites

- **Node.js ≥ 22**
- **npm** (lockfile uses npm)
- A **Google Gemini API key** (for the chatbot — registration/admin work without it). Get one free at https://aistudio.google.com/apikey.

### Setup

```bash
git clone https://github.com/permira/summercamp-2026.git
cd summercamp-2026

# Install — `--legacy-peer-deps` is required because @surrealdb/node@3.x
# declares a peer of surrealdb@2.x, while the latest of both is what we want.
npm install --legacy-peer-deps

cp .env.example .env
# fill in GEMINI_API_KEY, ADMIN_TOKEN, JWT_SECRET

npm run dev
```

This starts both processes under `concurrently`:

| Service       | URL                     | Purpose                  |
| ------------- | ----------------------- | ------------------------ |
| Frontend      | http://localhost:5173   | Vite dev server with HMR |
| Backend (API) | http://localhost:8787   | Express + SurrealDB      |

The Vite dev server proxies `/api/*` to the backend automatically — no CORS config needed.

### Available Scripts

```bash
npm run dev          # Both services with hot reload
npm run dev:web      # Frontend only
npm run dev:server   # Backend only (tsx watch)

npm run build        # Build both for production (web → dist, api → server/dist)
npm start            # Run the compiled backend (after build)

npm run lint         # ESLint
npm run typecheck    # TypeScript strict check (frontend + backend)

npm run seed         # Seed an initial knowledge.json (idempotent)

npm run docker:build # docker compose build
npm run docker:up    # docker compose up -d
npm run docker:down  # docker compose down
```

---

## 🔐 Environment Variables

All variables are documented in [`.env.example`](./.env.example). The required minimum:

| Variable              | Where    | Required | Purpose                                     |
| --------------------- | -------- | :------: | ------------------------------------------- |
| `GEMINI_API_KEY`      | Backend  |    ✅    | Powers the chatbot                          |
| `ADMIN_TOKEN`         | Backend  |    ✅    | Shared secret for admin login               |
| `JWT_SECRET`          | Backend  |    ✅    | Signs admin JWTs (32+ random chars)         |
| `LLM_MODEL`           | Backend  |          | Gemini model id (default `gemini-2.5-flash-lite`) |
| `PORT`                | Backend  |          | API port (default `8787`)                   |
| `LOG_LEVEL`           | Backend  |          | `trace` … `fatal` (default `info`)          |
| `ALLOWED_ORIGINS`     | Backend  |          | Comma-separated CORS allowlist              |
| `RATE_LIMIT_GLOBAL`   | Backend  |          | Per-IP per-15-min cap on `/api/*`           |
| `RATE_LIMIT_TIGHT`    | Backend  |          | Per-IP per-minute cap on `/api/auth`, `/api/chat` |
| `VITE_API_URL`        | Frontend |          | Override API origin (empty = same-origin)   |

**Generate a strong `JWT_SECRET`:**

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

---

## 🗄️ Database

The backend uses **SurrealDB** in embedded memory mode with a JSON-file snapshot for durability. Schema is defined in [`server/db.ts`](./server/db.ts) using `DEFINE TABLE` / `DEFINE FIELD` statements that run on every boot — **idempotent migrations come for free**.

- **State files:** `server/data/participants.json`, `server/data/knowledge.json`
- **Mounted in production** as Docker volumes `permira-data` and `permira-uploads`
- **Backups:** snapshot the volume — both files are plain JSON

To swap to a different store later, only `server/db.ts` and `server/services/participants.ts` change. Routes and frontend stay identical.

---

## 🐳 Docker

```bash
# Production build & run
docker compose up -d --build

# With local hot reload
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

Services exposed:

- **web** → port 8080 → nginx serving the SPA + proxying `/api/*` → api:8787
- **api** → not published; reachable only via the internal `permira-net` bridge

Persistent state lives in named volumes:

- `permira-data`    → JSON DB snapshots
- `permira-uploads` → uploaded passport/consent files

---

## ☁️ Deployment (Coolify)

Full step-by-step guide: **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

In short:

1. In Coolify, **New Resource → Public Repository** and connect this repo
2. Choose **Docker Compose** as the build pack
3. Set the required environment variables in the UI
4. Attach **persistent storage** to the `permira-data` and `permira-uploads` volumes
5. Set the domain on the `web` service — Coolify provisions HTTPS via Traefik automatically
6. Click **Deploy**

---

## 📸 Screenshots

> Drop screenshots in `docs/screenshots/` and reference them here.

| Landing                                  | Chatbot                                  |
| ---------------------------------------- | ---------------------------------------- |
| ![Landing](./docs/screenshots/landing.png) | ![Chat](./docs/screenshots/chat.png) |

| Registration                                          | Admin · Participants                                       |
| ----------------------------------------------------- | ---------------------------------------------------------- |
| ![Registration](./docs/screenshots/registration.png)  | ![Admin Participants](./docs/screenshots/admin-table.png)  |

---

## 📡 API Reference

All routes are under `/api`. Admin routes require `Authorization: Bearer <jwt>`.

### Public

| Method | Route                  | Description                                      |
| ------ | ---------------------- | ------------------------------------------------ |
| GET    | `/api/health`          | Liveness probe                                   |
| POST   | `/api/auth/login`      | Body: `{ token }` → `{ token: <jwt>, expiresInSeconds }` |
| GET    | `/api/knowledge`       | Returns current knowledge base                   |
| POST   | `/api/chat`            | Body: `{ messages: [{role, content}] }` → `{ reply }` |
| POST   | `/api/registrations`   | `multipart/form-data` with `passport` + `consent` files + JSON fields |

### Admin (JWT required)

| Method | Route                              | Description                          |
| ------ | ---------------------------------- | ------------------------------------ |
| GET    | `/api/auth/me`                     | Verify session                       |
| GET    | `/api/knowledge/preview`           | Composed system-prompt context       |
| PUT    | `/api/knowledge`                   | Replace knowledge base               |
| GET    | `/api/registrations`               | List with `?search=&status=&limit=&offset=` |
| GET    | `/api/registrations/:id`           | Single participant                   |
| PATCH  | `/api/registrations/:id`           | Partial update (status, notes, fields) |
| DELETE | `/api/registrations/:id`           | Remove + delete files                |
| GET    | `/api/files/:id`                   | Stream stored file (passport/consent) |

---

## 🧑‍💻 Contributing

1. Fork → branch off `main` (`feat/...`, `fix/...`)
2. Run `npm run typecheck && npm run lint` before pushing
3. Open a PR with a clear summary and screenshots if UI-affecting
4. CI will run lint + typecheck + build + Docker validation

We follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 🛡️ Security

- **No secrets in source.** All sensitive values live in environment variables. `.env` is gitignored.
- **JWT-based admin auth.** Tokens expire after 24h, signed with rotatable `JWT_SECRET`.
- **Rate limiting.** Global `300/15min/IP` and tight `10/min/IP` on auth and chat endpoints.
- **Helmet** for sane HTTP security headers; nginx layers CSP, HSTS, frame denial.
- **CORS allowlist** via `ALLOWED_ORIGINS` (don't leave empty in production).
- **Honeypot + server-side validation** on the public registration form.
- **Constant-time token comparison** in admin verification.
- **Containers run as non-root** (`USER node` / `nginx`).
- **File uploads:** mime-allowlist, 10 MB cap, UUID filenames, files served only with valid JWT.

Found a vulnerability? Email **security@permira.id** rather than opening a public issue.

---

## 📈 Production Notes

- **Scaling the API:** stateless except for the embedded DB. To horizontally scale, replace SurrealDB-embedded with a SurrealDB or Postgres server (single line in `db.ts`) — then deploy multiple `api` replicas behind the same nginx.
- **Backups:** `cron` a daily `tar` of the two volumes off-site. Both files are JSON, restoration is `cp`.
- **Observability:** pino emits JSON logs. Pipe them into Loki/Grafana, Datadog, or the Coolify log viewer.
- **Cost:** Gemini usage is the only variable cost. Gemini 2.5 Flash Lite has a generous free tier and pay-as-you-go pricing well under $0.001 per chat turn at this prompt size.
- **Rotating `JWT_SECRET`:** invalidates all admin sessions immediately. Do this if a token is ever exposed.

---

## 🐞 Troubleshooting

| Symptom                                              | Likely cause / fix                                                            |
| ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| `npm install` fails with `ERESOLVE`                  | Add `--legacy-peer-deps`. SurrealDB 2/3 peer ranges conflict.                 |
| Admin login says "Invalid token"                     | `.env` change but server wasn't restarted — `dotenv` doesn't override existing env. |
| Chat returns "GEMINI_API_KEY is not set"             | API key is empty in `.env`/Coolify. Set and restart the api container.        |
| `[db] init failed` on boot                           | Stale snapshot from an older schema. Delete `server/data/participants.json`. |
| Files vanish after redeploy                          | Volumes not attached — re-check Coolify storage configuration for `permira-uploads`. |
| `surrealkv://` hangs on Windows                      | Known on Windows. We use `mem://` + JSON snapshots; don't switch.             |

---

## 📜 License

MIT © PERMIRA — see [LICENSE](./LICENSE).

---

<div align="center">

Built with care for *Taste of Nusantara*  ·  selamat makan · приятного аппетита

</div>

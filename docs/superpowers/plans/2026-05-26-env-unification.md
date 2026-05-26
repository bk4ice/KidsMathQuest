# Single `.env` Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate frontend, backend, and Docker configuration around a single root `.env`, while keeping the app reachable via `localhost` or LAN IP and reusing the existing SQLite database file.

**Architecture:** The backend will load the root `.env` file when run locally, while Docker will receive the same variables via `env_file` and mounted volumes. The frontend will stop depending on a baked-in backend origin and will use same-origin `/api` and `/uploads` paths, letting Vite dev proxy and nginx both forward requests to the backend. SQLite will remain the runtime database, with `backend/prisma/dev.db` mounted into the backend container so the existing data file is preserved.

**Tech Stack:** TypeScript, Express, Prisma, Vite, Nginx, Docker Compose, dotenv

---

### Task 1: Consolidate environment templates at the repository root

**Files:**
- Modify: `d:\Dev\Github\KidsMathQuest\.env.example`
- Create: `d:\Dev\Github\KidsMathQuest\.env`
- Delete: `d:\Dev\Github\KidsMathQuest\backend\.env.example`
- Delete: `d:\Dev\Github\KidsMathQuest\frontend\.env.example`

- [ ] **Step 1: Replace the root template with the full shared configuration**

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
DATABASE_URL=file:./prisma/dev.db
```

- [ ] **Step 2: Create a root `.env` for local development**

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
DATABASE_URL=file:./prisma/dev.db
```

- [ ] **Step 3: Remove redundant per-app env templates**

```text
Delete backend/.env.example and frontend/.env.example so the repository has one source of truth.
```

### Task 2: Make backend load the root `.env` and keep SQLite path stable

**Files:**
- Modify: `d:\Dev\Github\KidsMathQuest\backend\src\index.ts`
- Modify: `d:\Dev\Github\KidsMathQuest\backend\src\app.ts`
- Modify: `d:\Dev\Github\KidsMathQuest\backend\src\config\database.ts` if needed for startup consistency

- [ ] **Step 1: Load the root `.env` from the backend process**

```ts
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
```

- [ ] **Step 2: Keep the server bound to all interfaces for IP access**

```ts
const PORT = parseInt(process.env.PORT || '5000', 10);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

- [ ] **Step 3: Keep Prisma pointed at the env-driven SQLite file**

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

### Task 3: Switch the frontend to same-origin API and upload paths

**Files:**
- Modify: `d:\Dev\Github\KidsMathQuest\frontend\src\config.ts`
- Modify: `d:\Dev\Github\KidsMathQuest\frontend\src\services\api.ts`
- Modify: `d:\Dev\Github\KidsMathQuest\frontend\src\contexts\AuthContext.tsx`
- Modify: `d:\Dev\Github\KidsMathQuest\frontend\src\pages\Register.tsx`
- Modify: `d:\Dev\Github\KidsMathQuest\frontend\src\pages\AddChild.tsx`
- Modify: `d:\Dev\Github\KidsMathQuest\frontend\src\pages\EditChild.tsx`
- Modify: `d:\Dev\Github\KidsMathQuest\frontend\src\pages\ChildLogin.tsx`
- Modify: `d:\Dev\Github\KidsMathQuest\frontend\src\pages\ParentDashboard.tsx`

- [ ] **Step 1: Replace the frontend base URL with same-origin defaults**

```ts
export const config = {
  API_BASE_URL: '',
};
```

- [ ] **Step 2: Keep request helpers using relative `/api` paths**

```ts
const API_BASE_URL = `${config.API_BASE_URL}/api`;
```

- [ ] **Step 3: Preserve upload preview behavior with relative `/uploads` URLs**

```ts
const finalAvatarUrl = avatarUrl
  ? (avatarUrl.startsWith('http') ? avatarUrl : `${config.API_BASE_URL}${avatarUrl}`)
  : null;
```

### Task 4: Update Docker and nginx so the same config works locally and on LAN IPs

**Files:**
- Modify: `d:\Dev\Github\KidsMathQuest\docker-compose.yml`
- Modify: `d:\Dev\Github\KidsMathQuest\frontend\nginx.conf`
- Modify: `d:\Dev\Github\KidsMathQuest\backend\Dockerfile`
- Modify: `d:\Dev\Github\KidsMathQuest\frontend\Dockerfile` if needed for runtime copy behavior

- [ ] **Step 1: Remove dead cloud/PostgreSQL wiring from the compose file**

```yaml
services:
  backend:
    env_file:
      - .env
    volumes:
      - ./backend/prisma:/app/prisma
      - ./backend/uploads:/app/uploads
```

- [ ] **Step 2: Mount the existing SQLite database file through the Prisma directory**

```yaml
volumes:
  - ./backend/prisma:/app/prisma
```

- [ ] **Step 3: Keep nginx proxying `/api` and `/uploads` to the backend service**

```nginx
location /api/ {
    proxy_pass http://backend:5000/api/;
}
```

### Task 5: Verify the new startup flow and document it

**Files:**
- Modify: `d:\Dev\Github\KidsMathQuest\README.md`

- [ ] **Step 1: Update the setup instructions to reference only the root `.env`**

```md
1. Copy `.env.example` to `.env`
2. Edit `JWT_SECRET`, `PORT`, and `DATABASE_URL` if needed
3. Start local dev or Docker using the same environment file
```

- [ ] **Step 2: Document that LAN access works through the frontend port and same-origin API routing**

```md
Open the app through `http://<your-ip>:3000` in Docker or the Vite dev URL in local development.
```

- [ ] **Step 3: Run the relevant build and smoke checks**

```bash
npm run build --prefix backend
npm run build --prefix frontend
```

# KidsMathQuest

<div align="right">

English | [简体中文](README.md)

</div>

<div align="center">

<img src="screenshots/banner.png" alt="Project Banner" width="300">

**A web app for elementary school kids to practice addition, subtraction, multiplication, and division. Customize auto-generated math worksheets to make daily practice more engaging—and use AI to make the frontend look delightful, so kids actually want to do a few more problems every day.**

[![Docker Hub](https://img.shields.io/badge/Docker%20Hub-bllxk%2Fkidsmathquest-blue?logo=docker)](https://hub.docker.com/r/bllxk/kidsmathquest-backend)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18-339933?logo=nodedotjs)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

## 📢 News

**2026-06-06** 🤖 **New AI Tutor Feature** — Meet "狸学长" (Raccoon Tutor), a smart AI mentor that supports multi-turn conversations, learning diagnostics, and personalized worksheet recommendations. It works with OpenAI, Anthropic, Alibaba Cloud DashScope, and vLLM. Responses stream via SSE and render Markdown. AI is entirely optional and does not affect the core practice features. See [AI Tutor Configuration](#ai-tutor-configuration) for details.

---

## Table of Contents

- [KidsMathQuest](#kidsmathquest)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Feature Overview](#feature-overview)
    - [Child Features](#child-features)
    - [Parent Features](#parent-features)
    - [Screenshots](#screenshots)
  - [Tech Stack](#tech-stack)
    - [System Architecture](#system-architecture)
    - [Deployment Flow](#deployment-flow)
  - [Quick Start](#quick-start)
    - [Prerequisites](#prerequisites)
    - [Option 1: Docker (Recommended, 5-Minute Setup)](#option-1-docker-recommended-5-minute-setup)
    - [Option 2: Local Development](#option-2-local-development)
    - [Common Commands](#common-commands)
    - [Option 3: Try It Online (socialistic.ai)](#option-3-try-it-online-socialisticai)
  - [Environment Variables](#environment-variables)
    - [Backend `.env`](#backend-env)
    - [Notes](#notes)
  - [AI Tutor Configuration](#ai-tutor-configuration)
    - [Features](#features)
    - [Configuration Steps](#configuration-steps)
    - [How to Use](#how-to-use)
    - [Optional Feature Notes](#optional-feature-notes)
  - [Project Structure](#project-structure)
  - [FAQ](#faq)
    - [How do I change the ports?](#how-do-i-change-the-ports)
    - [Will data be lost?](#will-data-be-lost)
    - [How do I back up data?](#how-do-i-back-up-data)
    - [How do I switch to PostgreSQL?](#how-do-i-switch-to-postgresql)
    - [What if the database schema is out of sync?](#what-if-the-database-schema-is-out-of-sync)
  - [Printing Worksheets](#printing-worksheets)
    - [Step-by-Step Instructions](#step-by-step-instructions)
    - [Tips](#tips)
  - [Usage Examples](#usage-examples)
    - [Example 1: Addition and Subtraction Within 100](#example-1-addition-and-subtraction-within-100)
    - [Example 2: Mixed Operations with Parentheses](#example-2-mixed-operations-with-parentheses)
    - [Example 3: Multiplication Table Practice](#example-3-multiplication-table-practice)
    - [Example 4: Simple Division (No Remainder)](#example-4-simple-division-no-remainder)
    - [Example 5: Three-Step Mixed Operations Challenge](#example-5-three-step-mixed-operations-challenge)
    - [Example 6: Decimal Addition and Subtraction](#example-6-decimal-addition-and-subtraction)
  - [Default Accounts](#default-accounts)
  - [Contributing](#contributing)
  - [Acknowledgements](#acknowledgements)
  - [Security Notes](#security-notes)
  - [License](#license)

## Introduction

KidsMathQuest is a math learning app for children aged 6–12, designed with a **Parent Portal + Child Portal** dual-interface:

- **Parent Portal**: Manage child profiles, customize daily practice, generate printable A4 worksheets, and track learning progress.
- **Child Portal**: Immersive problem-solving experience with an on-screen keyboard, instant feedback, and a badge reward system.

The UI is inspired by *Animal Crossing*: warm, soft colors and rounded, friendly elements make learning feel like a game.

## Feature Overview

### Child Features

<img src="screenshots/child-practice.png" alt="Child practice screen" width="600">

| Module | Description |
|--------|-------------|
| Daily Practice | Work through problems configured by parents, with on-screen keyboard input. |
| Instant Feedback | Correct/incorrect animations; wrong answers are automatically added to the mistake notebook. |
| Rewards | Claim points after finishing practice; extra rewards for streaks. |
| Badges | Unlock badges by achieving milestones to motivate continued learning. |
| Mistake Review | Review past mistakes and strengthen weak areas. |

### Parent Features

<img src="screenshots/parent-dashboard.png" alt="Parent dashboard" width="600">

| Module | Description |
|--------|-------------|
| Child Management | Add, edit, and manage multiple child profiles. |
| Practice Config | Customize daily problem count, difficulty range, operation types; supports integer/decimal modes with 1/2/3 decimal places. |
| Worksheet Generator | Auto-generate A4 math worksheets ready to print. |
| Learning Statistics | Accuracy analysis, streak tracking, and historical records. |
| AI Tutor | Smart conversation diagnostics, personalized worksheet recommendations, and study advice (optional). |

### Screenshots

<div align="center">

<img src="screenshots/login-page.png" alt="Login page" width="600">

*Login page*

<img src="screenshots/result-page.png" alt="Practice results and rewards" width="600">

*Practice results and rewards*

<img src="screenshots/paper-print.png" alt="Worksheet generation and print preview" width="600">

*Worksheet generation and print preview*

<img src="screenshots/ai-mentor.png" alt="AI tutor conversation" width="600">

*AI tutor conversation*

</div>

## Tech Stack

### System Architecture

```mermaid
graph TB
    subgraph Browser[User Browser]
        B[Chrome / Safari / Edge]
    end

    subgraph Nginx[Nginx Reverse Proxy]
        N[Container port 80:3000]
    end

    subgraph Frontend[React Frontend]
        F[React 18 + TypeScript + Vite + Tailwind CSS<br/>Animal Crossing-style UI]
        F1[Parent Portal]
        F2[Child Portal]
        F3[Shared Components]
        F --> F1
        F --> F2
        F --> F3
    end

    subgraph Backend[Node.js Backend API]
        BE[Express + TypeScript + JWT + bcryptjs]
        BE1[Controllers]
        BE2[Services]
        BE3[Middleware]
        BE --> BE1
        BE --> BE2
        BE --> BE3
    end

    subgraph Database[Database Layer]
        D1[SQLite<br/>Local / Dev<br/>Docker Volume]
        D2[PostgreSQL<br/>Production<br/>Cloud Profile]
    end

    B -->|HTTP| N
    N --> F
    F -->|REST API| BE
    BE -->|Prisma ORM| D1
    BE -->|Prisma ORM| D2
```

**Frontend**
- React 18 + TypeScript + Vite
- Tailwind CSS responsive layout
- Animal Crossing-style UI (`animal-island-ui`)
- Lucide icons

**Backend**
- Node.js 18 + Express + TypeScript
- Prisma ORM + SQLite (local) / PostgreSQL (cloud)
- JWT authentication
- bcryptjs password hashing

**Deployment**
- Docker + Docker Compose one-command deployment
- Docker Hub image hosting
- Cross-platform (Windows / macOS / Linux)

### Deployment Flow

```mermaid
graph TB
    subgraph Deploy1[Option 1: Docker Hub Images (Recommended)]
        D1_1[Developer] -->|git clone| D1_2[Server]
        D1_2 -->|docker-compose up| D1_3[Running]
        D1_2 -.->|docker pull automatically| D1_4[Docker Hub<br/>- backend<br/>- frontend]
    end

    subgraph Deploy2[Option 2: Local Build]
        D2_1[Developer] -->|git clone| D2_2[Server]
        D2_2 -->|docker-compose build| D2_3[Running]
        D2_2 -.->|local build| D2_4[Docker Build<br/>- backend<br/>- frontend]
    end

    subgraph DockerHost[Docker Host Server]
        subgraph Compose[Docker Compose Orchestration]
            subgraph Network[Docker Network app-network]
            end

            subgraph Frontend[Frontend Container]
                F1[Nginx]
                F2[React App]
                F3[Port: 80]
            end

            subgraph Backend[Backend Container]
                B1[Node.js]
                B2[Express]
                B3[Port: 5000]
            end

            Frontend --> Network
            Backend --> Network
        end

        subgraph Volumes[Docker Volumes for Persistence]
                V1[db-data database]
                V2[uploads avatars]
        end
    end
```

## Quick Start

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

### Option 1: Docker (Recommended, 5-Minute Setup)

```bash
# 1. Clone the repository
git clone https://github.com/bk4ice/KidsMathQuest.git
cd KidsMathQuest

# 2. Configure environment variables
cp .env.example .env
# Edit .env and set JWT_SECRET to a strong password

# 3. Pull the latest images first
docker pull bllxk/kidsmathquest-backend:latest
docker pull bllxk/kidsmathquest-frontend:latest

# 4. Start everything
docker-compose up

# 5. Open the app
# Parent login: http://localhost:3000/login
# Child login:  http://localhost:3000/child-login
# Backend API:  http://localhost:5000
```

> Docker will use local images if they exist, otherwise it will pull the remote images automatically.

### Option 2: Local Development

Both backend and frontend use the root `.env` file.

```bash
cp .env.example .env

# Backend
cd backend
npm install
npx prisma db push   # Run once after cloning to create the SQLite file and schema
npm run dev

# Frontend
cd ../frontend
npm install
npm run dev
```

**Database migrations** (during development):
```bash
cd backend
npx prisma db push        # Sync database after first run or schema changes
npx prisma migrate dev   # Create migrations
npx prisma studio         # Visual database management
```

### Common Commands

```bash
# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove data volumes (use with caution)
docker-compose down -v
```

### Option 3: Try It Online (socialistic.ai)

If you just want to try the worksheet generator:

[![Try KidsMathQuest on Socialistic](https://socialistic.ai/api/embed/kidsmathquest-practice-generator-57f816?lang=en)](https://socialistic.ai/en/skill/kidsmathquest-practice-generator-57f816?utm_source=github&utm_medium=readme&utm_campaign=20260601-kids-practice-toolsmiths&utm_content=badge)

[🚀 Try it online](https://socialistic.ai/en/skill/kidsmathquest-practice-generator-57f816?utm_source=github&utm_medium=readme&utm_campaign=20260601-kids-practice-toolsmiths&utm_content=hyperlink)

Great for quickly experiencing the interactive problem generator, configuration flow, and output.

## Environment Variables

### Backend `.env`

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | Service listening port |
| `FRONTEND_PORT` | No | `3000` | Frontend development / container mapping port |
| `DATABASE_URL` | Yes | - | SQLite file path (local: `file:./prisma/dev.db`; Docker overrides to `/app/prisma/dev.db`) |
| `JWT_SECRET` | **Yes** | - | **Must be changed!** JWT signing key |
| `NODE_ENV` | No | `development` | Runtime environment |
| `AI_PROVIDER` | No | `openai` | AI tutor LLM provider: `vllm` \| `openai` \| `anthropic` \| `aliyun` |
| `AI_OPENAI_BASE_URL` | No | `https://api.openai.com/v1` | OpenAI API base URL |
| `AI_OPENAI_API_KEY` | No | - | OpenAI API key |
| `AI_OPENAI_MODEL` | No | `gpt-4o-mini` | OpenAI model name |
| `AI_VLLM_BASE_URL` | No | - | vLLM self-hosted service URL |
| `AI_VLLM_API_KEY` | No | - | vLLM API key |
| `AI_VLLM_MODEL` | No | - | vLLM model name |
| `AI_ANTHROPIC_BASE_URL` | No | `https://api.anthropic.com/v1` | Anthropic API base URL |
| `AI_ANTHROPIC_API_KEY` | No | - | Anthropic API key |
| `AI_ANTHROPIC_MODEL` | No | `claude-sonnet-4-20250514` | Anthropic model name |
| `AI_ALIYUN_BASE_URL` | No | `https://dashscope.aliyuncs.com/compatible-mode/v1` | Alibaba Cloud DashScope API base URL |
| `AI_ALIYUN_API_KEY` | No | - | Alibaba Cloud API key |
| `AI_ALIYUN_MODEL` | No | `qwen3.6-plus` | Alibaba Cloud model name |
| `AI_CHAT_RETENTION_DAYS` | No | `14` | AI conversation history retention days |
| `AI_CHAT_MAX_ROUNDS` | No | `20` | Maximum AI conversation rounds |

### Notes

- The frontend no longer relies on `VITE_API_BASE_URL`; it uses relative paths `/api` and `/uploads`.
- For local development, keep `DATABASE_URL` as `file:./prisma/dev.db` so starting from the `backend` directory is stable.
- Docker reads the root `.env` and `docker-compose.yml` overrides it to the in-container path `file:/app/prisma/dev.db`.
- If you already have a `backend/prisma/dev.db`, mount it and continue using it.
- **AI tutor is optional**: if you do not configure AI environment variables, the AI tutor will not be available, but all other core features (practice, worksheet management, etc.) will work normally.

## AI Tutor Configuration

"狸学长" (Raccoon Tutor) is KidsMathQuest's intelligent learning assistant, supporting multi-turn conversations, learning diagnostics, and personalized worksheet recommendations.

### Features

- **Multi-turn conversations** with automatic history saving
- **Learning diagnostics** based on real child data
- **Worksheet recommendations** generated from diagnostic results
- **Tool calls** that query the database for real feedback
- **Streaming output** via SSE (Server-Sent Events)
- **Markdown rendering** for AI replies (headings, lists, code blocks, etc.)
- **Multi-provider support** for OpenAI, Anthropic, Alibaba Cloud DashScope, and vLLM

### Configuration Steps

1. **Choose an LLM provider**

Set `AI_PROVIDER` in `.env`:
```bash
AI_PROVIDER=openai  # Options: vllm | openai | anthropic | aliyun
```

2. **Configure the corresponding API key**

**OpenAI**:
```bash
AI_OPENAI_BASE_URL=https://api.openai.com/v1
AI_OPENAI_API_KEY=sk-your-openai-api-key
AI_OPENAI_MODEL=gpt-4o-mini
```

**Anthropic**:
```bash
AI_ANTHROPIC_BASE_URL=https://api.anthropic.com/v1
AI_ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key
AI_ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

**Alibaba Cloud DashScope**:
```bash
AI_ALIYUN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
AI_ALIYUN_API_KEY=sk-your-aliyun-api-key
AI_ALIYUN_MODEL=qwen3.6-plus
```

**vLLM self-hosted**:
```bash
AI_VLLM_BASE_URL=http://your-vllm-server:port/v1
AI_VLLM_API_KEY=your-vllm-api-key
AI_VLLM_MODEL=your-model-name
```

3. **Restart the services**

```bash
# Docker
docker-compose down
docker-compose up

# Local development
# Restart backend and frontend
```

### How to Use

1. Log in to the parent portal and click the "Ask Raccoon AI" button at the top to enter the AI tutor page.
2. Choose "General Consultation" or a specific child to start the conversation.
3. Use quick commands or type your own questions.
4. The AI will call tools to query real data and provide personalized advice.
5. The AI can recommend worksheet configurations; if you agree, they are automatically saved to "Raccoon's Recommended Configurations".

### Optional Feature Notes

- The AI tutor is **optional**; not configuring it does not affect core features.
- If not configured, the AI tutor page will show a configuration hint banner.
- OpenAI or Alibaba Cloud DashScope are recommended for the best experience.
- Conversation history is kept for 14 days by default; adjust with `AI_CHAT_RETENTION_DAYS`.
- Each conversation is limited to 20 rounds by default; adjust with `AI_CHAT_MAX_ROUNDS`.

## Project Structure

```
KidsMathQuest/
├── backend/                    # Node.js backend
│   ├── src/
│   │   ├── controllers/        # Request controllers
│   │   ├── services/           # Business logic
│   │   ├── routes/             # Route definitions
│   │   ├── middleware/         # Middleware (auth, etc.)
│   │   └── utils/              # Utilities
│   ├── prisma/
│   │   ├── schema.prisma       # Database models
│   │   └── migrations/         # Database migrations
│   ├── uploads/                # User uploads (avatars, etc.)
│   └── Dockerfile
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components
│   │   ├── contexts/           # React Context (auth, etc.)
│   │   └── services/           # API clients
│   ├── public/                 # Static assets
│   └── Dockerfile
│
├── docker-compose.yml          # Docker Compose configuration
├── .env.example               # Environment variable template
└── screenshots/               # Screenshot directory
```

## FAQ

### How do I change the ports?

**Frontend port:**
Edit `docker-compose.yml` and change the `frontend` service `ports` mapping:
```yaml
frontend:
  ports:
    - "8080:80"  # Change 8080 to your desired port
```

**Backend port:**
Update the `PORT` variable in `.env` and the `docker-compose.yml` mapping:
```yaml
backend:
  environment:
    - PORT=8000  # Change to your desired port
  ports:
    - "8000:8000"
```

Then restart:
```bash
docker-compose down
docker-compose up
```

### Will data be lost?

No. The database file is persisted through a Docker named volume (`db-data`). Restarting or rebuilding containers will not lose data. Only `docker-compose down -v` deletes the data volume.

### How do I back up data?

```bash
# Backup the SQLite database
docker cp kidsmathquest-backend-1:/app/data/dev.db ./backup.db

# Restore
docker cp ./backup.db kidsmathquest-backend-1:/app/data/dev.db
```

### How do I switch to PostgreSQL?

Refer to the "Environment Variables" section above and the "Using PostgreSQL (Optional)" notes.

### What if the database schema is out of sync?

If you see errors like `The column ... does not exist in the current database`, the schema is out of sync with the code.

**Local development:**
```bash
cd backend
npx prisma db push
```

**Docker deployment:**
```bash
# Option 1: Remove the old database volume (loses data)
docker-compose down -v
docker-compose up

# Option 2: Enter the container and sync schema manually (keeps data)
docker exec -it kidsmathquest-backend-1 npx prisma db push
```

**Cause:** The database model was updated (fields added/modified), but the local or Docker database file is still on an older version. Running the commands above syncs the schema to the latest version.

## Printing Worksheets

Here is the complete workflow for generating and printing worksheets from the parent portal:

```mermaid
flowchart TD
    A[Log in to parent portal] --> B[Go to worksheet config page]
    B --> C[Click New Config]
    C --> D[Configure worksheet parameters]
    D --> D1[Set operation steps]
    D --> D2[Set problem count]
    D --> D3[Configure each operation type and range]
    D --> D4[Set result range]
    D --> D5[Choose carry/borrow rules]
    D --> D6[Set remainder rules]
    D --> D7[Choose whether to show answers]
    D --> E[Click Add Problems]
    E --> F[Can add multiple problem sets]
    F --> G[Save config]
    G --> H[Click Generate Worksheet]
    H --> I[Preview worksheet]
    I --> J{Satisfied?}
    J -->|No| C
    J -->|Yes| K[Click Print]
    K --> L[Choose printer]
    L --> M[Print complete]
```

### Step-by-Step Instructions

1. **Log in to the parent portal**
   - Visit `http://localhost:3000/login`
   - Enter parent account and password

2. **Go to the worksheet config page**
   - From the parent dashboard, click "Worksheet Config" or "Generate Worksheet"

3. **Create a new config**
   - Click "New Config" to create a new worksheet configuration
   - Or select an existing one to edit

4. **Configure parameters**
   - **Operation steps**: choose 1-step, 2-step, or 3-step operations
   - **Problem count**: total number of problems (e.g., 20, 30, 45)
   - **Each operation**: value range and operation type (add/subtract/multiply/divide) for each step
   - **Result range**: limit the final result range
   - **Carry/borrow**: choose whether to force carrying or borrowing
   - **Remainder rule**: for division, choose whether to require no remainder
   - **Show answers**: choose whether to include answer key in the worksheet

5. **Add problems**
   - After configuring, click "Add Problems"
   - The system generates a problem set based on current parameters
   - You can click "Add Problems" multiple times to add different problem sets
   - Click "Clear Problems" to remove all added problem sets
   - **Important**: Only added problems are saved and used for child practice

6. **Save the config**
   - Click "Save" to store the current configuration
   - Optional: set as "Default Config" for the child's daily practice
   - Saving stores all added problem sets

7. **Generate the worksheet**
   - Click "Generate Worksheet"
   - The system auto-generates an A4 math worksheet based on added problem sets

8. **Preview and print**
   - Preview the worksheet, then click "Print"
   - Choose a printer and adjust settings (paper size, margins, etc.)
   - Confirm and print

### Tips

- Saved configs can be reused; no need to reconfigure every time
- **Important**: You must click "Add Problems" after configuring parameters for the problems to take effect
- You can click "Add Problems" multiple times for different problem sets
- Child daily practice uses the added problem list, same logic as printed worksheets
- Always preview before printing to check difficulty and count
- Save multiple configs for children of different ages
- Generating a worksheet also saves it to history for easy review

## Usage Examples

The following 6 examples show common worksheet configurations and how to set them up in the parent portal.

> For decimal problems, first switch to "Decimal Mode" in the practice config and choose 1 / 2 / 3 decimal places; both auto-generated and manually added problems will use this precision.

### Example 1: Addition and Subtraction Within 100

**Scenario**: 1st grade, basic addition and subtraction practice

```mermaid
flowchart TD
    A[Log in to parent portal] --> B[Go to worksheet config page]
    B --> C[Click New Config]
    C --> D[Configure parameters]
    D --> D1[Operation steps: 1-step]
    D --> D2[Problem count: 30]
    D --> D3[Term 1: 1-99, addition/subtraction]
    D --> D4[Result range: 0-100]
    D --> D5[Carry/borrow: random]
    D --> D6[Remainder: no remainder]
    D --> D7[Show answers: no]
    D --> E[Click Add Problems]
    E --> F[Save config]
    F --> G[Generate worksheet]
    G --> H[Preview/Print]
```

**Steps**:
1. Go to "Worksheet Config"
2. Click "New Config"
3. Configure:
   - Operation steps: 1-step
   - Problem count: 30
   - Term 1: min 1, max 99, operators `+ (addition)` and `- (subtraction)`
   - Result range: min 0, max 100
   - Carry/borrow: random (allow both)
   - Remainder: no remainder
   - Show answers: no
4. Click "Add Problems" (important!)
5. Click "Save Config"
6. Click "Generate Worksheet" to preview or print

**Sample output**:
```
45 + 23 = ?
78 - 15 = ?
56 + 34 = ?
```

---

### Example 2: Mixed Operations with Parentheses

**Scenario**: 3rd grade, practicing operation order

```mermaid
flowchart TD
    A[Go to worksheet config page] --> B[Click New Config]
    B --> C[Configure parameters]
    C --> C1[Operation steps: 2-step]
    C --> C2[Problem count: 20]
    C --> C3[Enable parentheses: yes]
    C --> C4[Term 1: 1-20, addition/subtraction]
    C --> C5[Term 2: 1-20, multiplication]
    C --> C6[Result range: 1-100]
    C --> C7[Carry/borrow: random]
    C --> C8[Remainder: no remainder]
    C --> D[Click Add Problems]
    D --> E[Save config]
    E --> F[Generate worksheet]
```

**Steps**:
1. Go to "Worksheet Config"
2. Click "New Config"
3. Configure:
   - Operation steps: 2-step
   - Problem count: 20
   - Enable parentheses: checked
   - Term 1: min 1, max 20, operators `+ (addition)` and `- (subtraction)`
   - Term 2: min 1, max 20, operator `× (multiplication)`
   - Result range: min 1, max 100
   - Carry/borrow: random
   - Remainder: no remainder
4. Click "Add Problems"
5. Click "Save Config"
6. Click "Generate Worksheet"

**Sample output**:
```
(5 + 3) × 4 = ?
(12 - 4) × 2 = ?
(6 + 7) × 3 = ?
```

---

### Example 3: Multiplication Table Practice

**Scenario**: Reinforce multiplication facts

```mermaid
flowchart TD
    A[Go to worksheet config page] --> B[Click New Config]
    B --> C[Configure parameters]
    C --> C1[Operation steps: 1-step]
    C --> C2[Problem count: 45<br/>Covers all 1-9 combinations]
    C --> C3[Term 1: 1-9, multiplication]
    C --> C4[Result range: 1-81]
    C --> C5[Remainder: no remainder]
    C --> D[Click Add Problems]
    D --> E[Save config]
    E --> F[Generate worksheet]
```

**Steps**:
1. Go to "Worksheet Config"
2. Click "New Config"
3. Configure:
   - Operation steps: 1-step
   - Problem count: 45 (covers all 1–9 combinations)
   - Term 1: min 1, max 9, operator `× (multiplication)`
   - Result range: min 1, max 81
   - Remainder: no remainder
4. Click "Add Problems"
5. Click "Save Config"
6. Click "Generate Worksheet"

**Sample output**:
```
3 × 7 = ?
8 × 6 = ?
9 × 4 = ?
```

---

### Example 4: Simple Division (No Remainder)

**Scenario**: Basic division practice

```mermaid
flowchart TD
    A[Go to worksheet config page] --> B[Click New Config]
    B --> C[Configure parameters]
    C --> C1[Operation steps: 1-step]
    C --> C2[Problem count: 30]
    C --> C3[Term 1: 2-81, division]
    C --> C4[Result range: 1-9<br/>Ensure quotient between 1-9]
    C --> C5[Remainder: no remainder<br/>Ensure clean division]
    C --> C6[Show answers: yes<br/>Convenient for parents to grade]
    C --> D[Click Add Problems]
    D --> E[Save config]
    E --> F[Generate worksheet]
```

**Steps**:
1. Go to "Worksheet Config"
2. Click "New Config"
3. Configure:
   - Operation steps: 1-step
   - Problem count: 30
   - Term 1: min 2, max 81, operator `÷ (division)`
   - Result range: min 1, max 9 (ensure quotient is 1–9)
   - Remainder: no remainder (ensure clean division)
   - Show answers: yes (convenient for parents)
4. Click "Add Problems"
5. Click "Save Config"
6. Click "Generate Worksheet"

**Sample output**:
```
24 ÷ 4 = ?
45 ÷ 5 = ?
63 ÷ 7 = ?
```

---

### Example 5: Three-Step Mixed Operations Challenge

**Scenario**: Upper elementary, comprehensive operation training

```mermaid
flowchart TD
    A[Go to worksheet config page] --> B[Click New Config]
    B --> C[Configure parameters]
    C --> C1[Operation steps: 3-step]
    C --> C2[Problem count: 15]
    C --> C3[Enable parentheses: yes]
    C --> C4[Term 1: 1-50, addition/subtraction]
    C --> C5[Term 2: 1-10, multiplication/division]
    C --> C6[Term 3: 1-20, addition/subtraction]
    C --> C7[Result range: 0-200]
    C --> C8[Remainder: no remainder]
    C --> C9[Carry/borrow: random]
    C --> D[Click Add Problems]
    D --> E[Save config]
    E --> F[Generate worksheet]
```

**Steps**:
1. Go to "Worksheet Config"
2. Click "New Config"
3. Configure:
   - Operation steps: 3-step
   - Problem count: 15
   - Enable parentheses: checked
   - Term 1: min 1, max 50, operators `+` and `-`
   - Term 2: min 1, max 10, operators `×` and `÷`
   - Term 3: min 1, max 20, operators `+` and `-`
   - Result range: min 0, max 200
   - Remainder: no remainder
   - Carry/borrow: random
4. Click "Add Problems"
5. Click "Save Config"
6. Click "Generate Worksheet"

**Sample output**:
```
12 + 5 × 3 - 8 = ?
(25 - 10) ÷ 5 + 7 = ?
8 × 4 + 15 ÷ 3 = ?
```

---

### Example 6: Decimal Addition and Subtraction

**Scenario**: Upper elementary, decimal operation and place-value alignment

```mermaid
flowchart TD
    A[Go to worksheet config page] --> B[Click New Config]
    B --> C[Configure parameters]
    C --> C1[Operation steps: 1-step]
    C --> C2[Operation mode: decimal mode]
    C --> C3[Decimal places: 2]
    C --> C4[Problem count: 20]
    C --> C5[Term 1: 0.10-9.99, addition/subtraction]
    C --> C6[Result range: 0.00-20.00]
    C --> C7[Carry/borrow: random]
    C --> C8[Show answers: no]
    C --> D[Click Add Problems]
    D --> E[Save config]
    E --> F[Generate worksheet]
```

**Steps**:
1. Go to "Worksheet Config"
2. Click "New Config"
3. Configure:
   - Operation steps: 1-step
   - Operation mode: decimal mode
   - Decimal places: 2
   - Problem count: 20
   - Term 1: min 0.10, max 9.99, operators `+` and `-`
   - Result range: min 0.00, max 20.00
   - Carry/borrow: random
   - Show answers: no
4. Click "Add Problems"
5. Click "Save Config"
6. Click "Generate Worksheet" to preview or print

**Sample output**:
```
3.25 + 1.40 = ?
8.70 - 2.15 = ?
0.85 + 4.30 = ?
```

---

**Tip**: After saving, you can set a config as the "Default Config" so the child's daily practice automatically uses it.

## Default Accounts

After the first run, visit `http://localhost:3000/register` to create a parent account. Once logged in, you can add child accounts from the parent portal and start using the app.

## Contributing

Issues and Pull Requests are welcome!

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/xxx`
3. Commit your changes: `git commit -m 'Add xxx'`
4. Push the branch: `git push origin feature/xxx`
5. Open a Pull Request

## Acknowledgements

This project is inspired and supported by the following excellent open-source projects:

- **[animal-island-ui](https://github.com/guokaigdg/animal-island-ui)** — The design inspiration for this project's warm and cute *Animal Crossing*-style UI, providing great inspiration for the child portal.
- **[PrimarySchoolMathematics](https://github.com/bosichong/PrimarySchoolMathematics)** — A reference implementation for elementary school math problem generation, providing foundational ideas for worksheet generation and practice algorithms.

## Security Notes

1. **You must change `JWT_SECRET` for production** to a strong random value.
2. **Never commit `.env` files** to version control.
3. Enable HTTPS for production deployments.
4. Regularly update dependencies to fix security vulnerabilities.

## License

[MIT](LICENSE) © bllxk

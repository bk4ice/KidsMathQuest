# KidsMathQuest

<div align="center">

<img src="screenshots/banner.png" alt="项目 Banner" width="300">

**一个给小学生练习加减乘除的web应用，可以定制化自动生成计算题练习。顺便靠AI把前端做的好看点，就是为了能让孩子能每天多练几题……**

[![Docker Hub](https://img.shields.io/badge/Docker%20Hub-bllxk%2Fkidsmathquest-blue?logo=docker)](https://hub.docker.com/r/bllxk/kidsmathquest-backend)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18-339933?logo=nodedotjs)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

## 📢 News

**2026-06-06** 🤖 **新增 AI 导师功能** — 集成智能 AI 导师"狸学长"，支持多轮对话、学习诊断、个性化试卷推荐。支持 OpenAI、Anthropic、阿里云 DashScope、vLLM 等多种 LLM 提供商。采用 SSE 流式输出，支持 Markdown 格式渲染。AI 功能为可选配置，不影响核心练习功能使用。详见 [AI 导师配置说明](#ai-导师配置)。

---

## 目录

- [KidsMathQuest](#kidsmathquest)
  - [目录](#目录)
  - [项目介绍](#项目介绍)
  - [功能预览](#功能预览)
    - [儿童端功能](#儿童端功能)
    - [家长端功能](#家长端功能)
    - [应用截图](#应用截图)
  - [技术架构](#技术架构)
    - [系统架构图](#系统架构图)
    - [部署流程图](#部署流程图)
  - [快速开始](#快速开始)
    - [前置要求](#前置要求)
    - [方式一：Docker 启动（推荐，5 分钟启动）](#方式一docker-启动推荐5-分钟启动)
    - [方式二：本地开发](#方式二本地开发)
    - [常用命令](#常用命令)
    - [方式三：在线体验（socialistic.ai）](#方式三在线体验socialisticai)
  - [环境变量](#环境变量)
    - [后端 `.env`](#后端-env)
    - [说明](#说明)
  - [AI 导师配置](#ai-导师配置)
    - [功能特性](#功能特性)
    - [配置步骤](#配置步骤)
    - [使用方法](#使用方法)
    - [可选功能说明](#可选功能说明)
  - [项目结构](#项目结构)
  - [常见问题 (FAQ)](#常见问题-faq)
    - [如何修改端口？](#如何修改端口)
    - [数据会丢失吗？](#数据会丢失吗)
    - [如何备份数据？](#如何备份数据)
    - [如何切换到 PostgreSQL？](#如何切换到-postgresql)
    - [数据库 Schema 不同步怎么办？](#数据库-schema-不同步怎么办)
  - [打印试卷流程](#打印试卷流程)
    - [操作步骤说明](#操作步骤说明)
    - [提示](#提示)
  - [使用示例](#使用示例)
    - [示例 1：100 以内加减法练习](#示例-1100-以内加减法练习)
    - [示例 2：带括号的混合运算](#示例-2带括号的混合运算)
    - [示例 3：九九乘法表练习](#示例-3九九乘法表练习)
    - [示例 4：简单除法（整除）练习](#示例-4简单除法整除练习)
    - [示例 5：三步混合运算挑战](#示例-5三步混合运算挑战)
    - [示例 6：小数加减练习](#示例-6小数加减练习)
  - [默认账号](#默认账号)
  - [参与贡献](#参与贡献)
  - [致谢](#致谢)
  - [安全提示](#安全提示)
  - [许可证](#许可证)

## 项目介绍

KidsMathQuest 是一个面向 6-12 岁儿童的数学学习应用，采用**家长端 + 儿童端**双端分离设计：

- **家长端**：管理孩子信息、定制每日练习、生成可打印试卷、追踪学习进度
- **儿童端**：沉浸式答题体验、虚拟键盘支持、即时反馈、徽章激励系统

设计风格灵感来自《动物森友会》，采用温暖柔和的配色与圆润可爱的 UI 元素，让学习像游戏一样有趣。

## 功能预览

### 儿童端功能

<img src="screenshots/child-practice.png" alt="儿童端答题界面" width="600">

| 功能模块 | 说明 |
|---------|------|
| 每日练习 | 根据家长配置的题目列表进行练习，支持虚拟键盘输入 |
| 即时反馈 | 答对/答错动画反馈，答错自动收录至错题本 |
| 结算领奖 | 完成练习后领取积分，连续打卡有额外奖励 |
| 徽章系统 | 达成成就解锁徽章，激励持续学习 |
| 错题复习 | 针对性复习历史错题，巩固薄弱环节 |

### 家长端功能

<img src="screenshots/parent-dashboard.png" alt="家长端仪表盘" width="600">

| 功能模块 | 说明 |
|---------|------|
| 儿童管理 | 添加、编辑、管理多个孩子的学习档案 |
| 练习配置 | 自定义每日题目数量、难度范围、运算类型，支持整数/小数模式与 1/2/3 位小数 |
| 试卷生成 | 自动生成 A4 数学试卷，支持打印 |
| 学习统计 | 正确率分析、连续打卡天数、历史记录追踪 |
| AI 导师 | 智能对话诊断、个性化试卷推荐、学习建议（可选功能） |

### 应用截图

<div align="center">

<img src="screenshots/login-page.png" alt="登录页面" width="600">

*登录页面*

<img src="screenshots/result-page.png" alt="练习结果与奖励" width="600">

*练习结果与奖励*

<img src="screenshots/paper-print.png" alt="试卷生成与打印预览" width="600">

*试卷生成与打印预览*

<img src="screenshots/ai-mentor.png" alt="AI 导师对话界面" width="600">

*AI 导师对话界面*

</div>

## 技术架构

### 系统架构图

```mermaid
graph TB
    subgraph Browser[用户浏览器]
        B[Chrome / Safari / Edge]
    end
    
    subgraph Nginx[Nginx 反向代理]
        N[容器端口 80:3000]
    end
    
    subgraph Frontend[React 前端应用]
        F[React 18 + TypeScript + Vite + Tailwind CSS<br/>动物森友会风格 UI]
        F1[家长端]
        F2[儿童端]
        F3[共享组件]
        F --> F1
        F --> F2
        F --> F3
    end
    
    subgraph Backend[Node.js 后端 API]
        BE[Express + TypeScript + JWT + bcryptjs]
        BE1[Controllers]
        BE2[Services]
        BE3[Middleware]
        BE --> BE1
        BE --> BE2
        BE --> BE3
    end
    
    subgraph Database[数据库层]
        D1[SQLite 本地<br/>开发环境<br/>Docker Volume]
        D2[PostgreSQL<br/>生产环境<br/>Cloud Profile]
    end
    
    B -->|HTTP| N
    N --> F
    F -->|REST API| BE
    BE -->|Prisma ORM| D1
    BE -->|Prisma ORM| D2
```

**前端技术栈**
- React 18 + TypeScript + Vite
- Tailwind CSS 响应式布局
- 动物森友会风格 UI（animal-island-ui）
- Lucide 图标库

**后端技术栈**
- Node.js 18 + Express + TypeScript
- Prisma ORM + SQLite（本地）/ PostgreSQL（云端）
- JWT 身份认证
- bcryptjs 密码加密

**部署方式**
- Docker + Docker Compose 一键部署
- Docker Hub 镜像托管
- 跨平台支持（Windows / macOS / Linux）

### 部署流程图

```mermaid
graph TB
    subgraph Deploy1[方式一：Docker Hub 镜像部署（推荐）]
        D1_1[开发者] -->|git clone| D1_2[服务器]
        D1_2 -->|docker-compose up| D1_3[运行中]
        D1_2 -.->|docker pull 自动| D1_4[Docker Hub<br/>- backend<br/>- frontend]
    end
    
    subgraph Deploy2[方式二：本地构建部署]
        D2_1[开发者] -->|git clone| D2_2[服务器]
        D2_2 -->|docker-compose build| D2_3[运行中]
        D2_2 -.->|本地构建| D2_4[Docker Build<br/>- backend<br/>- frontend]
    end
    
    subgraph DockerHost[Docker Host 服务器]
        subgraph Compose[Docker Compose 编排]
            subgraph Network[Docker Network app-network]
            end
            
            subgraph Frontend[Frontend 容器]
                F1[Nginx]
                F2[React App]
                F3[Port: 80]
            end
            
            subgraph Backend[Backend 容器]
                B1[Node.js]
                B2[Express]
                B3[Port: 5000]
            end
            
            Frontend --> Network
            Backend --> Network
        end
        
        subgraph Volumes[Docker Volumes 数据持久化]
                V1[db-data 数据库]
                V2[uploads 头像上传]
        end
    end
```

## 快速开始

### 前置要求

- Docker 20.10+
- Docker Compose 2.0+

### 方式一：Docker 启动（推荐，5 分钟启动）

```bash
# 1. 克隆项目
git clone https://github.com/bk4ice/KidsMathQuest.git
cd KidsMathQuest

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，修改 JWT_SECRET 为强密码

# 3. 优先拉取线上镜像
docker pull bllxk/kidsmathquest-backend:latest
docker pull bllxk/kidsmathquest-frontend:latest

# 4. 一键启动
docker-compose up

# 5. 访问应用
# 家长端登录：http://localhost:3000/login
# 儿童端登录：http://localhost:3000/child-login
# 后端 API：http://localhost:5000
```

> 如果你本地已经有这两个镜像，Docker 会直接使用本地镜像；如果没有，就会先尝试拉取线上镜像。

### 方式二：本地开发

后端和前端都使用同一个根目录 `.env`。

```bash
cp .env.example .env

# 后端
cd backend
npm install
npx prisma db push   # 第一次拉代码后先执行，创建 SQLite 文件和表结构
npm run dev

# 前端
cd ../frontend
npm install
npm run dev
```

**数据库迁移**（开发时）：
```bash
cd backend
npx prisma db push        # 首次运行或 schema 变更后同步数据库
npx prisma migrate dev   # 创建迁移
npx prisma studio         # 可视化数据库管理
```

### 常用命令

```bash
# 后台运行
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 停止并删除数据卷（谨慎使用）
docker-compose down -v
```

### 方式三：在线体验（socialistic.ai）

如果只是想测试题目的生成功能可以试试

[![Try KidsMathQuest on Socialistic](https://socialistic.ai/api/embed/kidsmathquest-practice-generator-57f816?lang=zh)](https://socialistic.ai/zh/skill/kidsmathquest-practice-generator-57f816?utm_source=github&utm_medium=readme&utm_campaign=20260601-kids-practice-toolsmiths&utm_content=badge)

[🚀 在线试一下](https://socialistic.ai/zh/skill/kidsmathquest-practice-generator-57f816?utm_source=github&utm_medium=readme&utm_campaign=20260601-kids-practice-toolsmiths&utm_content=hyperlink)

适合快速体验交互式的出题功能，感受配置流程和出题效果。

## 环境变量

### 后端 `.env`

| 变量名 | 必填 | 默认值 | 说明 |
|--------|------|--------|------|
| `PORT` | 否 | `5000` | 服务监听端口 |
| `FRONTEND_PORT` | 否 | `3000` | 前端开发/容器映射端口 |
| `DATABASE_URL` | 是 | - | SQLite 文件路径（本地建议 `file:./prisma/dev.db`，Docker 会覆盖为 `/app/prisma/dev.db`） |
| `JWT_SECRET` | **是** | - | **必须修改！** JWT 签名密钥 |
| `NODE_ENV` | 否 | `development` | 运行环境 |
| `AI_PROVIDER` | 否 | `openai` | AI 导师 LLM 提供商：`vllm` | `openai` | `anthropic` | `aliyun` |
| `AI_OPENAI_BASE_URL` | 否 | `https://api.openai.com/v1` | OpenAI API 地址 |
| `AI_OPENAI_API_KEY` | 否 | - | OpenAI API Key |
| `AI_OPENAI_MODEL` | 否 | `gpt-4o-mini` | OpenAI 模型名称 |
| `AI_VLLM_BASE_URL` | 否 | - | vLLM 自部署服务地址 |
| `AI_VLLM_API_KEY` | 否 | - | vLLM API Key |
| `AI_VLLM_MODEL` | 否 | - | vLLM 模型名称 |
| `AI_ANTHROPIC_BASE_URL` | 否 | `https://api.anthropic.com/v1` | Anthropic API 地址 |
| `AI_ANTHROPIC_API_KEY` | 否 | - | Anthropic API Key |
| `AI_ANTHROPIC_MODEL` | 否 | `claude-sonnet-4-20250514` | Anthropic 模型名称 |
| `AI_ALIYUN_BASE_URL` | 否 | `https://dashscope.aliyuncs.com/compatible-mode/v1` | 阿里云 DashScope API 地址 |
| `AI_ALIYUN_API_KEY` | 否 | - | 阿里云 API Key |
| `AI_ALIYUN_MODEL` | 否 | `qwen3.6-plus` | 阿里云模型名称 |
| `AI_CHAT_RETENTION_DAYS` | 否 | `14` | AI 对话历史保留天数 |
| `AI_CHAT_MAX_ROUNDS` | 否 | `20` | AI 对话最大轮数 |

### 说明

- 前端不再依赖 `VITE_API_BASE_URL`，统一使用相对路径 `/api` 和 `/uploads`
- 本地开发时，`DATABASE_URL` 保持相对路径 `file:./prisma/dev.db`，这样从 `backend` 目录启动最稳定
- Docker 会读取根目录 `.env`，并在 `docker-compose.yml` 中覆盖为容器内路径 `file:/app/prisma/dev.db`
- 如果你已经有现成的 `backend/prisma/dev.db`，直接挂载后就能继续使用
- **AI 导师功能为可选配置**：如果不配置 AI 相关环境变量，AI 导师功能将不可用，但不影响项目的其他核心功能（练习、试卷管理等）正常使用

## AI 导师配置

AI 导师"狸学长"是 KidsMathQuest 的智能学习助手，支持多轮对话、学习诊断、个性化试卷推荐等功能。

### 功能特性

- **多轮对话**：支持连续对话，自动保存对话历史
- **学习诊断**：分析孩子的学习数据，提供个性化建议
- **试卷推荐**：根据诊断结果自动生成个性化试卷配置
- **工具调用**：集成数据库查询工具，提供真实数据反馈
- **流式输出**：采用 SSE（Server-Sent Events）实现实时流式响应
- **Markdown 支持**：AI 回复支持 Markdown 格式渲染（标题、列表、代码块等）
- **多提供商支持**：支持 OpenAI、Anthropic、阿里云 DashScope、vLLM 等多种 LLM

### 配置步骤

1. **选择 LLM 提供商**

在 `.env` 文件中设置 `AI_PROVIDER`：
```bash
AI_PROVIDER=openai  # 可选: vllm | openai | anthropic | aliyun
```

2. **配置对应的 API Key**

根据选择的提供商配置相应的环境变量：

**OpenAI 配置**：
```bash
AI_OPENAI_BASE_URL=https://api.openai.com/v1
AI_OPENAI_API_KEY=sk-your-openai-api-key
AI_OPENAI_MODEL=gpt-4o-mini
```

**Anthropic 配置**：
```bash
AI_ANTHROPIC_BASE_URL=https://api.anthropic.com/v1
AI_ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key
AI_ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

**阿里云 DashScope 配置**：
```bash
AI_ALIYUN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
AI_ALIYUN_API_KEY=sk-your-aliyun-api-key
AI_ALIYUN_MODEL=qwen3.6-plus
```

**vLLM 自部署配置**：
```bash
AI_VLLM_BASE_URL=http://your-vllm-server:port/v1
AI_VLLM_API_KEY=your-vllm-api-key
AI_VLLM_MODEL=your-model-name
```

3. **重启服务**

```bash
# Docker 部署
docker-compose down
docker-compose up

# 本地开发
# 后端和前端重启即可
```

### 使用方法

1. 登录家长端后，点击顶部"咨询狸学长 AI"按钮进入 AI 导师页面
2. 选择"综合咨询"或具体的孩子进行对话
3. 可以使用快速指令或自由输入问题
4. AI 会调用工具查询真实数据，提供个性化建议
5. 对话中 AI 可以推荐试卷配置，同意后会自动保存到"狸学长推荐配置"

### 可选功能说明

- AI 导师功能为**可选配置**，不配置不影响核心功能使用
- 未配置时进入 AI 导师页面会显示配置提示横幅
- 建议使用 OpenAI 或阿里云 DashScope 以获得最佳体验
- 对话历史默认保留 14 天，可通过 `AI_CHAT_RETENTION_DAYS` 调整
- 单次对话默认最多 20 轮，可通过 `AI_CHAT_MAX_ROUNDS` 调整

## 项目结构

```
KidsMathQuest/
├── backend/                    # Node.js 后端服务
│   ├── src/
│   │   ├── controllers/        # 请求控制器
│   │   ├── services/           # 业务逻辑层
│   │   ├── routes/             # 路由定义
│   │   ├── middleware/         # 中间件（认证等）
│   │   └── utils/              # 工具函数
│   ├── prisma/
│   │   ├── schema.prisma       # 数据库模型定义
│   │   └── migrations/         # 数据库迁移文件
│   ├── uploads/                # 用户上传文件（头像等）
│   └── Dockerfile
│
├── frontend/                   # React 前端应用
│   ├── src/
│   │   ├── components/         # 可复用 UI 组件
│   │   ├── pages/              # 页面组件
│   │   ├── contexts/           # React Context（认证等）
│   │   └── services/           # API 封装
│   ├── public/                 # 静态资源（图片、字体）
│   └── Dockerfile
│
├── docker-compose.yml          # Docker Compose 配置
├── .env.example               # 环境变量模板
└── screenshots/               # 【截图存放目录】
```

## 常见问题 (FAQ)

### 如何修改端口？

**前端端口修改**：
编辑 `docker-compose.yml`，修改 `frontend` 服务的 `ports` 映射：
```yaml
frontend:
  ports:
    - "8080:80"  # 将 8080 改为你想要的端口
```

**后端端口修改**：
修改 `.env` 文件中的 `PORT` 变量，同时更新 `docker-compose.yml` 中的端口映射：
```yaml
backend:
  environment:
    - PORT=8000  # 修改为想要的端口
  ports:
    - "8000:8000"
```

修改后需要重启服务：
```bash
docker-compose down
docker-compose up
```

### 数据会丢失吗？

不会。数据库文件通过 Docker named volume (`db-data`) 持久化存储，容器重启或重建不会丢失数据。只有执行 `docker-compose down -v` 时才会删除数据卷。

### 如何备份数据？

```bash
# 备份 SQLite 数据库
docker cp kidsmathquest-backend-1:/app/data/dev.db ./backup.db

# 恢复
docker cp ./backup.db kidsmathquest-backend-1:/app/data/dev.db
```

### 如何切换到 PostgreSQL？

参考「环境变量」章节中的「使用 PostgreSQL（可选）」部分。

### 数据库 Schema 不同步怎么办？

如果遇到类似 `The column ... does not exist in the current database` 的错误，说明数据库 schema 与代码不同步。

**本地开发环境**：
```bash
cd backend
npx prisma db push
```

**Docker 部署环境**：
```bash
# 方案1：删除旧数据库 volume（会丢失数据）
docker-compose down -v
docker-compose up

# 方案2：进入容器手动同步 schema（保留数据）
docker exec -it kidsmathquest-backend-1 npx prisma db push
```

**原因**：当代码更新了数据库模型（添加/修改字段），但本地或 Docker 中的数据库文件还是旧版本时，就会出现 schema 不匹配。运行上述命令可将数据库 schema 同步到最新版本。

## 打印试卷流程

以下是在家长端生成并打印试卷的完整操作流程：

```mermaid
flowchart TD
    A[登录家长端] --> B[进入试卷配置页面]
    B --> C[点击新建配置]
    C --> D[配置试卷参数]
    D --> D1[设置运算步数]
    D --> D2[设置题目数量]
    D --> D3[配置每项运算类型和范围]
    D --> D4[设置结果范围]
    D --> D5[选择进位/退位规则]
    D --> D6[设置余数规则]
    D --> D7[选择是否显示答案]
    D --> E[点击添加题目]
    E --> F[可重复添加多次]
    F --> G[保存配置]
    G --> H[点击生成试卷]
    H --> I[预览试卷内容]
    I --> J{是否满意}
    J -->|否| C
    J -->|是| K[点击打印按钮]
    K --> L[选择打印机]
    L --> M[打印完成]
```

### 操作步骤说明

1. **登录家长端**
   - 访问 `http://localhost:3000/login`
   - 输入家长账号和密码登录

2. **进入试卷配置页面**
   - 登录后进入家长端仪表盘
   - 点击"试卷配置"或"生成试卷"菜单

3. **新建配置**
   - 点击"新建配置"按钮创建新的试卷配置
   - 或选择已有配置进行编辑

4. **配置试卷参数**
   - **运算步数**：选择一步、两步或三步运算
   - **题目数量**：设置生成的题目总数（如 20、30、45 等）
   - **每项运算**：配置每个运算项的数值范围和运算类型（加/减/乘/除）
   - **结果范围**：限制最终结果的范围
   - **进位/退位**：选择是否强制进位或退位
   - **余数规则**：对于除法运算，设置是否要求整除
   - **显示答案**：选择是否在试卷中显示参考答案

5. **添加题目**
   - 配置参数后，点击"添加题目"按钮
   - 系统会根据当前配置生成一份题目配置
   - 可重复点击"添加题目"多次，添加多份不同的题目配置
   - 点击"清空题目"可清除已添加的所有题目
   - **重要**：只有添加的题目才会被保存并用于儿童端练习

6. **保存配置**
   - 点击"保存"按钮保存当前配置
   - 可选：设置为"默认配置"，供儿童端每日练习使用
   - 保存时会保存所有已添加的题目配置

7. **生成试卷**
   - 点击"生成试卷"按钮
   - 系统根据已添加的题目配置自动生成 A4 格式的数学试卷

8. **预览和打印**
   - 预览试卷内容，确认无误后点击"打印"
   - 选择打印机，调整打印设置（纸张大小、边距等）
   - 点击确认打印

### 提示

- 配置保存后可重复使用，无需每次重新设置
- **重要**：配置参数后必须点击"添加题目"按钮，题目才会被保存并生效
- 可重复点击"添加题目"多次，添加多份不同的题目配置
- 儿童端练习会使用已添加的题目列表，与打印试卷使用相同的逻辑
- 打印前建议先预览，确认题目难度和数量合适
- 可以为不同年龄段的孩子保存多套配置
- 生成试卷的同时会自动保存到历史记录，方便查看

## 使用示例

以下展示6个常见的试卷配置场景，说明在家长端的具体操作流程。

> 如果需要出小数题，先在「练习配置」里切换为小数模式，再选择 1 / 2 / 3 位小数；自动生成题目和手动添加题目都会按这个精度处理。

### 示例 1：100 以内加减法练习

**适用场景**：小学一年级，练习基础加减法运算

```mermaid
flowchart TD
    A[登录家长端] --> B[进入试卷配置页面]
    B --> C[点击新建配置]
    C --> D[配置参数]
    D --> D1[运算步数: 一步运算]
    D --> D2[题目数量: 30]
    D --> D3[第1项: 1-99, 加法/减法]
    D --> D4[结果范围: 0-100]
    D --> D5[进位/退位: 随机]
    D --> D6[余数设置: 结果整除]
    D --> D7[显示答案: 否]
    D --> E[点击添加题目]
    E --> F[保存配置]
    F --> G[生成试卷]
    G --> H[预览/打印]
```

**操作步骤**：
1. 进入「试卷配置」页面
2. 点击「新建配置」
3. 配置参数：
   - 运算步数：选择「一步运算」
   - 题目数量：设置为 30
   - 公式配置：第1项最小值 1，最大值 99，运算符选择 `+(加法)` 和 `-(减法)`
   - 结果范围：最小值 0，最大值 100
   - 进位/退位：选择「随机」（允许进位和退位）
   - 余数设置：选择「结果整除」
   - 是否显示答案：选择「不显示」
4. 点击「添加题目」按钮（重要！）
5. 点击「保存配置」
6. 点击「生成试卷」即可预览或打印

**生成题目示例**：
```
45 + 23 = ?
78 - 15 = ?
56 + 34 = ?
```

---

### 示例 2：带括号的混合运算

**适用场景**：小学三年级，练习混合运算顺序

```mermaid
flowchart TD
    A[进入试卷配置页面] --> B[点击新建配置]
    B --> C[配置参数]
    C --> C1[运算步数: 两步运算]
    C --> C2[题目数量: 20]
    C --> C3[启用括号: 是]
    C --> C4[第1项: 1-20, 加法/减法]
    C --> C5[第2项: 1-20, 乘法]
    C --> C6[结果范围: 1-100]
    C --> C7[进位/退位: 随机]
    C --> C8[余数设置: 结果整除]
    C --> D[点击添加题目]
    D --> E[保存配置]
    E --> F[生成试卷]
```

**操作步骤**：
1. 进入「试卷配置」页面
2. 点击「新建配置」
3. 配置参数：
   - 运算步数：选择「两步运算」
   - 题目数量：设置为 20
   - 启用括号：勾选「启用括号」
   - 公式配置：
     - 第1项：最小值 1，最大值 20，运算符选择 `+(加法)` 和 `-(减法)`
     - 第2项：最小值 1，最大值 20，运算符选择 `×(乘法)`
   - 结果范围：最小值 1，最大值 100
   - 进位/退位：选择「随机」
   - 余数设置：选择「结果整除」
4. 点击「添加题目」按钮（重要！）
5. 点击「保存配置」
6. 点击「生成试卷」

**生成题目示例**：
```
(5 + 3) × 4 = ?
(12 - 4) × 2 = ?
(6 + 7) × 3 = ?
```

---

### 示例 3：九九乘法表练习

**适用场景**：巩固乘法口诀

```mermaid
flowchart TD
    A[进入试卷配置页面] --> B[点击新建配置]
    B --> C[配置参数]
    C --> C1[运算步数: 一步运算]
    C --> C2[题目数量: 45<br/>覆盖1-9所有组合]
    C --> C3[第1项: 1-9, 乘法]
    C --> C4[结果范围: 1-81]
    C --> C5[余数设置: 结果整除]
    C --> D[点击添加题目]
    D --> E[保存配置]
    E --> F[生成试卷]
```

**操作步骤**：
1. 进入「试卷配置」页面
2. 点击「新建配置」
3. 配置参数：
   - 运算步数：选择「一步运算」
   - 题目数量：设置为 45（覆盖 1-9 所有组合）
   - 公式配置：第1项最小值 1，最大值 9，运算符选择 `×(乘法)`
   - 结果范围：最小值 1，最大值 81
   - 余数设置：选择「结果整除」
4. 点击「添加题目」按钮（重要！）
5. 点击「保存配置」
6. 点击「生成试卷」

**生成题目示例**：
```
3 × 7 = ?
8 × 6 = ?
9 × 4 = ?
```

---

### 示例 4：简单除法（整除）练习

**适用场景**：练习基础除法

```mermaid
flowchart TD
    A[进入试卷配置页面] --> B[点击新建配置]
    B --> C[配置参数]
    C --> C1[运算步数: 一步运算]
    C --> C2[题目数量: 30]
    C --> C3[第1项: 2-81, 除法]
    C --> C4[结果范围: 1-9<br/>确保商在1-9之间]
    C --> C5[余数设置: 结果整除<br/>确保能整除]
    C --> C6[显示答案: 是<br/>方便家长批改]
    C --> D[点击添加题目]
    D --> E[保存配置]
    E --> F[生成试卷]
```

**操作步骤**：
1. 进入「试卷配置」页面
2. 点击「新建配置」
3. 配置参数：
   - 运算步数：选择「一步运算」
   - 题目数量：设置为 30
   - 公式配置：第1项最小值 2，最大值 81，运算符选择 `÷(除法)`
   - 结果范围：最小值 1，最大值 9（确保商在 1-9 之间）
   - 余数设置：选择「结果整除」（确保能整除）
   - 是否显示答案：选择「显示答案」（方便家长批改）
4. 点击「添加题目」按钮（重要！）
5. 点击「保存配置」
6. 点击「生成试卷」

**生成题目示例**：
```
24 ÷ 4 = ?
45 ÷ 5 = ?
63 ÷ 7 = ?
```

---

### 示例 5：三步混合运算挑战

**适用场景**：小学高年级，综合运算能力训练

```mermaid
flowchart TD
    A[进入试卷配置页面] --> B[点击新建配置]
    B --> C[配置参数]
    C --> C1[运算步数: 三步运算]
    C --> C2[题目数量: 15]
    C --> C3[启用括号: 是]
    C --> C4[第1项: 1-50, 加法/减法]
    C --> C5[第2项: 1-10, 乘法/除法]
    C --> C6[第3项: 1-20, 加法/减法]
    C --> C7[结果范围: 0-200]
    C --> C8[余数设置: 结果整除]
    C --> C9[进位/退位: 随机]
    C --> D[点击添加题目]
    D --> E[保存配置]
    E --> F[生成试卷]
```

**操作步骤**：
1. 进入「试卷配置」页面
2. 点击「新建配置」
3. 配置参数：
   - 运算步数：选择「三步运算」
   - 题目数量：设置为 15
   - 启用括号：勾选「启用括号」
   - 公式配置：
     - 第1项：最小值 1，最大值 50，运算符选择 `+(加法)` 和 `-(减法)`
     - 第2项：最小值 1，最大值 10，运算符选择 `×(乘法)` 和 `÷(除法)`
     - 第3项：最小值 1，最大值 20，运算符选择 `+(加法)` 和 `-(减法)`
   - 结果范围：最小值 0，最大值 200
   - 余数设置：选择「结果整除」
   - 进位/退位：选择「随机」
4. 点击「添加题目」按钮（重要！）
5. 点击「保存配置」
6. 点击「生成试卷」

**生成题目示例**：
```
12 + 5 × 3 - 8 = ?
(25 - 10) ÷ 5 + 7 = ?
8 × 4 + 15 ÷ 3 = ?
```

---

### 示例 6：小数加减练习

**适用场景**：小学中高年级，练习小数运算和位数对齐

```mermaid
flowchart TD
    A[进入试卷配置页面] --> B[点击新建配置]
    B --> C[配置参数]
    C --> C1[运算步数: 一步运算]
    C --> C2[运算模式: 小数模式]
    C --> C3[小数位数: 2 位]
    C --> C4[题目数量: 20]
    C --> C5[第1项: 0.10-9.99, 加法/减法]
    C --> C6[结果范围: 0.00-20.00]
    C --> C7[进位/退位: 随机]
    C --> C8[显示答案: 否]
    C --> D[点击添加题目]
    D --> E[保存配置]
    E --> F[生成试卷]
```

**操作步骤**：
1. 进入「试卷配置」页面
2. 点击「新建配置」
3. 配置参数：
   - 运算步数：选择「一步运算」
   - 运算模式：选择「小数模式」
   - 小数位数：选择「2 位」
   - 题目数量：设置为 20
   - 公式配置：第1项最小值 0.10，最大值 9.99，运算符选择 `+(加法)` 和 `-(减法)`
   - 结果范围：最小值 0.00，最大值 20.00
   - 进位/退位：选择「随机」
   - 是否显示答案：选择「不显示」
4. 点击「添加题目」按钮（重要！）
5. 点击「保存配置」
6. 点击「生成试卷」即可预览或打印

**生成题目示例**：
```
3.25 + 1.40 = ?
8.70 - 2.15 = ?
0.85 + 4.30 = ?
```

---

**提示**：配置保存后，可将其设置为「默认配置」，这样儿童端每日练习会自动使用该配置生成题目。

## 默认账号

首次运行后，访问 http://localhost:3000/register 进入注册页面创建家长账号，登录后可在家长端添加儿童账号，即可开始使用。

## 参与贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/xxx`
3. 提交更改：`git commit -m 'Add xxx'`
4. 推送分支：`git push origin feature/xxx`
5. 创建 Pull Request

## 致谢

本项目离不开以下优秀开源项目的启发与支持：

- **[animal-island-ui](https://github.com/guokaigdg/animal-island-ui)** —— 本项目 UI 视觉风格的设计源泉，温暖可爱的动物森友会风格组件库，为儿童端界面提供了极大的灵感。
- **[PrimarySchoolMathematics](https://github.com/bosichong/PrimarySchoolMathematics)** —— 小学数学出题逻辑的参考实现，为本项目的试卷生成与练习题目算法提供了基础思路。

## 安全提示

1. **生产环境必须修改 `JWT_SECRET`**，使用随机强密码
2. **切勿提交 `.env` 文件**到版本控制
3. 生产部署请启用 HTTPS
4. 定期更新依赖以修复安全漏洞

## 许可证

[MIT](LICENSE) © bllxk

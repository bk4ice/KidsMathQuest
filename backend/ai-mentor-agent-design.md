# 岛主AI导师 (Island AI Mentor) - 详细设计方案

## 1. 背景与目标
「岛主AI导师」 (Island AI Mentor) 是一个在后台扮演资深小学数学教育专家的智能 Agent。它能多轮对话式地分析孩子的数学练习历史，发现薄弱环节，并为孩子量身定制专属的练习试卷。

根据用户的最新要求：
- **安全优先，绝不覆盖**：AI 生成的试卷配置（`PaperConfig`）在写入数据库时，绝不能直接覆盖孩子当前的默认/活动配置，而是以非默认 (`isDefault: false`) 且带特殊标识（如 `[AI推荐] 退位减法强化训练`）的新记录写入。家长在后台管理列表中审核并点击后，方可激活或进行打印。
- **轻量本地持久化**：对话历史不进行 Prisma Schema 的变更，直接以 JSON 文件形式持久化存储在后端的本地文件系统中（如 `backend/data/ai_chats/{childId}.json`），并支持对话有效期限（Retention Period）以及最大对话轮数（Max Rounds）配置。
- **渐进式开发流程**：首先完成详细设计方案文档，然后基于文档编写独立的 CLI 测试脚本，在脚本运行验证通过后，再集成到前端。

---

## 2. 总体架构与数据流

### 2.1 架构示意图
```
+-------------------------------------------------------------+
|                        后端服务 (Express)                    |
|                                                             |
|   +-------------------+       +-------------------------+   |
|   |   AIChatRouter    | <---> |      AIAgentService     |   |
|   +-------------------+       +-------------------------+   |
|             ^                              ^                |
|             |                              v                |
|             v                   +---------------------+     |
|   +-------------------+         |   OpenAI SDK Client |     |
|   | Local JSON Store  |         +---------------------+     |
|   | (ai_chats/*.json) |                    ^                |
|   +-------------------+                    | Tool Calling   |
|                                            v                |
|                                 +---------------------+     |
|                                 |    DB Tools (Prisma)|     |
|                                 +---------------------+     |
+-------------------------------------------------------------+
```

### 2.2 数据流向
1. 家长输入对话消息 -> 后端加载对应 `childId` 的本地对话历史文件。
2. 后端初始化 OpenAI Chat Completion，传入 **System Prompt**、**历史上下文**、**最新问题** 和 **注册的工具列表**。
3. OpenAI 决定是否调用工具获取数据（如：列出儿童、查询错题统计、加载当前配置等）。
4. 后端拦截 Tool Call，使用 Prisma 从 SQLite 安全执行查询（自动绑定当前 Session 的 `parentId` 防越权），并将数据作为 Tool Output 回传给 OpenAI。
5. OpenAI 基于最新的上下文，合成回复并附带推荐的试卷配置。
6. 如果家长明确说“好的，帮我新建一个配置”，AI 调用 `create_suggested_config` 工具，在数据库中安全地写入一条不激活的新试卷配置。
7. 后端将最新多轮消息追加写入本地 `backend/data/ai_chats/{childId}.json` 中，并在写入时应用过期清理策略。

---

## 3. 本地历史持久化设计与清理策略

### 3.1 存储位置与命名空间
- 目录路径：`backend/data/ai_chats/`
- 文件命名：`chat_{childId}.json`（例如 `chat_d4d5e231-18cb-4f35-901c-6d2cc03a890a.json`）
- 权限隔离：每次加载和写入该文件时，后端路由必须通过数据库验证该 `childId` 确实属于请求发送者的 `parentId`。

### 3.2 数据结构
```json
{
  "childId": "String",
  "lastInteractionAt": "DateTime (ISO String)",
  "messages": [
    {
      "role": "user" | "assistant" | "tool",
      "content": "String",
      "name": "String (仅 tool 角色需要)",
      "tool_call_id": "String (仅 tool 角色需要)",
      "timestamp": "DateTime (ISO String)"
    }
  ]
}
```

### 3.3 保留期限与过期策略 (Retention Config)
在后端 `@/backend/src/config/aiConfig.ts` 中配置保留机制：

```typescript
export const AI_CONFIG = {
  // 环境变量中指定 API KEY
  apiKey: process.env.OPENAI_API_KEY,
  // 默认模型
  model: process.env.AI_MODEL || "gpt-4o-mini",
  // 对话保存期限（天），默认 14 天。若消息时间早于 14 天前，在保存/加载时将被修剪
  retentionDays: parseInt(process.env.AI_CHAT_RETENTION_DAYS || "14", 10),
  // 最大保留的消息轮数（Role = user/assistant 的轮数），防止单个文件过大导致上下文超限
  maxChatRounds: parseInt(process.env.AI_CHAT_MAX_ROUNDS || "20", 10),
  // 本地存储根路径
  chatStorageDir: "./data/ai_chats"
};
```

**清理算法 (Pruning Algorithm)**：
每当服务**读取**或**保存**某个孩子的聊天记录时，会自动执行一次修剪：
1. 过滤掉时间戳（`timestamp`）早于 `Date.now() - retentionDays * 24 * 3600 * 1000` 的记录。
2. 检查过滤后的消息队列，若 `user` 和 `assistant` 对话对数量超过 `maxChatRounds`，则从头部开始成对修剪，确保最新上下文处于合理范围。

---

## 4. Agent 工具箱 (Tool Declarations)

Agent 支持 5 个工具，后端将工具包装成 API 允许大模型按需调用。

### 4.1 list_children
- **目的**：列出家长拥有的儿童列表，在家长没有明确指定分析哪个孩子时，用于让大模型确认。
- **入参**：无（后端执行时绑定当前 `parentId`）
- **输出**：
  ```json
  [
    { "id": "child-uuid-1", "name": "乐乐", "grade": 2 },
    { "id": "child-uuid-2", "name": "悠悠", "grade": 1 }
  ]
  ```

### 4.2 get_child_diagnostics
- **目的**：获取选定孩子的答题统计和高频错题。
- **入参**：
  ```typescript
  { "childId": string }
  ```
- **输出**：
  ```json
  {
    "stats": {
      "totalSessions": 12,
      "averageAccuracy": 78.5,
      "totalPoints": 350,
      "level": 3,
      "streakDays": 5
    },
    "wrongQuestions": [
      { "formula": "32 - 17", "correctAnswer": "15", "wrongAnswer": "25", "count": 3 },
      { "formula": "45 - 28", "correctAnswer": "17", "wrongAnswer": "27", "count": 2 }
    ]
  }
  ```

### 4.3 get_recent_practice_sessions
- **目的**：获取最近几场练习的明细流水，分析状态起伏。
- **入参**：
  ```typescript
  { "childId": string, "limit": number } // limit 默认 5
  ```
- **输出**：
  ```json
  [
    { "date": "2026-06-05", "accuracy": 60, "totalTime": 120, "correctCount": 6, "targetCount": 10 },
    { "date": "2026-06-04", "accuracy": 90, "totalTime": 85, "correctCount": 9, "targetCount": 10 }
  ]
  ```

### 4.4 get_current_configs
- **目的**：获取孩子当前已有的试卷配置，避免生成重复或跳跃过大的题目。
- **入参**：
  ```typescript
  { "childId": string }
  ```
- **输出**：
  ```json
  [
    { "id": "config-uuid-1", "configName": "100以内常规加减法", "isDefault": true, "step": 1 }
  ]
  ```

### 4.5 create_suggested_config
- **目的**：为孩子安全地生成一份新的、处于**非默认且非活动**状态的试卷配置，供家长在管理列表中挑选。
- **入参**：
  - `childId`: `string`
  - `suggestedTitle`: `string` (例如 `"退位减法特训岛"`)
  - `config`: `PaperConfig` 的大部分参数（剔除 id、practiceConfigId、isDefault 等系统自动注入项）
- **数据库执行逻辑**：
  1. 查询孩子关联的 `PracticeConfig`。
  2. 创建一个新的 `PaperConfig` 记录：
     - `configName`: `"[AI推荐] " + suggestedTitle`
     - `isDefault`: `false`
     - `isActive`: `false`
  3. **输出**：
     ```json
     { "status": "success", "configId": "new-config-uuid", "message": "已成功在系统后台为您生成全新试卷配置 [AI推荐] 退位减法特训岛，可在试卷配置列表中查看哩啦！" }
     ```

---

## 5. 开发里程碑与脚本测试方案
1. **第一步：编写 backend 底层服务与本地历史持久化器**
   - 编写 `aiConfig.ts` 配置参数类
   - 编写 `aiAgentService.ts`（包含核心 OpenAI 对话轮转、Tool 自动解析绑定与执行机制、历史记录 Pruning 清理机制）
2. **第二步：编写 CLI 测试脚本 `testAiAgent.ts`**
   - 创建一段多轮对话模拟：
     - 第一轮："帮我分析下我的孩子" -> AI 列出孩子，询问分析哪一个。
     - 第二轮："分析乐乐" -> AI 调用诊断工具和最近练习流水，归纳出退位减法的问题，并推荐一份 PaperConfig。
     - 第三轮："好的，帮我生成这个配置吧" -> AI 触发 `create_suggested_config` 工具，在数据库写入配置，返回成功。
   - 检查本地 `./data/ai_chats/` 下的 JSON 文件是否完整记录。
   - 检查历史修剪与过期期限逻辑是否生效。
3. **第三步：集成验证**
   - 运行脚本，确保所有过程输出清晰。

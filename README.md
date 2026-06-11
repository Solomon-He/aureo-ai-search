<h1 align="center">✶ aureo-ai-search</h1>

Perplexity 风格的 AI 搜索引擎：输入自然语言问题，系统自动联网搜索最新信息，由大模型综合分析后流式生成**带引用来源**的智能回答，同时展示完整搜索结果列表与相关问题推荐。

## 功能特性

- 🔍 **AI 联网搜索**：基于 Tavily Search API 获取最新网页信息
- 🤖 **智能综合回答**：LangChain v1 `create_agent` + qwen3.7-max（DashScope OpenAI 兼容模式）
- 📌 **引用来源标注**：回答中以 `[n]` 角标标注信息来源，可点击跳转原文
- 📃 **完整结果列表**：像传统搜索引擎一样展示全部搜索结果（含未被引用的）
- ⚡ **SSE 流式输出**：打字机效果实时显示回答
- 🕘 **搜索历史**：localStorage 持久化，支持快速重搜与删除
- 💡 **相关问题推荐**：回答完成后自动生成 3-5 个延伸问题
- 🌗 **明暗主题**：一键切换，跟随系统偏好

## 技术栈

| 端 | 技术 |
|---|---|
| 后端 | Python 3.13 · FastAPI · LangChain v1（`create_agent`）· langchain-tavily · uv |
| 前端 | React 19 · TypeScript · Vite · Tailwind CSS v4 · shadcn/ui · react-markdown |
| 模型 | qwen3.7-max（阿里云 DashScope，OpenAI 兼容模式） |

## 目录结构

```
aureo-ai-search/
├── backend/            # FastAPI 后端
│   ├── app/
│   │   ├── config.py        # 环境变量配置
│   │   ├── search_agent.py  # 搜索 Agent（Tavily 工具 + 引用编号）
│   │   └── main.py          # SSE 流式接口
│   └── .env.example
└── frontend/           # React 前端
    └── src/
        ├── lib/             # SSE 解析、历史存储、类型
        ├── hooks/           # use-search / use-theme
        └── components/      # 搜索框、回答渲染、来源卡片等
```

## 快速开始

### 1. 配置密钥

```bash
cp backend/.env.example backend/.env
# 编辑 backend/.env，填入真实的 DASHSCOPE_API_KEY 与 TAVILY_API_KEY
```

### 2. 启动后端（需要 [uv](https://docs.astral.sh/uv/)）

```bash
cd backend
uv sync
uv run uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

打开 http://localhost:5173 即可使用（前端通过 Vite 代理转发 `/api` 到后端 8000 端口）。

## API

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/search/stream` | SSE 流式搜索，body：`{"query": "问题"}` |
| GET | `/api/health` | 健康检查 |

SSE 事件序列：`sources`（搜索结果列表）→ `token`（回答增量）→ `related`（相关问题）→ `done`；出错时返回 `error`。

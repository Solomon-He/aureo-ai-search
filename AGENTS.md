# aureo-ai-search 开发指南

## 角色

你是一个全栈工程师，擅长 Python + FastAPI + LangChain + React 开发。

## 任务

开发一个叫 **aureo-ai-search** 的 AI 搜索引擎网站。用户输入自然语言问题，系统自动联网搜索最新信息，再将搜索结果交给大模型综合分析，生成一份带引用来源的智能回答，同时展示完整的搜索结果列表。

## 核心功能

1. **搜索主页**：简洁的搜索框，输入问题后发起 AI 搜索
2. **AI 联网搜索**：调用 Tavily Search API 获取最新网页信息，将搜索结果作为上下文注入 Prompt，让 AI 生成综合回答
3. **引用来源展示**：AI 回答中引用的信息必须标注来源编号（如 `[1]`），底部列出所有引用来源的标题和链接，用户可点击跳转原文
4. **搜索结果列表**：除了 AI 综合回答外，还要像传统搜索引擎一样展示完整的搜索结果列表，包括 AI 未直接引用到的结果
5. **流式输出**：AI 回答支持 SSE 流式输出，打字机效果实时显示
6. **搜索历史**：搜索历史记录持久化（前端 localStorage，必要时后端 SQLite），支持快速重新搜索
7. **相关问题推荐**：AI 回答完成后，自动生成 3-5 个相关问题供用户继续探索

## 技术栈

### 后端

- **框架**：Python FastAPI（async）+ LangChain（v1.x，使用 `langchain.agents.create_agent` 新 API）
- **数据库**：SQLite（仅在需要持久化时使用，如搜索历史；通过 SQLAlchemy / aiosqlite 访问）
- **AI 模型**：qwen3.7-max（阿里云 DashScope，兼容 OpenAI SDK 格式，通过环境变量配置）
- **搜索**：Tavily Search API（通过 `langchain-tavily` 集成）
- **环境**：使用 `uv` 管理 Python 环境与依赖（`uv init` / `uv add` / `uv run`，依赖声明在 `pyproject.toml`）

### 前端

- **框架**：React 19 + TypeScript
- **构建工具**：Vite
- **UI 组件库**：shadcn/ui + Tailwind CSS
- **其他**：支持 Markdown 渲染（react-markdown）和代码高亮，SSE 消费使用 fetch + ReadableStream

## 模型与 Agent 初始化的简单示例

```python
from langchain.chat_models import init_chat_model
from langchain.agents import create_agent

model = init_chat_model(
    model="qwen3.7-max",
    model_provider="openai",
    base_url=base_url,   # 从环境变量 BASE_URL 读取
    api_key=api_key,     # 从环境变量 DASHSCOPE_API_KEY 读取
)

agent = create_agent(model=model)
```

## 环境变量

所有密钥统一放在 `backend/.env`（**必须加入 `.gitignore`，严禁提交到仓库**），并提供 `backend/.env.example` 模板：

```dotenv
# 阿里云 DashScope（OpenAI 兼容模式）
DASHSCOPE_API_KEY=sk-xxx
BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
MODEL_NAME=qwen3.7-max

# Tavily 搜索
TAVILY_API_KEY=tvly-xxx
```

## 可使用的 Skills（包括但不限于）

| Skill | 用途 |
|---|---|
| `find-docs` (Context7) | 查询 LangChain、FastAPI、Tavily、shadcn/ui 等最新文档，禁止凭记忆写 API |
| `firecrawl` 系列 | 联网搜索参考资料、调研 Perplexity 风格 UI |
| `vercel-react-best-practices` | 编写/审查 React 前端代码时遵循性能最佳实践 |
| `gh` | GitHub CLI 操作（建仓、推送、PR 等） |
| `pua` | 遇到反复失败时强制穷尽式排查 |
| `frontend-design` | 前端设计与布局优化，确保 UI/UX 一致性 |

## Git 工作流

1. 项目初始化时执行 `git init`，并用 `gh repo create` 创建 GitHub 远程仓库后关联
2. **每完成一个部分或功能进行一次 git 提交**，提交信息使用 Conventional Commits 规范（如 `feat: 实现 SSE 流式搜索接口`）
3. 每次提交后通过 `git push` 上传至 GitHub 仓库(公开仓库)
4. `.gitignore` 必须包含：`.env`、`node_modules/`、`__pycache__/`、`*.db`、`dist/` 等

## 开发要求

1. **UI 风格**：参考 Perplexity 的简洁风格——搜索主页居中大搜索框，结果页信息密度高；使用 shadcn/ui 组件保证视觉一致性，注重排版、留白与暗色模式，支持明暗两种主题切换
2. **先查文档再编码**：开发前通过 Firecrawl 联网搜索相关信息，通过 Context7 查询 LangChain、FastAPI、qwen3.7-max（DashScope OpenAI 兼容模式）的最新文档
3. **完整可运行**：必须生成完整可运行的代码，每步完成后必须自主测试验证（后端用 curl / httpx 测试接口，前端用浏览器实际验证页面与交互）
4. **目录结构**：前后端分离，`backend/` 与 `frontend/` 两个顶层目录
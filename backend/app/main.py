"""aureo-ai-search 后端：FastAPI + SSE 流式 AI 搜索接口。"""

from __future__ import annotations

import json
from typing import Any, AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from langchain_core.messages import AIMessageChunk
from pydantic import BaseModel, Field

from .search_agent import build_search_agent, generate_related_questions

app = FastAPI(title="aureo-ai-search", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class SearchRequest(BaseModel):
    query: str = Field(min_length=1, max_length=500)


def sse_event(event: str, data: Any) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


async def search_event_stream(query: str) -> AsyncIterator[str]:
    sources: list[dict[str, Any]] = []
    emitted_sources = 0
    answer_parts: list[str] = []
    try:
        agent = build_search_agent(sources)
        async for chunk in agent.astream(
            {"messages": [{"role": "user", "content": query}]},
            stream_mode=["messages", "updates"],
        ):
            # 多 stream_mode 时返回 (mode, data) 元组
            kind, data = chunk
            if kind == "messages":
                token, _meta = data
                if isinstance(token, AIMessageChunk) and token.text:
                    answer_parts.append(token.text)
                    yield sse_event("token", {"text": token.text})
            elif kind == "updates":
                # 工具节点完成后推送新增的搜索结果
                if len(sources) > emitted_sources:
                    emitted_sources = len(sources)
                    yield sse_event("sources", {"sources": sources})

        answer = "".join(answer_parts)
        related = await generate_related_questions(query, answer)
        if related:
            yield sse_event("related", {"questions": related})
        yield sse_event("done", {})
    except Exception as exc:  # noqa: BLE001
        yield sse_event("error", {"message": f"搜索失败：{exc}"})


@app.post("/api/search/stream")
async def search_stream(request: SearchRequest) -> StreamingResponse:
    return StreamingResponse(
        search_event_stream(request.query.strip()),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}

"""AI 搜索核心：LangChain v1 create_agent + Tavily 联网搜索。

设计要点：
- 每个请求构建独立的 agent，web_search 工具通过闭包把搜索结果收集到
  请求级 sources 列表中，并做全局 [n] 编号，保证回答中的引用编号与
  前端展示的来源列表一一对应。
"""

from __future__ import annotations

import json
import os
import re
from typing import Any

from langchain.agents import create_agent
from langchain.chat_models import init_chat_model
from langchain_core.tools import tool
from langchain_tavily import TavilySearch

from .config import get_settings

SYSTEM_PROMPT = """你是 Aureo AI 搜索引擎的回答助手。针对用户的问题，你必须：

1. 先调用 web_search 工具联网搜索最新信息（可以用不同的关键词搜索 1~2 次）。
2. 仅根据搜索结果撰写一份准确、结构清晰的综合回答，使用 Markdown 排版
  （小标题、列表、加粗等），适当分段。
3. 引用规范（非常重要）：每条来自搜索结果的信息，必须在句末标注对应来源
   编号，格式严格为 [1]、[2]，多个来源写作 [1][3]。编号必须与搜索结果中
   给出的编号一致，禁止编造编号。
4. 如果搜索结果不足以回答，请如实说明，不要编造内容。
5. 使用与用户问题相同的语言回答。回答不要重复问题本身。"""

RELATED_PROMPT = """基于用户的问题和 AI 回答，生成 4 个用户可能想继续探索的相关问题。
要求：与原问题相关但角度不同、简短（20 字以内）、使用与原问题相同的语言。
只输出 JSON 字符串数组，不要输出其他任何内容。例如：["问题一", "问题二", "问题三", "问题四"]

用户问题：{question}

AI 回答摘要：{answer}"""


def get_model():
    settings = get_settings()
    return init_chat_model(
        model=settings.model_name,
        model_provider="openai",
        base_url=settings.base_url,
        api_key=settings.dashscope_api_key,
    )


def build_search_agent(sources: list[dict[str, Any]]):
    """构建带 web_search 工具的 agent，搜索结果写入 sources（全局编号）。"""
    settings = get_settings()
    os.environ.setdefault("TAVILY_API_KEY", settings.tavily_api_key)
    tavily = TavilySearch(
        max_results=settings.search_max_results,
        topic="general",
        tavily_api_key=settings.tavily_api_key,
    )
    seen_urls: set[str] = set()

    @tool
    def web_search(query: str) -> str:
        """联网搜索最新网页信息。输入自然语言搜索关键词，返回带编号的搜索结果列表。"""
        raw = tavily.invoke({"query": query})
        results = raw.get("results", []) if isinstance(raw, dict) else []
        blocks: list[str] = []
        for item in results:
            url = item.get("url", "")
            if not url or url in seen_urls:
                continue
            seen_urls.add(url)
            source = {
                "id": len(sources) + 1,
                "title": item.get("title", ""),
                "url": url,
                "content": (item.get("content") or "")[:1000],
                "score": item.get("score"),
            }
            sources.append(source)
            blocks.append(
                f"[{source['id']}] {source['title']}\n"
                f"URL: {url}\n"
                f"内容: {source['content']}"
            )
        if not blocks:
            return "本次搜索没有返回新的结果，请换个关键词或直接基于已有结果回答。"
        return "以下是搜索结果（引用时请使用对应编号）：\n\n" + "\n\n".join(blocks)

    return create_agent(
        model=get_model(),
        tools=[web_search],
        system_prompt=SYSTEM_PROMPT,
    )


async def generate_related_questions(question: str, answer: str) -> list[str]:
    """回答完成后生成 3-5 个相关问题。"""
    model = get_model()
    prompt = RELATED_PROMPT.format(question=question, answer=answer[:1500])
    try:
        response = await model.ainvoke(prompt)
        text = response.text if isinstance(response.text, str) else str(response.content)
        match = re.search(r"\[.*\]", text, re.DOTALL)
        if match:
            data = json.loads(match.group(0))
            questions = [str(q).strip() for q in data if str(q).strip()]
            return questions[:5]
    except Exception:
        pass
    return []

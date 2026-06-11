export const CITATION_HREF = '#aureo-source-'

/** 把回答中的 [n] 引用标记转成 markdown 链接（跳过代码块）。 */
export function injectCitationLinks(markdown: string): string {
  return markdown
    .split(/(```[\s\S]*?```)/g)
    .map((segment) =>
      segment.startsWith('```')
        ? segment
        : segment.replace(/\[(\d{1,2})\]/g, `[$1](${CITATION_HREF}$1)`),
    )
    .join('')
}

/** 提取回答中实际引用到的来源编号（按出现顺序去重）。 */
export function extractCitedIds(markdown: string): number[] {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, '')
  const ids: number[] = []
  for (const match of withoutCode.matchAll(/\[(\d{1,2})\]/g)) {
    const id = Number(match[1])
    if (!ids.includes(id)) ids.push(id)
  }
  return ids
}

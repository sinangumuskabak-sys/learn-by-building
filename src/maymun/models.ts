/**
 * Models offered by a gateway such as OmniRoute: grouped by the connection they come through (its id prefix, e.g.
 * `cc/claude-opus-4-7` is Claude through Claude Code) and ranked, so the best active one answers first and the next
 * takes over when one fails.
 */

/** OmniRoute's connection prefixes, as people know them. */
const GROUPS: Record<string, string> = {
  cc: 'Claude (Claude Code)',
  claude: 'Claude',
  anthropic: 'Claude (API)',
  kr: 'Claude (Kiro)',
  cx: 'ChatGPT (Codex)',
  codex: 'ChatGPT (Codex)',
  openai: 'OpenAI',
  gh: 'GitHub Copilot',
  'gemini-cli': 'Gemini (Gemini CLI)',
  gemini: 'Gemini',
  antigravity: 'Gemini (Antigravity)',
  qw: 'Qwen',
  if: 'Qoder',
  glm: 'GLM',
  kimi: 'Kimi',
  minimax: 'MiniMax',
  ds: 'DeepSeek',
  deepseek: 'DeepSeek',
  groq: 'Groq',
  openrouter: 'OpenRouter',
  mistral: 'Mistral',
}

export function groupOf(id: string): string {
  const prefix = id.includes('/') ? id.split('/')[0] : ''
  return prefix ? (GROUPS[prefix.toLowerCase()] ?? prefix) : 'Other'
}

/** Models grouped by connection, groups and models in a stable, readable order. */
export function groupModels(ids: string[]): { group: string; models: string[] }[] {
  const groups = new Map<string, string[]>()
  for (const id of [...new Set(ids)]) {
    const group = groupOf(id)
    groups.set(group, [...(groups.get(group) ?? []), id])
  }
  return [...groups.entries()]
    .map(([group, models]) => ({ group, models: models.sort((a, b) => rankScore(b) - rankScore(a) || a.localeCompare(b)) }))
    .sort((a, b) => a.group.localeCompare(b.group))
}

/**
 * How capable a model is likely to be, from its name: the biggest tier of each family first (Opus, GPT-5, Gemini Pro),
 * then the middle (Sonnet), then the fast and small ones (Flash, Haiku, mini). Newer versions win within a tier.
 */
export function rankScore(id: string): number {
  const name = id.toLowerCase().split('/').pop() ?? ''
  let tier = 50
  if (/opus/.test(name)) tier = 100
  else if (/gpt-?5(?![\w.-]*-(mini|nano))|(^|[^a-z])o3(?!-mini)/.test(name)) tier = 95
  else if (/gemini[\w.-]*pro/.test(name)) tier = 93
  else if (/sonnet/.test(name)) tier = 90
  else if (/deepseek[\w.-]*(r1|reasoner)|kimi-k2|glm-4\.[5-9]|qwen3?-?(max|coder)/.test(name)) tier = 80
  else if (/gpt-4|deepseek|grok|mistral-large|devstral/.test(name)) tier = 75
  else if (/flash(?!-lite)/.test(name)) tier = 65
  else if (/haiku/.test(name)) tier = 60
  // Whole words only ("gemini" is not "mini").
  if (/(^|[-_.])(mini|nano|lite|small|tiny)($|[-_.])/.test(name)) tier = Math.min(tier, 45)
  // Version: the numbers in the name, read as major.minor (claude-opus-4-7 → 4.7, gemini-3.1-pro → 3.1).
  const version = /(\d+)(?:[.-](\d{1,2}))?/.exec(name.replace(/20\d{6}/, ''))
  const bonus = version ? Math.min(Number(version[1]), 20) + Number(version[2] ?? 0) / 10 : 0
  // "(High)" style effort levels: higher effort first.
  const effort = /high/.test(name) ? 0.3 : /medium/.test(name) ? 0.2 : /low/.test(name) ? 0.1 : 0
  return tier + bonus / 10 + effort / 10
}

/** The active models, best first: the order they are tried in. */
export function rankModels(ids: string[]): string[] {
  return [...new Set(ids)].sort((a, b) => rankScore(b) - rankScore(a) || a.localeCompare(b))
}

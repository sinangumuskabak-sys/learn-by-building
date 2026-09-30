/**
 * NVIDIA's models that answer Maymun, measured (1 Oct 2026) with three beginner questions in Turkish: how long a whole
 * answer took (median) and how good the answers were (right, short, clear). The learner picks from these.
 * NVIDIA lists many more models, but most of them are not served to an ordinary key (404), so only these are offered.
 * `extra` is what turns the model's "thinking" off, so the answer starts in about a second instead of half a minute.
 */

export interface NvidiaModel {
  id: string
  /** Seconds a whole answer took (median of the three questions). */
  seconds: number
  /** 1–10: how good the answers were. */
  quality: number
  extra?: Record<string, unknown>
}

/** Fastest first. */
export const NVIDIA_MODELS: NvidiaModel[] = [
  { id: 'openai/gpt-oss-20b', seconds: 3, quality: 8, extra: { reasoning_effort: 'low' } },
  { id: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning', seconds: 3, quality: 5, extra: { reasoning_effort: 'none' } },
  { id: 'deepseek-ai/deepseek-v4.1-flash', seconds: 4, quality: 8, extra: { reasoning_effort: 'none' } },
  { id: 'z-ai/glm-5.3-flash', seconds: 5, quality: 9, extra: { reasoning_effort: 'low' } },
  { id: 'nvidia/nemotron-3-ultra-550b-a55b', seconds: 7, quality: 8, extra: { reasoning_effort: 'none' } },
  { id: 'nvidia/nemotron-3-super-120b-a12b', seconds: 8, quality: 6, extra: { reasoning_effort: 'none' } },
  { id: 'nvidia/nemotron-3.5-lightning-30b-a3b', seconds: 33, quality: 7, extra: { reasoning_effort: 'none' } },
  { id: 'meta/llama-3.2-11b-vision-instruct', seconds: 40, quality: 4 },
  { id: 'z-ai/glm-5.3', seconds: 54, quality: 9, extra: { reasoning_effort: 'low' } },
]

/** What to add to a request to this model (turning its thinking off). */
export const nvidiaExtra = (id: string) => NVIDIA_MODELS.find((m) => m.id === id)?.extra ?? {}

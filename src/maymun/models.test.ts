import { describe, expect, it } from 'vitest'
import { groupModels, groupOf, rankModels } from './models.ts'

describe('gateway models', () => {
  it('groups OmniRoute models by the connection they come through', () => {
    expect(groupOf('cc/claude-opus-4-7')).toBe('Claude (Claude Code)')
    expect(groupOf('gemini-cli/gemini-3-flash-preview')).toBe('Gemini (Gemini CLI)')
    expect(groupOf('oc/big-pickle')).toBe('OpenCode Free')
    expect(groupOf('agy/gemini-3.1-pro-high')).toBe('Antigravity CLI')
    expect(groupOf('newthing/model')).toBe('newthing')
    expect(groupOf('plain-model')).toBe('Other')
    expect(groupModels(['gemini-cli/gemini-2.5-flash', 'cc/claude-sonnet-4-5', 'gemini-cli/gemini-2.5-pro', 'cc/claude-opus-4-7'])).toEqual([
      { group: 'Claude (Claude Code)', models: ['cc/claude-opus-4-7', 'cc/claude-sonnet-4-5'] },
      { group: 'Gemini (Gemini CLI)', models: ['gemini-cli/gemini-2.5-pro', 'gemini-cli/gemini-2.5-flash'] },
    ])
  })

  it('ranks the most capable first: big tiers, then newer versions, small models last', () => {
    expect(
      rankModels(['cc/claude-haiku-4-5', 'gemini-cli/gemini-2.5-flash', 'cx/gpt-5-mini', 'cc/claude-sonnet-4-5', 'gemini-cli/gemini-3.1-pro', 'cc/claude-opus-4-7', 'cc/claude-opus-4-1', 'cx/gpt-5']),
    ).toEqual([
      'cc/claude-opus-4-7',
      'cc/claude-opus-4-1',
      'cx/gpt-5',
      'gemini-cli/gemini-3.1-pro',
      'cc/claude-sonnet-4-5',
      'gemini-cli/gemini-2.5-flash',
      'cc/claude-haiku-4-5',
      'cx/gpt-5-mini',
    ])
  })
})

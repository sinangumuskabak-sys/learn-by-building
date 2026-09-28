import type { Category, Challenge, CurriculumModule, Skill } from '../content/schema.ts'
import type { Difficulty, GameSummary } from '../games/schema.ts'
import { stepKey } from '../games/schema.ts'
import { translate } from '../i18n/i18n.ts'
import type { Lang } from '../i18n/messages.ts'
import type { Progress } from '../progress/progress.ts'
import { marker, writeFrontMatter, writeSection } from './sections.ts'

/**
 * The vault's skeleton: a Markdown note for everything the learner can work on (each category, module, challenge,
 * game, game step and skill) plus a few overview notes. The app fills the `auto:` sections from progress; the AI fills
 * the `maymun:` sections as the learner talks to it; "My notes" is the learner's. Pure: no storage here.
 */

export interface VaultSource {
  categories: Category[]
  challenges: Map<string, Pick<Challenge, 'id' | 'title' | 'title_tr' | 'type' | 'level' | 'skills'>>
  games: GameSummary[]
  skills: Skill[]
  lang: Lang
}

/** One note: where it lives, what it starts as, and how its app-owned parts follow progress. */
export interface NoteSpec {
  path: string
  template: string
  auto: (progress: Progress) => { front: string; sections: Record<string, string> }
}

/** The name of the read-me note in each language; the vault's language is the one its read-me is in. */
export function readmePath(lang: Lang): string {
  return `${words[lang].readme}.md`
}

const words = {
  en: {
    readme: '00 Read me',
    instructions: 'Maymun instructions',
    now: 'Current status',
    profile: 'Learner profile',
    catalog: 'Catalog',
    games: 'Games',
    steps: 'Steps',
    sessions: 'Sessions',
    skills: 'Skills',
    journal: 'Journal',
    myNotes: 'My notes',
    empty: '_(empty so far)_',
    none: '_(none yet)_',
    done: '✅ Done',
    started: '🟡 Started',
    notStarted: '⏳ Not started',
    managed: 'The app and Maymun keep this note up to date. Write your own thoughts under **My notes** at the end.',
    h: {
      progress: 'Progress',
      status: 'Status',
      overview: 'Overview',
      nowSection: 'Where you are now',
      next: 'Next',
      questions: 'Open questions',
      asked: 'Questions you asked',
      learned: 'What you learned',
      struggled: 'What was hard',
      misconceptions: 'Misunderstandings to watch',
      skills: 'Skills',
      sessions: 'Sessions',
      definition: 'What it is',
      model: 'Mental model',
      practised: 'Where you practised it',
      mistakes: 'Mistakes you made',
      mastery: 'Mastery',
      review: 'Review',
      level: 'Level and background',
      strengths: 'Strengths',
      weaknesses: 'Needs work',
      style: 'Explanations that work for you',
      recurring: 'Recurring mistakes',
      done: 'Finished',
      worked: 'Worked on',
      modules: 'Modules',
      challenges: 'Challenges',
      step: 'Step',
      challenge: 'Challenge',
      item: 'Item',
      state: 'Status',
    },
    reviewLine: (last: string, next: string, times: number) =>
      `Practised on ${times} day${times === 1 ? '' : 's'}, last on ${last}. Next review: ${next}.`,
    overview: (o: Overview) =>
      [
        `- Games: ${o.gamesDone} finished, ${o.gamesStarted} in progress, ${o.games} in total`,
        `- Game steps: ${o.stepsDone}/${o.steps} done`,
        `- Challenges: ${o.challengesDone}/${o.challenges} done`,
        o.last ? `- Last activity: ${o.last.link} (${o.last.date})` : '- Last activity: none yet',
      ].join('\n'),
  },
  tr: {
    readme: '00 Beni oku',
    instructions: 'Maymun talimatı',
    now: 'Güncel durum',
    profile: 'Öğrenci profili',
    catalog: 'Katalog',
    games: 'Oyunlar',
    steps: 'Adımlar',
    sessions: 'Oturumlar',
    skills: 'Beceriler',
    journal: 'Günlük',
    myNotes: 'Notlarım',
    empty: '_(henüz boş)_',
    none: '_(henüz yok)_',
    done: '✅ Tamamlandı',
    started: '🟡 Başlandı',
    notStarted: '⏳ Başlanmadı',
    managed: 'Bu notu uygulama ve Maymun güncel tutar. Kendi düşüncelerini en alttaki **Notlarım** bölümüne yaz.',
    h: {
      progress: 'İlerleme',
      status: 'Durum',
      overview: 'Genel bakış',
      nowSection: 'Şu an nerede',
      next: 'Sıradaki',
      questions: 'Açık sorular',
      asked: 'Sorduğun sorular',
      learned: 'Öğrendiklerin',
      struggled: 'Zorlandıkların',
      misconceptions: 'Dikkat edilecek yanlış anlamalar',
      skills: 'Beceriler',
      sessions: 'Oturumlar',
      definition: 'Nedir',
      model: 'Zihinsel model',
      practised: 'Nerede çalıştın',
      mistakes: 'Yaptığın hatalar',
      mastery: 'Ustalık',
      review: 'Tekrar',
      level: 'Seviye ve geçmiş',
      strengths: 'Güçlü yanların',
      weaknesses: 'Çalışılacaklar',
      style: 'Sana iyi gelen anlatım',
      recurring: 'Tekrar eden hatalar',
      done: 'Tamamlananlar',
      worked: 'Üzerinde çalışılanlar',
      modules: 'Modüller',
      challenges: 'Görevler',
      step: 'Adım',
      challenge: 'Görev',
      item: 'Öğe',
      state: 'Durum',
    },
    reviewLine: (last: string, next: string, times: number) => `${times} gün çalıştın, en son ${last}. Sonraki tekrar: ${next}.`,
    overview: (o: Overview) =>
      [
        `- Oyunlar: ${o.gamesDone} bitti, ${o.gamesStarted} devam ediyor, toplam ${o.games}`,
        `- Oyun adımları: ${o.stepsDone}/${o.steps} tamam`,
        `- Görevler: ${o.challengesDone}/${o.challenges} tamam`,
        o.last ? `- Son çalışma: ${o.last.link} (${o.last.date})` : '- Son çalışma: henüz yok',
      ].join('\n'),
  },
}

interface Overview {
  games: number
  gamesDone: number
  gamesStarted: number
  steps: number
  stepsDone: number
  challenges: number
  challengesDone: number
  last?: { link: string; date: string }
}

/** A file or folder name Obsidian and every OS accept. */
export function safeName(name: string): string {
  return name.replace(/[\\/:*?"<>|#^[\]]/g, '-').replace(/\s+/g, ' ').trim().slice(0, 80) || 'untitled'
}

const pad = (n: number) => String(n).padStart(2, '0')
/** A wiki link to another note (without `.md`), as Obsidian writes it. */
export const link = (path: string, label: string) => `[[${path.replace(/\.md$/, '')}|${label.replace(/[|\]]/g, '-')}]]`
const day = (iso?: string) => (iso ? iso.slice(0, 10) : '')

const skillLevelOf: Record<Difficulty, number> = { beginner: 3, intermediate: 4, advanced: 5 }

/** Builds a note: title, managed hint, sections (each `[owner, id, heading]` or a plain heading), My notes. */
function note(title: string, w: (typeof words)['en'], sections: ([string, string, string] | string)[]): string {
  const parts = [`# ${title}`, '', `> ${w.managed}`, '']
  for (const s of sections) {
    if (typeof s === 'string') parts.push(s, '')
    else parts.push(`## ${s[2]}`, marker(s[0] as 'auto' | 'maymun', s[1]), s[0] === 'auto' ? w.none : w.empty, '')
  }
  parts.push(`## ${w.myNotes}`, '')
  return writeFrontMatter(parts.join('\n'), 'type: note')
}

export function vaultNotes(source: VaultSource): NoteSpec[] {
  const { lang } = source
  const w = words[lang]
  const tr = lang === 'tr'
  const title = (t: { en: string; tr?: string }) => (tr && t.tr) || t.en
  const challengeTitle = (c: { title: string; title_tr?: string }) => (tr && c.title_tr) || c.title
  const status = (p: Progress, key: string) => p.challenges[key]
  const statusText = (p: Progress, key: string) => {
    const s = status(p, key)
    if (s?.status === 'passed') return `${w.done} (${day(s.passedAt ?? s.updatedAt)})`
    if (s) return `${w.started} (${day(s.updatedAt)})`
    return w.notStarted
  }
  const statusWord = (p: Progress, key: string) =>
    status(p, key)?.status === 'passed' ? 'done' : status(p, key) ? 'started' : 'not-started'

  const notes: NoteSpec[] = []
  const skillPath = new Map<string, string>()
  const usedSkillNames = new Set<string>()
  for (const skill of source.skills) {
    let name = safeName(title(skill.title))
    if (usedSkillNames.has(name)) name = safeName(`${name} (${skill.id})`)
    usedSkillNames.add(name)
    skillPath.set(skill.id, `${w.skills}/${name}.md`)
  }
  const skillLinks = (ids: string[]) =>
    ids.map((id) => (skillPath.has(id) ? `- ${link(skillPath.get(id)!, skillPath.get(id)!.split('/')[1].replace(/\.md$/, ''))}` : `- ${id}`)).join('\n') ||
    w.none

  // Where each thing is, for links and overviews.
  const challengePath = new Map<string, string>()
  const stepPath = new Map<string, string>()
  const gamePath = new Map<string, string>()

  // Catalog: categories → modules → challenges.
  source.categories.forEach((category, ci) => {
    const catDir = `${w.catalog}/${pad(ci + 1)} ${safeName(title(category.title))}`
    const modulePaths: { module: CurriculumModule; path: string }[] = []
    category.modules.forEach((module, mi) => {
      const modDir = `${catDir}/${pad(mi + 1)} ${safeName(title(module.title))}`
      const ids = module.challenges.filter((id) => source.challenges.has(id))
      for (const id of ids) {
        const c = source.challenges.get(id)!
        const path = `${modDir}/${safeName(challengeTitle(c))}.md`
        challengePath.set(id, path)
        notes.push({
          path,
          template: note(challengeTitle(c), w, [
            ['auto', 'status', w.h.status],
            `## ${w.h.skills}\n${skillLinks(c.skills)}`,
            ['maymun', 'learned', w.h.learned],
            ['maymun', 'struggled', w.h.struggled],
            ['maymun', 'asked', w.h.asked],
          ]),
          auto: (p) => ({
            front: [`type: challenge`, `id: ${id}`, `status: ${statusWord(p, id)}`, `level: ${c.level}`, `updated: ${day(status(p, id)?.updatedAt)}`].join('\n'),
            sections: { status: statusText(p, id) },
          }),
        })
      }
      const modulePath = `${modDir}/${w.now}.md`
      modulePaths.push({ module, path: modulePath })
      notes.push({
        path: modulePath,
        template: note(`${title(module.title)} — ${w.now}`, w, [
          ['auto', 'progress', w.h.progress],
          ['maymun', 'now', w.h.nowSection],
          ['maymun', 'struggled', w.h.struggled],
        ]),
        auto: (p) => ({
          front: [`type: module`, `id: ${module.id}`, `category: ${category.id}`].join('\n'),
          sections: {
            progress: ids.length
              ? [`| ${w.h.challenge} | ${w.h.state} |`, '|---|---|', ...ids.map((id) => `| ${link(challengePath.get(id)!, challengeTitle(source.challenges.get(id)!))} | ${statusText(p, id)} |`)].join('\n')
              : w.none,
          },
        }),
      })
    })
    const all = category.modules.flatMap((m) => m.challenges.filter((id) => source.challenges.has(id)))
    notes.push({
      path: `${catDir}/${w.now}.md`,
      template: note(`${title(category.title)} — ${w.now}`, w, [
        ['auto', 'progress', w.h.progress],
        ['maymun', 'now', w.h.nowSection],
        ['maymun', 'next', w.h.next],
      ]),
      auto: (p) => ({
        front: [`type: category`, `id: ${category.id}`].join('\n'),
        sections: {
          progress: [
            `| ${w.h.item} | ${w.h.state} |`,
            '|---|---|',
            ...modulePaths.map(({ module, path }) => {
              const ids = module.challenges.filter((id) => source.challenges.has(id))
              const done = ids.filter((id) => status(p, id)?.status === 'passed').length
              return `| ${link(path, title(module.title))} | ${ids.length ? `${done}/${ids.length}` : '—'} |`
            }),
            '',
            `${all.filter((id) => status(p, id)?.status === 'passed').length}/${all.length}`,
          ].join('\n'),
        },
      }),
    })
  })

  // Games → steps.
  for (const game of source.games) {
    const dir = `${w.games}/${safeName(title(game.title))}`
    const statusPath = `${dir}/${w.now}.md`
    gamePath.set(game.id, statusPath)
    game.steps.forEach((step, si) => {
      const key = stepKey(game.id, step.id)
      const path = `${dir}/${w.steps}/${pad(si + 1)} ${safeName(title(step.title))}.md`
      stepPath.set(key, path)
      notes.push({
        path,
        template: note(`${title(game.title)} · ${pad(si + 1)} ${title(step.title)}`, w, [
          ['auto', 'status', w.h.status],
          `## ${w.h.skills}\n${skillLinks(step.skills)}`,
          ['maymun', 'learned', w.h.learned],
          ['maymun', 'struggled', w.h.struggled],
          ['maymun', 'asked', w.h.asked],
        ]),
        auto: (p) => ({
          front: [`type: step`, `id: ${key}`, `game: "${link(statusPath, title(game.title))}"`, `step: ${si + 1}`, `status: ${statusWord(p, key)}`, `updated: ${day(status(p, key)?.updatedAt)}`].join('\n'),
          sections: { status: statusText(p, key) },
        }),
      })
    })
    notes.push({
      path: statusPath,
      template: note(`${title(game.title)} — ${w.now}`, w, [
        ['auto', 'progress', w.h.progress],
        ['maymun', 'now', w.h.nowSection],
        ['maymun', 'next', w.h.next],
        ['maymun', 'questions', w.h.questions],
        ['auto', 'sessions', w.h.sessions],
      ]),
      auto: (p) => {
        const keys = game.steps.map((s) => stepKey(game.id, s.id))
        const done = keys.filter((k) => status(p, k)?.status === 'passed').length
        return {
          front: [`type: game`, `id: game:${game.id}`, `difficulty: ${game.difficulty}`, `steps: ${keys.length}`, `done: ${done}`].join('\n'),
          sections: {
            progress: [
              `${done}/${keys.length}`,
              '',
              `| ${w.h.step} | ${w.h.state} |`,
              '|---|---|',
              ...game.steps.map((s, i) => `| ${link(stepPath.get(keys[i])!, `${pad(i + 1)} ${title(s.title)}`)} | ${statusText(p, keys[i])} |`),
            ].join('\n'),
          },
        }
      },
    })
  }

  // Skills.
  for (const skill of source.skills) {
    const practice = [
      ...[...source.challenges.values()].filter((c) => c.skills.includes(skill.id)).map((c) => ({ key: c.id, path: challengePath.get(c.id), label: challengeTitle(c), level: c.level })),
      ...source.games.flatMap((g) =>
        g.steps
          .map((s, i) => ({ s, i }))
          .filter(({ s }) => s.skills.includes(skill.id))
          .map(({ s, i }) => ({ key: stepKey(g.id, s.id), path: stepPath.get(stepKey(g.id, s.id)), label: `${title(g.title)} · ${pad(i + 1)} ${title(s.title)}`, level: skillLevelOf[g.difficulty] })),
      ),
    ].filter((x) => x.path)
    notes.push({
      path: skillPath.get(skill.id)!,
      template: note(title(skill.title), w, [
        ['maymun', 'definition', w.h.definition],
        ['maymun', 'model', w.h.model],
        ['auto', 'practised', w.h.practised],
        ['maymun', 'mistakes', w.h.mistakes],
        ['auto', 'mastery', w.h.mastery],
        ['maymun', 'review', w.h.review],
      ]),
      auto: (p) => {
        const done = practice.filter((x) => status(p, x.key)?.status === 'passed')
        const level = Math.max(-1, ...done.map((x) => x.level))
        const review = reviewOf(done.map((x) => day(status(p, x.key)?.passedAt ?? status(p, x.key)?.updatedAt)))
        return {
          front: [
            `type: skill`,
            `id: ${skill.id}`,
            `category: ${skill.category}`,
            `level: ${level < 0 ? 'none' : level}`,
            ...(review ? [`last_practised: ${review.last}`, `next_review: ${review.next}`] : []),
          ].join('\n'),
          sections: {
            practised: practice.length ? practice.map((x) => `- ${link(x.path!, x.label)} — ${statusText(p, x.key)}`).join('\n') : w.none,
            mastery:
              level < 0
                ? w.none
                : [
                    `L${level} · ${translate(lang, `level.${level}` as 'level.0')} — ${translate(lang, `level.${level}.hint` as 'level.0.hint')}`,
                    ...(review ? ['', w.reviewLine(review.last, review.next, review.times)] : []),
                  ].join('\n'),
          },
        }
      },
    })
  }

  // Overview notes.
  const overview = (p: Progress): Overview => {
    const stepKeys = source.games.flatMap((g) => g.steps.map((s) => stepKey(g.id, s.id)))
    const passed = (k: string) => status(p, k)?.status === 'passed'
    const gameState = source.games.map((g) => g.steps.map((s) => status(p, stepKey(g.id, s.id))))
    let last: Overview['last']
    let lastAt = ''
    for (const [key, value] of Object.entries(p.challenges)) {
      const path = stepPath.get(key) ?? challengePath.get(key)
      if (path && value.updatedAt > lastAt) {
        lastAt = value.updatedAt
        last = { link: link(path, path.split('/').at(-1)!.replace(/\.md$/, '')), date: day(value.updatedAt) }
      }
    }
    return {
      games: source.games.length,
      gamesDone: gameState.filter((s) => s.every((x) => x?.status === 'passed')).length,
      gamesStarted: gameState.filter((s) => s.some(Boolean) && !s.every((x) => x?.status === 'passed')).length,
      steps: stepKeys.length,
      stepsDone: stepKeys.filter(passed).length,
      challenges: challengePath.size,
      challengesDone: [...challengePath.keys()].filter(passed).length,
      last,
    }
  }
  notes.push({
    path: `${w.now}.md`,
    template: note(w.now, w, [
      ['auto', 'overview', w.h.overview],
      ['maymun', 'now', w.h.nowSection],
      ['maymun', 'next', w.h.next],
    ]),
    auto: (p) => ({ front: 'type: overview', sections: { overview: w.overview(overview(p)) } }),
  })
  notes.push({
    path: `${w.profile}.md`,
    template: note(w.profile, w, [
      ['maymun', 'level', w.h.level],
      ['maymun', 'strengths', w.h.strengths],
      ['maymun', 'weaknesses', w.h.weaknesses],
      ['maymun', 'style', w.h.style],
      ['maymun', 'recurring', w.h.recurring],
      ['maymun', 'misconceptions', w.h.misconceptions],
    ]),
    auto: () => ({ front: 'type: profile', sections: {} }),
  })
  notes.push({ path: `${w.readme}.md`, template: readme(lang), auto: () => ({ front: 'type: readme', sections: {} }) })
  notes.push({ path: `${w.instructions}.md`, template: instructionsNote(lang), auto: () => ({ front: 'type: instructions', sections: {} }) })
  return notes
}

/** Days until the next review after practising a skill on 1, 2, 3, 4, 5+ days: spaced repetition. */
const REVIEW_DAYS = [1, 3, 7, 14, 30]

/** When a skill was last practised and when to look at it again; null when it was never practised. */
export function reviewOf(dates: string[]): { last: string; next: string; times: number } | null {
  const days = [...new Set(dates.filter(Boolean))].sort()
  const last = days.at(-1)
  if (!last) return null
  const next = new Date(`${last}T00:00:00Z`)
  next.setUTCDate(next.getUTCDate() + REVIEW_DAYS[Math.min(days.length, REVIEW_DAYS.length) - 1])
  return { last, next: next.toISOString().slice(0, 10), times: days.length }
}

/** Journal notes: one per day with activity, derived from progress dates. */
export function journalNotes(source: VaultSource, progress: Progress, notes: NoteSpec[]): NoteSpec[] {
  const w = words[source.lang]
  const pathOf = new Map<string, string>()
  for (const n of notes) {
    const id = /\nid: (.+)/.exec(`\n${n.auto(progress).front}`)?.[1]
    if (id) pathOf.set(id, n.path)
  }
  const days = new Map<string, { done: string[]; worked: string[] }>()
  const entry = (d: string) => days.get(d) ?? (days.set(d, { done: [], worked: [] }), days.get(d)!)
  for (const [key, value] of Object.entries(progress.challenges)) {
    const path = pathOf.get(key)
    if (!path) continue
    const label = link(path, path.split('/').at(-1)!.replace(/\.md$/, ''))
    if (value.status === 'passed' && value.passedAt) entry(day(value.passedAt)).done.push(label)
    const touched = day(value.updatedAt)
    if (touched && !(value.status === 'passed' && day(value.passedAt) === touched)) entry(touched).worked.push(label)
  }
  return [...days.entries()].map(([date, { done, worked }]) => ({
    path: `${w.journal}/${date}.md`,
    template: note(date, w, [['auto', 'events', w.h.progress], ['maymun', 'summary', w.h.learned]]),
    auto: () => ({
      front: ['type: journal', `date: ${date}`].join('\n'),
      sections: {
        events: [
          `### ${w.h.done}`,
          ...(done.length ? done.map((l) => `- ${l}`) : [w.none]),
          '',
          `### ${w.h.worked}`,
          ...(worked.length ? worked.map((l) => `- ${l}`) : [w.none]),
        ].join('\n'),
      },
    }),
  }))
}

/** The note with its app-owned parts (front matter, `auto:` sections) brought up to date. */
export function applyAuto(content: string, spec: NoteSpec, progress: Progress): string {
  const { front, sections } = spec.auto(progress)
  let next = writeFrontMatter(content, front)
  for (const [id, body] of Object.entries(sections)) next = writeSection(next, 'auto', id, body)
  return next
}

function readme(lang: Lang): string {
  const text =
    lang === 'tr'
      ? `# Learn Platform hafıza kasası

Bu klasör, Learn Platform'daki çalışmanın **hafızası**: her kategori, görev, oyun, oyun adımı ve beceri için bir not.

- **Kim yazar?** \`auto\` bölümleri (durum, ilerleme tabloları) uygulama, ilerledikçe kendisi yazar. \`maymun\` bölümleri
  (öğrendiklerin, zorlandıkların, sorduğun sorular, güncel durum) Maymun, konuştukça doldurur. **Notlarım** bölümü senin:
  oraya kimse dokunmaz.
- **Nerede?** Uygulamanın içinde, bu cihazda. Uygulamada **Hafıza** sayfasından okuyabilir, **Kasayı indir** ile klasör
  olarak alabilirsin.
- **Obsidian gerekmez.** İstersen Obsidian'ı kurup bu klasörü "Open folder as vault" ile aç: notlar, bağlantılar ve
  grafik görünümü (beceri haritası) hazır.
- **Sıfırlama:** Ayarlar → Tüm verileri sıfırla, bu kasayı da boş iskelete döndürür.
`
      : `# Learn Platform memory vault

This folder is the **memory** of your work in Learn Platform: one note for every category, challenge, game, game step
and skill.

- **Who writes?** \`auto\` sections (status, progress tables) are written by the app as you go. \`maymun\` sections (what
  you learned, what was hard, questions you asked, current status) are filled by Maymun as you talk. **My notes** is
  yours: nothing else touches it.
- **Where?** In the app, on this device. Read it on the **Memory** page, or take it as a folder with **Download the vault**.
- **No Obsidian needed.** If you like, install Obsidian and open this folder with "Open folder as vault": notes, links
  and the graph view (your skill map) are ready.
- **Reset:** Settings → Reset all data turns this vault back into the empty skeleton.
`
  return writeFrontMatter(text, 'type: readme')
}

/** What Maymun is told about keeping the vault (the app sends its own copy; this note is for people to read). */
export function instructionsText(lang: Lang): string {
  return lang === 'tr'
    ? `# Maymun talimatı: hafıza kasasını tutmak

Sen bu öğrencinin hafızasını tutan öğretmensin. Kasadaki notlar sonraki konuşmalarda sana geri gelir; bu yüzden onlara
yalnız **ileride işe yarayacak, öğrenci hakkında kalıcı bilgiyi** yaz.

- Yalnız \`maymun\` bölümlerine yaz. \`auto\` bölümleri ve **Notlarım** senin değil.
- Bir madde = bir cümle, somut: "\`for\` döngüsünde koşulun ne zaman bittiğini karıştırıyor (i <= length)". Sohbet özeti,
  kod kopyası, övgü yazma.
- **Öğrendiklerin:** öğrencinin kendi söylediği ya da kodunda gösterdiği anlayış. **Zorlandıkların:** takıldığı yer ve
  nedeni; öğrenci onu aşınca buradan **sil** ve öğrendiğini Öğrendiklerin'e ekle. **Sorduğun sorular:** sorunun özü, bir
  satır. **Açık sorular:** yalnız cevabı henüz bulunmamış sorular; cevaplanınca sil. **Güncel durum / Sıradaki:** her
  zaman şimdiki hâl (eskisinin üstüne yaz).
- Profil: seviye, güçlü yanlar, çalışılacaklar, ona iyi gelen anlatım biçimi, tekrar eden hatalar. Birkaç konuşmadan
  sonra ilk izlenimini yaz ("şimdilik" diyerek), gördükçe düzelt.
- Emin değilsen yazma. Yanlış yazdığını görürsen düzelt. Anahtar, şifre, kişisel bilgi asla yazma.
`
    : `# Maymun instructions: keeping the memory vault

You are the teacher who keeps this learner's memory. The notes in the vault come back to you in later conversations, so
write only **lasting facts about the learner that will help later**.

- Write only in \`maymun\` sections. \`auto\` sections and **My notes** are not yours.
- One item = one concrete sentence: "mixes up when a \`for\` loop's condition stops (i <= length)". No chat summaries,
  no copied code, no praise.
- **What you learned:** understanding the learner showed in their words or code. **What was hard:** where they got stuck
  and why; once they get past it, **remove** it there and add what they learned. **Questions you asked:** the gist, one
  line. **Open questions:** only questions not answered yet; remove them once answered. **Current status / Next:**
  always the present (overwrite the old).
- Profile: level, strengths, what needs work, the kind of explanation that works, recurring mistakes. After a few
  exchanges write a first impression (say "so far"), and correct it as you learn more.
- When unsure, do not write. Fix what you find wrong. Never write keys, passwords or personal data.
`
}

function instructionsNote(lang: Lang): string {
  return writeFrontMatter(instructionsText(lang), 'type: instructions')
}

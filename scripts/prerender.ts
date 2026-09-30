/**
 * After `vite build`: writes a real HTML file for every page, in English (at the root) and Turkish (under /tr/), so
 * search engines and AI crawlers (many of which do not run JavaScript) get each page's own title, description, links
 * and content. The app replaces the content when it starts. Also writes sitemap.xml, robots.txt, llms.txt and 404.html.
 *
 *   SITE_URL=https://learnbybuilding.dev node scripts/prerender.ts
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { marked } from 'marked'
import { loadGamesFromDisk } from '../src/games/load-node.ts'
import type { Game, GameStep } from '../src/games/schema.ts'
import { messages, type Lang } from '../src/i18n/messages.ts'

const root = resolve(import.meta.dirname, '..')
const dist = join(root, 'dist')
const SITE = (process.env.SITE_URL ?? 'https://learnbybuilding.dev').replace(/\/+$/, '')
/** The site's folder: `/` on its own domain, `/<repo>/` on GitHub Pages (as vite.config.ts builds it). */
const BASE = `${new URL(SITE).pathname.replace(/\/+$/, '')}/`
const ORIGIN = new URL(SITE).origin
const REPO = 'https://github.com/sinangumuskabak-sys/learn-by-building'
const NAME = 'Learn by Building'
const LANGS: Lang[] = ['en', 'tr']

type Text = { en: string; tr?: string }
const pick = (lang: Lang, text: Text | undefined) => (text ? (lang === 'tr' && text.tr) || text.en : '')
const t = (lang: Lang, key: keyof (typeof messages)['en']) => messages[lang][key] ?? messages.en[key]
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const md = (s: string) => marked.parse(s, { async: false, gfm: true })
const plain = (s: string) =>
  s
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
const clip = (s: string, n = 155) => (s.length > n ? `${s.slice(0, n - 1).replace(/\s+\S*$/, '')}…` : s)

/** The address of an app path in a language, from the site's folder (`/tr/games/snake`). */
const path = (lang: Lang, p: string) => `${BASE}${lang === 'tr' ? 'tr/' : ''}${p.replace(/^\//, '')}`
const url = (lang: Lang, p: string) => `${ORIGIN}${path(lang, p)}`

const { games, problems } = loadGamesFromDisk(join(root, 'content'))
if (problems.length) throw new Error(`Content problems:\n${problems.join('\n')}`)
games.sort((a, b) => a.order - b.order)
const skills = JSON.parse(readFileSync(join(root, 'content', 'skills.json'), 'utf8')) as { id: string; title: Text }[]
const skillTitle = (lang: Lang, id: string) => pick(lang, skills.find((s) => s.id === id)?.title) || id

const template = readFileSync(join(dist, 'index.html'), 'utf8')
const STYLE = `<style>.prerender{max-width:52rem;margin:0 auto;padding:1.5rem 1rem 4rem;font-family:system-ui,sans-serif;line-height:1.6}.prerender nav a{margin-right:1rem}.prerender pre{overflow:auto;padding:.75rem;border-radius:.5rem;background:rgba(127,127,127,.12)}.prerender li{margin:.25rem 0}</style>`

interface Page {
  /** App path, same in both languages. */
  path: string
  title: string
  description: string
  body: string
  /** The app path where the page's content really lives, when that is another address. */
  canonical?: string
  noindex?: boolean
  jsonLd?: object[]
  type?: 'website' | 'article'
}

function render(lang: Lang, page: Page): string {
  const canonical = url(lang, page.canonical ?? page.path)
  const other = (l: Lang) => url(l, page.canonical ?? page.path)
  const head = [
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.description)}" />`,
    page.noindex ? '<meta name="robots" content="noindex" />' : `<link rel="canonical" href="${canonical}" />`,
    ...(page.noindex
      ? []
      : [
          ...LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${other(l)}" />`),
          `<link rel="alternate" hreflang="x-default" href="${other('en')}" />`,
        ]),
    `<meta property="og:site_name" content="${NAME}" />`,
    `<meta property="og:type" content="${page.type ?? 'website'}" />`,
    `<meta property="og:title" content="${esc(page.title)}" />`,
    `<meta property="og:description" content="${esc(page.description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${ORIGIN}${BASE}og.png" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    `<meta property="og:locale" content="${lang === 'tr' ? 'tr_TR' : 'en_US'}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    ...(page.jsonLd ?? []).map((data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`),
    STYLE,
  ].join('\n    ')
  return template
    .replace(/<html lang="[^"]*">/, `<html lang="${lang}">`)
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta name="description"[^>]*>/, head)
    .replace('<div id="root"></div>', `<div id="root"><div class="prerender">${nav(lang)}${page.body}</div></div>`)
}

const nav = (lang: Lang) =>
  `<nav><a href="${path(lang, '/')}"><strong>${NAME}</strong></a><a href="${path(lang, '/')}">${esc(t(lang, 'nav.games'))}</a><a href="${path(lang, '/skills')}">${esc(t(lang, 'nav.skills'))}</a><a href="${REPO}">GitHub</a><a href="${path(lang === 'tr' ? 'en' : 'tr', '/')}" hreflang="${lang === 'tr' ? 'en' : 'tr'}">${lang === 'tr' ? 'English' : 'Türkçe'}</a></nav>`

const madeWith = (lang: Lang, game: Game) =>
  game.kind === 'web'
    ? lang === 'tr'
      ? 'HTML, CSS ve JavaScript ile'
      : 'with HTML, CSS and JavaScript'
    : lang === 'tr'
      ? 'JavaScript ile'
      : 'in JavaScript'

const breadcrumb = (lang: Lang, items: [string, string][]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: url(lang, p) })),
})

function homePage(lang: Lang): Page {
  const tr = lang === 'tr'
  const steps = games.reduce((sum, g) => sum + g.steps.length, 0)
  const title = tr ? `${NAME}: oyun ve web sayfası yaparak kodlamayı öğren` : `${NAME}: learn to code by building games and web pages`
  const description = tr
    ? `Ücretsiz ve açık kaynak: ${games.length} proje, ${steps} küçük adım. Tarayıcıda JavaScript, HTML ve CSS yazarak Yılan, Tetris, Pong gibi oyunlar yap. Kayıt yok.`
    : `Free and open source: ${games.length} projects in ${steps} small steps. Build Snake, Pong, Tetris-style games and web pages with JavaScript, HTML and CSS in your browser. No sign-up.`
  const list = (kind: 'web' | 'game') =>
    games
      .filter((g) => g.kind === kind)
      .map((g) => `<li><a href="${path(lang, `/games/${g.id}/${g.steps[0].id}`)}">${esc(pick(lang, g.title))}</a>: ${esc(pick(lang, g.description))} (${g.steps.length} ${tr ? 'adım' : 'steps'})</li>`)
      .join('')
  const body = [
    `<h1>${esc(title)}</h1>`,
    `<p>${esc(t(lang, 'games.subtitle'))}</p>`,
    `<p>${esc(t(lang, 'github.ask'))} <a href="${REPO}">GitHub</a></p>`,
    `<h2>${esc(t(lang, 'games.projects'))}</h2><ul>${list('web')}</ul>`,
    `<h2>${esc(t(lang, 'games.games'))}</h2><ul>${list('game')}</ul>`,
  ].join('')
  return {
    path: '/',
    title,
    description,
    body,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: NAME,
        url: url(lang, '/'),
        inLanguage: lang,
        description,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: NAME,
        url: url(lang, '/'),
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Any (web browser)',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        inLanguage: ['en', 'tr'],
        description,
        sameAs: [REPO],
      },
    ],
  }
}

const stepText = (lang: Lang, step: GameStep) =>
  [step.goal, step.explanation, step.meaning, step.task].map((x) => pick(lang, x)).filter(Boolean)

function stepPage(lang: Lang, game: Game, index: number): Page {
  const tr = lang === 'tr'
  const step = game.steps[index]
  const gameTitle = pick(lang, game.title)
  const first = index === 0
  const title = first
    ? tr
      ? `${gameTitle} ${game.kind === 'web' ? 'sayfasını' : 'oyununu'} ${madeWith(lang, game)} adım adım yap | ${NAME}`
      : `Build ${gameTitle} ${madeWith(lang, game)}, step by step | ${NAME}`
    : `${tr ? `${index + 1}. adım` : `Step ${index + 1}`}: ${pick(lang, step.title)} (${gameTitle}) | ${NAME}`
  const description = clip(first ? `${pick(lang, game.description)} ${plain(stepText(lang, step)[0] ?? '')}` : plain(stepText(lang, step).join(' ')))
  const section = (heading: string, text?: Text) => (text && pick(lang, text) ? `<h2>${esc(heading)}</h2>${md(pick(lang, text))}` : '')
  const prev = game.steps[index - 1]
  const next = game.steps[index + 1]
  const body = [
    `<p><a href="${path(lang, '/')}">${esc(t(lang, 'nav.games'))}</a> › ${esc(gameTitle)} › ${tr ? `${index + 1}/${game.steps.length}. adım` : `Step ${index + 1} of ${game.steps.length}`}</p>`,
    `<h1>${esc(first ? `${gameTitle}: ${pick(lang, step.title)}` : pick(lang, step.title))}</h1>`,
    first ? `<p>${esc(pick(lang, game.description))}</p>` : '',
    section(tr ? 'Ne yapıyoruz' : 'What we are doing', step.goal ?? step.explanation),
    step.code ? `<pre><code>${esc(step.code)}</code></pre>` : '',
    section(tr ? 'Ne işe yarıyor' : 'What it means', step.meaning),
    section(tr ? 'Sıra sende' : 'Your turn', step.task),
    step.skills.length ? `<p>${tr ? 'Beceriler' : 'Skills'}: ${step.skills.map((s) => esc(skillTitle(lang, s))).join(', ')}</p>` : '',
    `<p>${prev ? `<a href="${path(lang, `/games/${game.id}/${prev.id}`)}" rel="prev">← ${esc(pick(lang, prev.title))}</a> ` : ''}${next ? `<a href="${path(lang, `/games/${game.id}/${next.id}`)}" rel="next">${esc(pick(lang, next.title))} →</a>` : ''}</p>`,
    `<h2>${tr ? 'Tüm adımlar' : 'All steps'}</h2><ol>${game.steps.map((s) => `<li><a href="${path(lang, `/games/${game.id}/${s.id}`)}">${esc(pick(lang, s.title))}</a></li>`).join('')}</ol>`,
  ].join('')
  const stepPath = `/games/${game.id}/${step.id}`
  return {
    path: stepPath,
    title,
    description,
    body,
    type: 'article',
    jsonLd: [
      breadcrumb(lang, [
        [t(lang, 'nav.games'), '/'],
        [gameTitle, `/games/${game.id}/${game.steps[0].id}`],
        ...(first ? [] : [[pick(lang, step.title), stepPath] as [string, string]]),
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'LearningResource',
        name: first ? `${gameTitle} ${madeWith(lang, game)}` : pick(lang, step.title),
        description,
        url: url(lang, stepPath),
        inLanguage: lang,
        learningResourceType: 'Tutorial',
        educationalLevel: t(lang, `games.difficulty.${game.difficulty}` as keyof (typeof messages)['en']),
        isAccessibleForFree: true,
        teaches: (first ? game.skills : step.skills).map((s) => skillTitle(lang, s)),
        ...(first
          ? { hasPart: game.steps.map((s) => ({ '@type': 'LearningResource', name: pick(lang, s.title), url: url(lang, `/games/${game.id}/${s.id}`) })) }
          : { isPartOf: { '@type': 'LearningResource', name: gameTitle, url: url(lang, `/games/${game.id}/${game.steps[0].id}`) }, position: index + 1 }),
        provider: { '@type': 'Organization', name: NAME, url: url(lang, '/') },
      },
    ],
  }
}

const written: { path: string; lastmod?: string }[] = []
function write(lang: Lang, page: Page) {
  const file = join(dist, ...(lang === 'tr' ? ['tr'] : []), ...page.path.split('/').filter(Boolean), 'index.html')
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, render(lang, page))
  if (!page.noindex && !page.canonical) written.push({ path: page.path })
}

for (const lang of LANGS) {
  const home = homePage(lang)
  write(lang, home)
  write(lang, { ...home, path: '/games', canonical: '/' })
  for (const game of games) {
    game.steps.forEach((_, i) => write(lang, stepPage(lang, game, i)))
    // The game's own address opens its first (or next) step.
    const first = stepPage(lang, game, 0)
    write(lang, { ...first, path: `/games/${game.id}`, canonical: first.path })
  }
  write(lang, {
    path: '/skills',
    title: `${t(lang, 'skills.title')} | ${NAME}`,
    description: clip(t(lang, 'skills.subtitle')),
    body: `<h1>${esc(t(lang, 'skills.title'))}</h1><p>${esc(t(lang, 'skills.subtitle'))}</p><ul>${skills.map((s) => `<li>${esc(pick(lang, s.title))}</li>`).join('')}</ul>`,
  })
  for (const [p, key] of [['/memory', 'vault.title'], ['/settings', 'settings.title']] as const) {
    write(lang, { path: p, title: `${t(lang, key)} | ${NAME}`, description: t(lang, 'games.subtitle'), body: `<h1>${esc(t(lang, key))}</h1>`, noindex: true })
  }
}

// Any other address: the app (it shows its own "not found" page), kept out of search results.
writeFileSync(join(dist, '404.html'), render('en', { path: '/404', title: NAME, description: t('en', 'games.subtitle'), body: '', noindex: true }))

const today = new Date().toISOString().slice(0, 10)
writeFileSync(
  join(dist, 'sitemap.xml'),
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...[...new Set(written.map((w) => w.path))].flatMap((p) =>
      LANGS.map(
        (lang) =>
          `  <url><loc>${url(lang, p)}</loc><lastmod>${today}</lastmod>${LANGS.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${url(l, p)}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${url('en', p)}"/></url>`,
      ),
    ),
    '</urlset>',
    '',
  ].join('\n'),
)

writeFileSync(
  join(dist, 'robots.txt'),
  ['User-agent: *', 'Allow: /', `Disallow: ${BASE}memory`, `Disallow: ${BASE}settings`, `Disallow: ${BASE}tr/memory`, `Disallow: ${BASE}tr/settings`, '', `Sitemap: ${ORIGIN}${BASE}sitemap.xml`, ''].join('\n'),
)

const totalSteps = games.reduce((sum, g) => sum + g.steps.length, 0)
writeFileSync(
  join(dist, 'llms.txt'),
  [
    `# ${NAME}`,
    '',
    `> Free, open-source website for learning to code by building games and web pages in the browser, one small step at a time. ${games.length} projects, ${totalSteps} steps, in English and Turkish. No sign-up; progress stays in the browser.`,
    '',
    '## Facts',
    '',
    `- Address: ${url('en', '/')} (Turkish: ${url('tr', '/')})`,
    `- Source code: ${REPO} (open source)`,
    '- Price: free. No account, no ads, no tracking; everything is stored in the learner\'s browser.',
    '- Languages taught: JavaScript, HTML, CSS. Interface and lessons: English and Turkish.',
    '- Method: every step has four parts in order: what we are doing, the code, what it means, your turn. Checks run in the browser; the result (game or page) shows next to the code.',
    '- Maymun, an optional AI tutor (a cat), answers questions about the step, using the learner\'s own AI key or a free model; it keeps a memory of the learner\'s work in Markdown notes that open in Obsidian.',
    '',
    '## Build projects (web pages)',
    '',
    ...games.filter((g) => g.kind === 'web').map((g) => `- [${g.title.en}](${url('en', `/games/${g.id}/${g.steps[0].id}`)}): ${g.description.en} (${g.steps.length} steps)`),
    '',
    '## Games',
    '',
    ...games.filter((g) => g.kind === 'game').map((g) => `- [${g.title.en}](${url('en', `/games/${g.id}/${g.steps[0].id}`)}): ${g.description.en} (${g.difficulty}, ${g.steps.length} steps)`),
    '',
  ].join('\n'),
)

console.log(`prerender: ${new Set(written.map((w) => w.path)).size} indexable pages per language, ${LANGS.length} languages, site ${SITE}`)

// After a deploy: tells IndexNow search engines (Bing, Yandex and others) about every page in the sitemap, so they
// crawl the new version now rather than some day. The key file lives in public/ (<key>.txt).
//   SITE_URL=https://learnbybuilding.dev node scripts/indexnow.mjs
import { readdirSync } from 'node:fs'

const site = (process.env.SITE_URL ?? 'https://learnbybuilding.dev').replace(/\/+$/, '')
const keyFile = readdirSync(new URL('../public/', import.meta.url)).find((f) => /^[0-9a-f]{32}\.txt$/.test(f))
if (!keyFile) throw new Error('No IndexNow key file in public/')
const key = keyFile.slice(0, -4)

const sitemap = await (await fetch(`${site}/sitemap.xml`)).text()
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
if (!urls.length) throw new Error('The sitemap lists no pages')

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: new URL(site).host, key, keyLocation: `${site}/${keyFile}`, urlList: urls.slice(0, 10_000) }),
})
console.log(`IndexNow: ${urls.length} pages, answer ${response.status}`)
if (response.status >= 400 && response.status !== 429) process.exit(1)

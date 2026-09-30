// Draws public/og.png, the picture shown when a link to the site is shared (1200x630): node scripts/og-image.mjs
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;font-family:Inter,'Segoe UI',system-ui,sans-serif;color:#fff;
background:radial-gradient(circle at 85% 20%,#6d5dfc 0,transparent 45%),radial-gradient(circle at 10% 90%,#0ea5e9 0,transparent 40%),#111427;
display:flex;flex-direction:column;justify-content:space-between;padding:72px 80px;overflow:hidden;position:relative}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);background-size:40px 40px}
.brand{display:flex;align-items:center;gap:18px;font-size:30px;font-weight:600;position:relative}
.logo{width:56px;height:56px;border-radius:14px;background:#5b4cf5;display:grid;place-items:center;font-size:30px}
h1{font-size:76px;line-height:1.05;font-weight:800;letter-spacing:-2px;position:relative;max-width:900px}
h1 span{background:linear-gradient(90deg,#a5b4fc,#67e8f9);-webkit-background-clip:text;color:transparent}
p{font-size:30px;color:#c7cbe6;position:relative;max-width:860px;margin-top:20px}
.row{display:flex;gap:14px;position:relative}
.pill{border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);border-radius:999px;padding:10px 22px;font-size:24px}
.code{position:absolute;right:70px;top:190px;font:22px/1.5 'Cascadia Code',Consolas,monospace;color:#a5b4fc;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:22px 26px;transform:rotate(3deg)}
.code b{color:#67e8f9;font-weight:400}.code i{color:#fda4af;font-style:normal}
</style></head><body><div class="grid"></div>
<div class="brand"><div class="logo">🎓</div>Learn by Building</div>
<div><h1>Learn to code by<br><span>building games</span></h1><p>Snake, Pong, web pages and more, one small step at a time, right in your browser.</p></div>
<div class="code"><b>function</b> draw() {<br>&nbsp;&nbsp;ctx.fillStyle = <i>'#22c55e'</i><br>&nbsp;&nbsp;ctx.fillRect(x, y, 20, 20)<br>}</div>
<div class="row"><span class="pill">47 projects</span><span class="pill">1,421 small steps</span><span class="pill">Free &amp; open source</span><span class="pill">EN · TR</span></div>
</body></html>`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.setContent(html)
await page.screenshot({ path: fileURLToPath(new URL('../public/og.png', import.meta.url)) })
await browser.close()
console.log('ok')

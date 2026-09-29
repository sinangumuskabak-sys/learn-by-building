---
title: Lives
title_tr: Canlar
skills: [game.state]
---

# --goal--

So far nothing bad happens when a word lands. Now each landed word costs a **life**. Two words could land in the same
frame, so we take away `landed.length`, not 1.

# --goal-tr--

Şimdiye kadar yere inen kelime bir şeye mal olmuyordu. Artık her inen kelime bir **can** götürecek; başta 3 can var.

Aynı karede iki kelime birden inebilir; bu yüzden 1 değil, **inen kelime sayısı** kadar can düşeceğiz.

# --code--

```js
const GROUND = 330 // a word that falls past this line costs a life

let lives

  lives = 3

  const landed = words.filter((w) => w.y > GROUND)
  if (landed.length === 0) return
  words = words.filter((w) => w.y <= GROUND)
  if (landed.includes(target)) target = null
  lives -= landed.length
```

# --meaning--

- `lives` starts at 3.
- If nothing landed this frame, `update` stops right there; the rest only runs when something landed.
- `lives -= landed.length` takes one life for each landed word.

# --meaning-tr--

- `GROUND`'un yorumu artık yeni kuralı anlatıyor.
- `let lives` → can sayısı; `reset` içinde `3`.
- `if (landed.length === 0) return` → bu karede hiçbir kelime inmediyse `update`'ten çık; alttaki satırlar yalnız bir
  şey indiğinde çalışır.
- `lives -= landed.length` → inen her kelime için bir can eksilt. `-=` "üstünden çıkar".

# --task--

1. Update the comment on `GROUND`.
2. Under `let typed ...` write `let lives`; in `reset`, under `typed = 0`, write `lives = 3`.
3. In `update`, add the `landed.length` line under `landed`, and `lives -= ...` at the end.

# --task-tr--

1. `GROUND` satırının sonundaki yorumu kodda görüldüğü gibi değiştir.
2. `let typed ...` satırının altına `let lives` yaz; `reset` içinde `typed = 0` satırının altına `lives = 3` yaz.
3. `update` içinde `const landed = ...` satırının altına `if (landed.length === 0) return` yaz; fonksiyonun sonuna,
   `includes` satırının altına `lives -= landed.length` yaz.
4. **Çalıştır**: canlar henüz görünmez; bir sonraki adımda çizeceğiz.

# --tests--

A word that lands should cost a life.
tr: İnen bir kelime bir cana mal olmalı.

```js
spawnTimer = 1000
assert.strictEqual(lives, 3)
words = [{ text: 'cat', x: 10, y: GROUND }, { text: 'sun', x: 100, y: 50 }]
$.press('c')
$.tick(1)
assert.strictEqual(lives, 2, 'a word that lands costs a life')
assert.isNull(target)
assert.lengthOf(words, 1)
```

Two words landing together should cost two lives.
tr: Birlikte inen iki kelime iki cana mal olmalı.

```js
spawnTimer = 1000
words = [{ text: 'cat', x: 10, y: GROUND }, { text: 'sun', x: 100, y: GROUND }]
$.tick(1)
assert.strictEqual(lives, 1)
```

# --solution--

```js
// Typing game, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const WORDS = [
  'cat', 'sun', 'code', 'game', 'jump', 'fast', 'loop', 'byte', 'star', 'tree', 'rain', 'blue', 'fire', 'wind', 'moon',
  'array', 'pixel', 'mouse', 'score', 'level', 'robot', 'light', 'music', 'space', 'river', 'green', 'cloud', 'train',
  'planet', 'rocket', 'string', 'number', 'button', 'screen', 'window', 'random', 'object', 'player', 'dragon', 'puzzle',
  'keyboard', 'function', 'variable', 'computer', 'triangle', 'elephant', 'mountain', 'sandwich',
]
const GROUND = 330 // a word that falls past this line costs a life
const SPEED = 0.35
const SPAWN_EVERY = 138
const FONT = 'bold 20px monospace'

let words // { text, x, y }
let target // the word being typed, or null
let typed // how many letters of the target are typed
let lives
let spawnTimer

function spawn() {
  const text = WORDS[Math.floor(Math.random() * WORDS.length)]
  ctx.font = FONT
  const width = ctx.measureText(text).width
  words.push({ text, x: 10 + Math.random() * (canvas.width - 20 - width), y: 30 })
}

function reset() {
  words = []
  target = null
  typed = 0
  lives = 3
  spawnTimer = 0
}

function type(key) {
  if (!target) {
    // Lock on to the lowest word starting with this letter: it is the most urgent.
    const options = words.filter((w) => w.text[0] === key).sort((a, b) => b.y - a.y)
    if (options.length === 0) return
    target = options[0]
    typed = 0
  }
  if (target.text[typed] !== key) return
  typed += 1
  if (typed === target.text.length) {
    words = words.filter((w) => w !== target)
    target = null
  }
}

function update() {
  spawnTimer -= 1
  if (spawnTimer <= 0) {
    spawn()
    spawnTimer = SPAWN_EVERY
  }
  for (const w of words) w.y += SPEED
  const landed = words.filter((w) => w.y > GROUND)
  if (landed.length === 0) return
  words = words.filter((w) => w.y <= GROUND)
  if (landed.includes(target)) target = null
  lives -= landed.length
}

document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase()
  if (key.length === 1 && key >= 'a' && key <= 'z') {
    event.preventDefault()
    type(key)
  }
})

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#7f1d1d'
  ctx.fillRect(0, GROUND + 4, canvas.width, 3)

  ctx.font = FONT
  ctx.textAlign = 'left'
  for (const w of words) {
    // The typed part in yellow, the rest in white right after it.
    const done = w === target ? w.text.slice(0, typed) : ''
    ctx.fillStyle = '#facc15'
    ctx.fillText(done, w.x, w.y)
    ctx.fillStyle = w === target ? '#ffffff' : '#cbd5e1'
    ctx.fillText(w.text.slice(done.length), w.x + ctx.measureText(done).width, w.y)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```

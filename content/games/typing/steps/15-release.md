---
title: Let go of a lost word
title_tr: Kaybolan kelimeyi bırak
skills: [game.state]
---

# --goal--

If the target falls past the ground while you are typing it, the lock must be released; otherwise you would stay
locked on to a word that is gone.

# --goal-tr--

Bir hata var: yazmakta olduğun kelime zemini geçip kaybolursa `target` hâlâ onu gösteriyor. Artık ekranda olmayan bir
kelimeye kilitli kalırsın ve hiçbir şey yazamazsın.

Çözüm: zemini geçen kelimeleri önce ayrı bir listeye toplayalım (`landed`, inenler). Hedef onların arasındaysa kilidi
bırakalım.

# --code--

```js
const landed = words.filter((w) => w.y > GROUND)
words = words.filter((w) => w.y <= GROUND)
if (landed.includes(target)) target = null
```

# --meaning--

- `landed` collects the words below the ground, before they are removed.
- `includes(target)` is `true` if the target is one of them; then the lock is released.

# --meaning-tr--

- `const landed = words.filter((w) => w.y > GROUND)` → zemini **geçen** kelimeler (`>` "büyük").
- `words = words.filter(...)` → eskisi gibi, kalanlar.
- `landed.includes(target)` → `includes`, liste bu elemanı **içeriyor mu** diye sorar. Hedef inenlerdense
  `target = null`.

# --task--

In `update`, write the `landed` line above the `filter` line and the `includes` line under it.

# --task-tr--

`update` içinde `words = words.filter(...)` satırının **üstüne** `landed` satırını, **altına** `includes` satırını yaz.
**Çalıştır**.

# --tests--

A target that falls away should be released.
tr: Düşüp giden bir hedef bırakılmalı.

```js
spawnTimer = 1000
words = [{ text: 'sun', x: 50, y: 100 }]
$.press('s')
$.press('u')
words[0].y = GROUND
$.tick(1)
assert.isNull(target, 'a word that falls away is no longer the target')
words = [{ text: 'cat', x: 50, y: 100 }]
$.press('c')
assert.strictEqual(target.text, 'cat', 'free to lock on again')
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
const GROUND = 330 // words that fall past this line are gone
const SPEED = 0.35
const SPAWN_EVERY = 138
const FONT = 'bold 20px monospace'

let words // { text, x, y }
let target // the word being typed, or null
let typed // how many letters of the target are typed
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
  words = words.filter((w) => w.y <= GROUND)
  if (landed.includes(target)) target = null
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

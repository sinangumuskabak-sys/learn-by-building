---
title: Gone past the ground
title_tr: Zemini geçince gider
skills: [prog.arrays]
---

# --goal--

A word that falls past the ground is removed from the list. `filter` keeps only the words still above it.

# --goal-tr--

Şu an kelimeler zemini geçip ekrandan çıkıyor ama listede kalıyorlar; liste durmadan uzuyor. Zemini geçen kelimeyi
listeden **atacağız**.

Bunun için `filter` (süz) kullanırız: listedeki her elemana bir soru sorar ve yalnız "evet" diyenlerden **yeni bir
liste** kurar. Kahveyi süzgeçten geçirmek gibi: telveler kalır, kahve geçer.

# --code--

```js
words = words.filter((w) => w.y <= GROUND)
```

# --meaning--

- `filter` calls the arrow function for every word and keeps those for which it is `true`: the words at or above
  the ground. The result replaces the list.

# --meaning-tr--

- `words.filter((w) => w.y <= GROUND)` → her kelime (`w`) için sorar: "`y`'si `GROUND`'dan küçük ya da eşit mi?"
  Evet diyenlerden yeni bir liste kurar. `(w) => ...` adı olmayan kısa bir fonksiyondur; `=>`'nin sağındaki cevabı
  verir.
- `words = ...` → eski listenin yerine süzülmüşü koyar.

# --task--

In `update`, under the `for` line, write the `filter` line.

# --task-tr--

`update`'in sonunda, `for` satırının altına `filter` satırını yaz. **Çalıştır**: kelimeler kırmızı çizgiye gelince
kaybolmalı.

# --tests--

A word past the ground should be gone.
tr: Zemini geçen kelime gitmeli.

```js
spawnTimer = 1000
words = [{ text: 'cat', x: 10, y: GROUND - 0.1 }, { text: 'sun', x: 100, y: 50 }]
$.tick(1)
assert.deepEqual(words.map((w) => w.text), ['sun'])
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
let spawnTimer

function spawn() {
  const text = WORDS[Math.floor(Math.random() * WORDS.length)]
  ctx.font = FONT
  const width = ctx.measureText(text).width
  words.push({ text, x: 10 + Math.random() * (canvas.width - 20 - width), y: 30 })
}

function reset() {
  words = []
  spawnTimer = 0
}

function update() {
  spawnTimer -= 1
  if (spawnTimer <= 0) {
    spawn()
    spawnTimer = SPAWN_EVERY
  }
  for (const w of words) w.y += SPEED
  words = words.filter((w) => w.y <= GROUND)
}

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#7f1d1d'
  ctx.fillRect(0, GROUND + 4, canvas.width, 3)

  ctx.font = FONT
  ctx.textAlign = 'left'
  ctx.fillStyle = '#cbd5e1'
  for (const w of words) ctx.fillText(w.text, w.x, w.y)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```

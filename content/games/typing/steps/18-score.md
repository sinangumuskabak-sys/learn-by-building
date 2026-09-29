---
title: Score
title_tr: Puan
skills: [game.state]
---

# --goal--

Each finished word scores one point per letter: long words are harder, so they are worth more. The score is shown at
the top left.

# --goal-tr--

Bitirdiğin her kelime **harf başına bir puan** getirir: `cat` 3, `keyboard` 8 puan. Uzun kelimeler daha zor, bu yüzden
daha değerli. Puanı sol üste yazacağız: `Score 12`.

# --code--

```js
let score

  score = 0

    words = words.filter((w) => w !== target)
    score += target.text.length

  ctx.font = 'bold 16px sans-serif'
  ctx.fillText('Score ' + score, 10, 22)
```

# --meaning--

- `score` starts at 0 and grows by the word's length when it is finished.
- The score line comes before `textAlign = 'right'`, so it is still left-aligned (from the words), at `(10, 22)`.

# --meaning-tr--

- `let score` → puan; `reset` içinde `0`.
- `score += target.text.length` → kelime bitince harf sayısı kadar puan. Bu satır `target = null`'dan **önce**
  olmalı; sonra `target` artık yok.
- `ctx.fillText('Score ' + score, 10, 22)` → `+` bir yazıyla bir sayıyı yan yana ekler: `'Score 12'`. Kalem hâlâ
  sola hizalı (kelimeler için öyle ayarlamıştık); `textAlign = 'right'` bu satırın **altında**.

# --task--

1. Under `let lives` write `let score`; in `reset`, under `lives = 3`, write `score = 0`.
2. In `type`, under the line that removes the finished word, write `score += ...`.
3. In `draw`, under `ctx.font = 'bold 16px sans-serif'`, write the score line.

# --task-tr--

1. `let lives` satırının altına `let score` yaz; `reset` içinde `lives = 3` satırının altına `score = 0` yaz.
2. `type` içinde bitmiş kelimeyi silen `words = words.filter((w) => w !== target)` satırının altına
   `score += target.text.length` yaz.
3. `draw` içinde `ctx.font = 'bold 16px sans-serif'` satırının altına puan satırını yaz (`textAlign = 'right'` onun
   altında kalır).
4. **Çalıştır**: sol üstte `Score 0`; kelime yazdıkça artmalı.

# --tests--

A finished word should score one point per letter.
tr: Biten bir kelime harf başına bir puan getirmeli.

```js
spawnTimer = 1000
assert.strictEqual(score, 0)
words = [{ text: 'sun', x: 10, y: 50 }]
$.press('s')
$.press('u')
$.press('n')
assert.strictEqual(score, 3)
words = [{ text: 'rocket', x: 10, y: 50 }]
for (const k of 'rocket') $.press(k)
assert.strictEqual(score, 9)
```

The score should be drawn at the top left.
tr: Puan sol üste yazılmalı.

```js
score = 12
$.tick(1)
const call = $.screen().find((c) => c.op === 'fillText' && c.args[0] === 'Score 12')
assert.exists(call)
assert.deepEqual(call.args.slice(1, 3), [10, 22])
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
let score
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
  score = 0
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
    score += target.text.length
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

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.fillText('Score ' + score, 10, 22)
  ctx.textAlign = 'right'
  ctx.fillText('♥'.repeat(lives), canvas.width - 10, 22)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```

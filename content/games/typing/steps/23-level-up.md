---
title: Levels
title_tr: Seviyeler
skills: [game.state]
---

# --goal--

Every 10 words you go up a **level**. Letters are worth `level` points each, so surviving longer pays.

# --goal-tr--

Her **10 kelimede** bir **seviye** atlarsın. Seviye yükseldikçe harfler daha değerli olur: 2. seviyede her harf 2
puan. Uzun dayanmak kazandırır. Seviye, puanın yanında görünecek: `Score 36  Level 2`.

# --code--

```js
let level
let cleared // words typed this game

  level = 1
  cleared = 0

    score += target.text.length * level
    cleared += 1
    if (cleared % 10 === 0) level += 1

  ctx.fillText('Score ' + score + '  Level ' + level, 10, 22)
```

# --meaning--

- `cleared` counts finished words. `cleared % 10` is the remainder of dividing by 10; it is 0 at 10, 20, 30 words, and
  then the level goes up.
- A word scores its length times the level.

# --meaning-tr--

- `let level` → seviye; `reset` içinde `1`. `let cleared` → bu oyunda bitirilen kelime sayısı; `0`.
- `score += target.text.length * level` → harf sayısı **çarpı** seviye.
- `cleared += 1` → bir kelime daha.
- `if (cleared % 10 === 0) level += 1` → `%` **bölümden kalan**: `10 % 10` = 0, `13 % 10` = 3. Kalan 0 ise 10'un katına
  gelmişiz: seviye atla.
- Puan satırına `'  Level ' + level` eklendi.

# --task--

1. Under `let score` write `let level` and `let cleared`; in `reset`, under `score = 0`, write `level = 1` and
   `cleared = 0`.
2. In `type`, change the score line and add the two lines under it.
3. In `draw`, add the level to the score text.

# --task-tr--

1. `let score` satırının altına `let level` ve `let cleared ...` yaz; `reset` içinde `score = 0` satırının altına
   `level = 1` ve `cleared = 0` yaz.
2. `type` içinde `score += target.text.length` satırının sonuna ` * level` ekle; altına iki satırı yaz.
3. `draw` içinde puan yazısını `'Score ' + score + '  Level ' + level` yap.
4. **Çalıştır**.

# --tests--

Ten words should raise the level, and letters should be worth the level.
tr: On kelime seviyeyi yükseltmeli ve harfler seviye kadar değerli olmalı.

```js
spawnTimer = 100000
assert.strictEqual(level, 1)
for (let i = 0; i < 10; i++) {
  words = [{ text: 'sun', x: 10, y: 50 }]
  for (const k of 'sun') $.press(k)
}
assert.strictEqual(level, 2, 'ten words: next level')
assert.strictEqual(score, 30)
words = [{ text: 'sun', x: 10, y: 50 }]
for (const k of 'sun') $.press(k)
assert.strictEqual(score, 36, 'letters count double at level 2')
$.tick(1)
assert.include($.texts(), 'Score 36 Level 2')
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
let level
let cleared // words typed this game
let spawnTimer
let state // 'playing' or 'over'

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
  level = 1
  cleared = 0
  spawnTimer = 0
  state = 'playing'
}

function type(key) {
  if (state !== 'playing') return
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
    score += target.text.length * level
    cleared += 1
    if (cleared % 10 === 0) level += 1
    target = null
  }
}

function gameOver() {
  state = 'over'
}

function update() {
  if (state !== 'playing') return
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
  if (lives <= 0) {
    lives = 0
    gameOver()
  }
}

document.addEventListener('keydown', (event) => {
  if (state === 'over' && event.key === 'Enter') return reset()
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
  ctx.fillText('Score ' + score + '  Level ' + level, 10, 22)
  ctx.textAlign = 'right'
  ctx.fillText('♥'.repeat(lives), canvas.width - 10, 22)

  if (state === 'over') {
    ctx.fillStyle = 'rgba(2, 6, 23, 0.85)'
    ctx.fillRect(40, 105, canvas.width - 80, 120)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = 'bold 26px sans-serif'
    ctx.fillText('Game over', canvas.width / 2, 140)
    ctx.font = '18px sans-serif'
    ctx.fillText('Press Enter to play again', canvas.width / 2, 175)
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

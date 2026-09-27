---
title: Faster and faster
title_tr: Gittikçe hızlanarak
skills: [game.state, prog.functions]
---

# --explanation--

A game that never gets harder gets boring. Every 10 words you go up a **level**, and two things change: words fall faster and
come more often.

Instead of the constants `SPEED` and `SPAWN_EVERY`, we use two tiny functions of the level:

```js
const speed = () => 0.25 + level * 0.1
const spawnEvery = () => Math.max(40, 150 - level * 12)
```

`Math.max(40, ...)` puts a floor under the gap between words. Without it, by level 13 the gap would be negative and words would
pour out every frame. Tuning these numbers is real game design: with them, a player typing 18 words per minute lasts about
40 seconds, one at 36 about two minutes, and one at 60 more than three.

Letters are also worth `level` points each, so surviving longer pays. The best score is saved in `localStorage` when the game
ends.

# --explanation-tr--

Hiç zorlaşmayan bir oyun sıkıcı olur. Her 10 kelimede bir **seviye** atlarsın ve iki şey değişir: kelimeler daha hızlı düşer
ve daha sık gelir.

`SPEED` ve `SPAWN_EVERY` sabitleri yerine seviyenin iki küçük fonksiyonunu kullanırız:

```js
const speed = () => 0.25 + level * 0.1
const spawnEvery = () => Math.max(40, 150 - level * 12)
```

`Math.max(40, ...)` kelimeler arasındaki aralığın altına bir taban koyar. O olmasa 13. seviyede aralık negatif olur ve kelimeler
her karede yağardı. Bu sayıları ayarlamak gerçek oyun tasarımıdır: onlarla dakikada 18 kelime yazan bir oyuncu yaklaşık 40
saniye, 36 yazan yaklaşık iki dakika, 60 yazan da üç dakikadan fazla dayanır.

Harfler de her biri `level` puan değerindedir; böylece daha uzun dayanmak kazandırır. En iyi puan oyun bittiğinde
`localStorage`'a kaydedilir.

# --task--

1. Replace `SPEED` and `SPAWN_EVERY` with `speed()` and `spawnEvery()` as above.
2. Add `level` and `cleared` (`1` and `0` in `reset()`). A finished word scores `length * level`, adds 1 to `cleared`, and
   every 10th word adds 1 to `level`.
3. Write `gameOver()`: set `'over'` and save `score` in `localStorage` under `'typing-best'` if it beats `best`.
4. Draw `Score 36  Level 2` on the left and `♥♥♥  Best 42` on the right.

# --task-tr--

1. `SPEED` ve `SPAWN_EVERY`'yi yukarıdaki gibi `speed()` ve `spawnEvery()` ile değiştir.
2. `level` ve `cleared` ekle (`reset()`'te `1` ve `0`). Biten bir kelime `length * level` puan getirir, `cleared`'a 1 ekler ve
   her 10. kelime `level`'a 1 ekler.
3. `gameOver()` yaz: `'over'` yap ve `score` `best`'i geçiyorsa onu `localStorage`'a `'typing-best'` adıyla kaydet.
4. Solda `Score 36  Level 2`, sağda `♥♥♥  Best 42` çiz.

# --tests--

Words should fall faster and come more often at higher levels, but never more than every 40 frames.
tr: Kelimeler yüksek seviyelerde daha hızlı düşmeli ve daha sık gelmeli, ama asla 40 kareden daha sık değil.

```js
assert.closeTo(speed(), 0.35, 1e-9)
assert.strictEqual(spawnEvery(), 138)
level = 5
assert.closeTo(speed(), 0.75, 1e-9)
assert.strictEqual(spawnEvery(), 90)
level = 20
assert.strictEqual(spawnEvery(), 40, 'never more often than every 40 frames')
```

Ten words should raise the level, and letters should be worth the level.
tr: On kelime seviyeyi yükseltmeli ve harfler seviye kadar değerli olmalı.

```js
spawnTimer = 100000
for (let i = 0; i < 10; i++) {
  words = [{ text: 'sun', x: 10, y: 50 }]
  for (const k of 'sun') $.press(k)
}
assert.strictEqual(level, 2, 'ten words: next level')
assert.strictEqual(score, 30)
words = [{ text: 'sun', x: 10, y: 50 }]
for (const k of 'sun') $.press(k)
assert.strictEqual(score, 36, 'letters count double at level 2')
```

The best score should be saved when the game ends.
tr: Oyun bittiğinde en iyi puan kaydedilmeli.

```js
spawnTimer = 100000
assert.strictEqual(best, 0)
score = 42
words = [1, 2, 3].map((i) => ({ text: 'cat', x: i * 50, y: GROUND }))
$.tick(1)
assert.strictEqual(best, 42)
assert.strictEqual(localStorage.getItem('typing-best'), '42')
$.tick(1)
assert.include($.texts(), '  Best 42')
assert.include($.texts(), 'Score 42  Level 1')
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
let best = Number(localStorage.getItem('typing-best')) || 0

// Faster and more often as the level goes up.
const speed = () => 0.25 + level * 0.1
const spawnEvery = () => Math.max(40, 150 - level * 12)

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
  if (score > best) {
    best = score
    localStorage.setItem('typing-best', best)
  }
}

function update() {
  if (state !== 'playing') return
  spawnTimer -= 1
  if (spawnTimer <= 0) {
    spawn()
    spawnTimer = spawnEvery()
  }
  for (const w of words) w.y += speed()
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
  ctx.fillText('♥'.repeat(lives) + '  Best ' + best, canvas.width - 10, 22)

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

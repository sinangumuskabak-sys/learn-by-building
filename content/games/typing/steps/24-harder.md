---
title: Faster and faster
title_tr: Gittikçe hızlanarak
skills: [prog.functions, game.state]
---

# --goal--

A higher level should also be harder: words fall faster and come more often. The constants `SPEED` and `SPAWN_EVERY`
become two small functions of the level.

# --goal-tr--

Seviye atlamak oyunu **zorlaştırmalı**: kelimeler daha hızlı düşsün ve daha sık gelsin. Sabit `SPEED` ve
`SPAWN_EVERY` yerine seviyeye bakan iki küçük fonksiyon yazıyoruz.

Bu sayıları ayarlamak gerçek bir oyun tasarımı işi: bunlarla dakikada 18 kelime yazan biri yaklaşık 40 saniye, 36
yazan iki dakika, 60 yazan üç dakikadan fazla dayanır.

# --code--

```js
// Faster and more often as the level goes up.
const speed = () => 0.25 + level * 0.1
const spawnEvery = () => Math.max(40, 150 - level * 12)

    spawnTimer = spawnEvery()

  for (const w of words) w.y += speed()
```

# --meaning--

- At level 1, `speed()` is 0.35 and `spawnEvery()` 138: the same as before. Each level adds 0.1 to the speed and
  takes 12 frames off the gap.
- `Math.max(40, ...)` picks the bigger number: the gap never goes under 40 frames. Without it, by level 13 the gap
  would be negative and words would pour out every frame.

# --meaning-tr--

- `const speed = () => 0.25 + level * 0.1` → kısa bir fonksiyon: seviye 1'de 0.35 (eskisiyle aynı), her seviyede 0.1
  daha hızlı.
- `const spawnEvery = () => Math.max(40, 150 - level * 12)` → seviye 1'de 138 (eskisiyle aynı), her seviyede 12 kare
  daha sık.
- `Math.max(40, ...)` → iki sayıdan **büyüğü**: aralık asla 40 karenin altına inmez. Bu sınır olmasa 13. seviyede
  aralık eksiye düşer ve kelimeler her karede yağardı.
- `update` içinde `SPAWN_EVERY` yerine `spawnEvery()`, `SPEED` yerine `speed()`. Parantezleri unutma: fonksiyonu
  **çağırıyoruz**.

# --task--

1. Delete the `SPEED` and `SPAWN_EVERY` lines.
2. Above `function spawn() {` write the comment and the two functions, with an empty line after them.
3. In `update`, use `spawnEvery()` and `speed()`.

# --task-tr--

1. `const SPEED = ...` ve `const SPAWN_EVERY = ...` satırlarını **sil**.
2. `function spawn() {` satırının **üstüne** yorumu ve iki fonksiyonu yaz; altlarında bir boş satır kalsın.
3. `update` içinde `SPAWN_EVERY` yerine `spawnEvery()`, `SPEED` yerine `speed()` yaz.
4. **Çalıştır**: 1. seviyede oyun aynı hızda; seviye atladıkça hızlanır.

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

The game should use them.
tr: Oyun bunları kullanmalı.

```js
level = 5
spawnTimer = 1
words = [{ text: 'sun', x: 10, y: 50 }]
$.tick(1)
assert.closeTo(words[0].y, 50.75, 1e-9)
assert.strictEqual(spawnTimer, 90)
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

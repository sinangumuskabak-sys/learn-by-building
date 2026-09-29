---
title: Out of lives
title_tr: Canlar bitti
skills: [game.state]
---

# --goal--

After three landed words the game is over. `state` says whether it is `'playing'` or `'over'`; `gameOver()` switches it.

# --goal-tr--

Üç kelime kaçırınca oyun **biter**. Oyunun durumunu bir değişkende tutacağız: `state`. Oyun sürerken `'playing'`,
bitince `'over'`. Bitişi ayrı bir fonksiyon yapacak: `gameOver`. Şimdilik tek satır; ileride rekoru da kaydedecek.

# --code--

```js
let state // 'playing' or 'over'

  state = 'playing'

function gameOver() {
  state = 'over'
}

  lives -= landed.length
  if (lives <= 0) {
    lives = 0
    gameOver()
  }
```

# --meaning--

- A new game is `'playing'`.
- When the lives reach 0 or less, they are set to exactly 0 (two words could land at once) and the game is over.

# --meaning-tr--

- `let state` → oyunun durumu: `'playing'` ya da `'over'`. `reset` içinde `'playing'`.
- `function gameOver()` → oyunu bitiren fonksiyon.
- `if (lives <= 0) {` → can kalmadıysa (`<=` "küçük ya da eşit": son canla birlikte iki kelime inerse sayı eksiye
  düşebilir):
  - `lives = 0` → eksi can göstermeyelim.
  - `gameOver()` → oyun bitti.

# --task--

1. Under `let spawnTimer` write `let state`; at the end of `reset`, write `state = 'playing'`.
2. Above `function update() {` write `gameOver`, with an empty line after it.
3. At the end of `update`, under `lives -= ...`, write the `if` block.

# --task-tr--

1. `let spawnTimer` satırının altına `let state ...` yaz; `reset`'in sonunda `spawnTimer = 0` satırının altına
   `state = 'playing'` yaz.
2. `function update() {` satırının **üstüne** `gameOver` fonksiyonunu yaz; altında bir boş satır kalsın.
3. `update`'in sonunda `lives -= landed.length` satırının altına `if` bloğunu yaz.
4. **Çalıştır**: oyun bitince henüz bir şey değişmez; kelimeler düşmeye devam eder. Onu bir sonraki adımda
   durduracağız.

# --tests--

Losing the last life should end the game.
tr: Son canı kaybetmek oyunu bitirmeli.

```js
spawnTimer = 100000
assert.strictEqual(state, 'playing')
words = [1, 2, 3].map((i) => ({ text: 'cat', x: i * 50, y: GROUND }))
$.tick(1)
assert.strictEqual(lives, 0)
assert.strictEqual(state, 'over')
```

Lives should never go below 0.
tr: Canlar asla 0'ın altına inmemeli.

```js
spawnTimer = 100000
words = [1, 2, 3, 4].map((i) => ({ text: 'cat', x: i * 50, y: GROUND }))
$.tick(1)
assert.strictEqual(lives, 0)
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
  spawnTimer = 0
  state = 'playing'
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

function gameOver() {
  state = 'over'
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
  if (lives <= 0) {
    lives = 0
    gameOver()
  }
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

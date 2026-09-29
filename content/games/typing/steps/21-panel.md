---
title: The game over panel
title_tr: Oyun bitti kartı
skills: [game.canvas]
---

# --goal--

When the game is over, a dark panel shows `Game over` and how to play again.

# --goal-tr--

Oyun bitince oyuncu bunu açıkça görmeli. Ekranın üst tarafına koyu, hafif saydam bir **kart** çizip üstüne
`Game over` ve yeniden oynamanın yolunu yazacağız.

# --code--

```js
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
```

# --meaning--

- Only when `state === 'over'`; it is drawn after the words, so it covers them.
- `rgba(2, 6, 23, 0.85)` is the sky's color at 85% opacity: the frozen words show through a little.
- The two lines are centred on the canvas.

# --meaning-tr--

- `if (state === 'over') {` → yalnız oyun bittiyse.
- `'rgba(2, 6, 23, 0.85)'` → rengin başka bir yazılışı: kırmızı, yeşil, mavi (0-255) ve **saydamlık** (0 tam
  saydam, 1 tam dolu). Gökyüzü rengi, %85 dolu: donmuş kelimeler arkadan belli belirsiz görünür.
- `ctx.fillRect(40, 105, canvas.width - 80, 120)` → iki yandan 40 piksel içeride, 120 piksel yüksekliğinde bir kart.
- `ctx.textAlign = 'center'` → yazılar `canvas.width / 2`'ye, yani ortaya hizalanır.
- İki yazı: büyük `Game over`, altında küçük bir açıklama.

# --task--

In `draw`, under the hearts line, leave an empty line and write the `if` block.

# --task-tr--

`draw` içinde kalp satırının altında bir boş satır bırak ve `if` bloğunu yaz; fonksiyonun son `}`'si altta kalsın.
**Çalıştır** ve üç kelime kaçır.

# --tests--

The game over panel should be drawn when the game is over.
tr: Oyun bitince oyun bitti kartı çizilmeli.

```js
spawnTimer = 100000
words = [1, 2, 3].map((i) => ({ text: 'cat', x: i * 50, y: GROUND }))
$.tick(2)
assert.includeMembers($.texts(), ['Game over', 'Press Enter to play again'])
assert.deepInclude($.rects(), { x: 40, y: 105, w: 400, h: 120, color: 'rgba(2, 6, 23, 0.85)' })
```

There should be no panel while playing.
tr: Oyun sürerken kart olmamalı.

```js
$.tick(1)
assert.notInclude($.texts(), 'Game over')
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
    score += target.text.length
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

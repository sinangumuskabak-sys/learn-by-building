---
title: Where the keys go
title_tr: Tuşlar nereye
skills: [prog.arrays, prog.functions]
---

# --goal--

On a phone there is no keyboard, so we will draw one under the ground: the three QWERTY rows, each centred under the
one above. `keyRect(row, i)` works out where key `i` of a row goes.

# --goal-tr--

Telefonda klavye yok; zeminin altına biz **çizeceğiz**. Klavyenin üç harf sırası (QWERTY): `qwertyuiop`,
`asdfghjkl`, `zxcvbnm`. Sıraları yazı olarak tutmak düzeni **veri** yapar: `ROWS[1][0]` → `'a'`.

Önce tuşların yerini hesaplayan fonksiyonu yazıyoruz: `keyRect(satır, sıra)`. Her sıra ekranda **ortalanacak**;
gerçek klavyede olduğu gibi alttaki sıralar biraz içeriden başlar.

# --code--

```js
const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']
const KEY_W = 44
const KEY_H = 34
const KEYS_Y = 350

// The on-screen keyboard, one row under another, each row centered.
function keyRect(row, i) {
  const left = (canvas.width - ROWS[row].length * (KEY_W + 3) + 3) / 2
  return { x: left + i * (KEY_W + 3), y: KEYS_Y + row * (KEY_H + 7) }
}
```

# --meaning--

- Keys are `KEY_W` by `KEY_H`, 3 pixels apart; rows are 7 pixels apart, from `KEYS_Y`.
- A row of `n` keys is `n * (KEY_W + 3) - 3` pixels wide; `left` is half of what is left over, so the row is centred.
- It returns the key's top-left corner `{ x, y }`.

# --meaning-tr--

- `ROWS` → üç sıra; her biri bir yazı. `ROWS[row].length` → o sıradaki tuş sayısı (10, 9, 7).
- `KEY_W = 44`, `KEY_H = 34` → bir tuşun eni ve boyu. `KEYS_Y = 350` → klavyenin tepesi, zeminin biraz altı.
- Tuşlar arası 3 piksel: bir tuş ve bir boşluk `KEY_W + 3` = 47 piksel.
- `const left = (canvas.width - ROWS[row].length * (KEY_W + 3) + 3) / 2` → sıranın genişliği `n × 47 − 3` (sondaki
  boşluk yok); kalan yerin yarısı soldan boşluk. 10 tuşlu sıra için (480 − 470 + 3) / 2 = **6.5**.
- `x: left + i * (KEY_W + 3)` → sıradaki `i`. tuş.
- `y: KEYS_Y + row * (KEY_H + 7)` → sıralar arası 7 piksel: 350, 391, 432.

# --task--

1. Under `FONT` write the four keyboard constants.
2. Above `function draw() {` write the comment and `keyRect`, with an empty line after it.

# --task-tr--

1. `const FONT = ...` satırının altına dört klavye sabitini yaz.
2. `function draw() {` satırının **üstüne** yorumu ve `keyRect` fonksiyonunu yaz; altında bir boş satır kalsın.
3. **Çalıştır**: ekran değişmez; tuşları bir sonraki adımda çizeceğiz.

# --tests--

The three rows should be laid out centred.
tr: Üç sıra ortalı dizilmeli.

```js
assert.deepEqual(ROWS, ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'])
assert.deepEqual(keyRect(0, 0), { x: 6.5, y: 350 })
assert.deepEqual(keyRect(0, 9), { x: 6.5 + 9 * 47, y: 350 })
assert.deepEqual(keyRect(1, 0), { x: 30, y: 391 })
assert.deepEqual(keyRect(2, 6), { x: 77 + 6 * 47, y: 432 }, 'rows are centered')
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
const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']
const KEY_W = 44
const KEY_H = 34
const KEYS_Y = 350

let words // { text, x, y }
let target // the word being typed, or null
let typed // how many letters of the target are typed
let lives
let score
let level
let cleared // words typed this game
let spawnTimer
let state // 'playing' or 'over'
let frames
let letters // correct letters typed
let mistakes
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
  frames = 0
  letters = 0
  mistakes = 0
}

function type(key) {
  if (state !== 'playing') return
  if (!target) {
    // Lock on to the lowest word starting with this letter: it is the most urgent.
    const options = words.filter((w) => w.text[0] === key).sort((a, b) => b.y - a.y)
    if (options.length === 0) {
      mistakes += 1
      return
    }
    target = options[0]
    typed = 0
  }
  if (target.text[typed] !== key) {
    mistakes += 1
    return
  }
  typed += 1
  letters += 1
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
  frames += 1
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

// Words per minute counts five letters as one word, the usual way.
const wpm = () => (frames === 0 ? 0 : Math.round(letters / 5 / (frames / 3600)))
const accuracy = () => (letters + mistakes === 0 ? 100 : Math.round((100 * letters) / (letters + mistakes)))

document.addEventListener('keydown', (event) => {
  if (state === 'over' && event.key === 'Enter') return reset()
  const key = event.key.toLowerCase()
  if (key.length === 1 && key >= 'a' && key <= 'z') {
    event.preventDefault()
    type(key)
  }
})

// The on-screen keyboard, one row under another, each row centered.
function keyRect(row, i) {
  const left = (canvas.width - ROWS[row].length * (KEY_W + 3) + 3) / 2
  return { x: left + i * (KEY_W + 3), y: KEYS_Y + row * (KEY_H + 7) }
}

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
    ctx.fillText(wpm() + ' words per minute, ' + accuracy() + '% accurate', canvas.width / 2, 175)
    ctx.fillText('Press Enter to play again', canvas.width / 2, 205)
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

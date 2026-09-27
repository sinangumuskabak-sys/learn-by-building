---
title: Words per minute
title_tr: Dakikada kelime
skills: [game.state, prog.functions]
---

# --explanation--

Typists measure themselves in **words per minute** (WPM). Words have different lengths, so the standard is to count every
**five letters** as one word. The time comes from the frames: at 60 frames a second, a minute is 3600 frames.

```js
const wpm = () => Math.round(letters / 5 / (frames / 3600))
```

Speed alone is not everything; **accuracy** matters too. Every key that did not help (a letter no word starts with, or the
wrong next letter) is a mistake, and accuracy is the share of keys that were right:

```js
Math.round((100 * letters) / (letters + mistakes))
```

Both functions have to be careful at the very start: before any key or frame they would divide by zero, and `0 / 0` in
JavaScript is `NaN`, which would show up on the screen as "NaN words per minute". So they return 0 WPM and 100% until there
is something to measure.

# --explanation-tr--

Hızlı yazanlar kendilerini **dakikada kelime** (WPM) ile ölçer. Kelimelerin uzunlukları farklıdır, bu yüzden standart, her
**beş harfi** bir kelime saymaktır. Zaman karelerden gelir: saniyede 60 karede bir dakika 3600 karedir.

```js
const wpm = () => Math.round(letters / 5 / (frames / 3600))
```

Tek başına hız her şey değildir; **doğruluk** da önemlidir. İşe yaramayan her tuş (hiçbir kelimenin başlamadığı bir harf ya da
yanlış sıradaki harf) bir hatadır ve doğruluk, doğru olan tuşların payıdır:

```js
Math.round((100 * letters) / (letters + mistakes))
```

İki fonksiyonun da en başta dikkatli olması gerekir: hiç tuş ya da kare yokken sıfıra bölerler ve JavaScript'te `0 / 0`,
ekranda "NaN words per minute" olarak görünecek olan `NaN`'dır. Bu yüzden ölçecek bir şey olana kadar 0 WPM ve %100 döndürürler.

# --task--

1. Add `frames`, `letters` and `mistakes` (all `0` in `reset()`). `update` counts `frames` while playing.
2. In `type`, a key with no matching word or a wrong next letter adds 1 to `mistakes`; a right letter adds 1 to `letters`.
3. Write `wpm()` and `accuracy()` as above, returning `0` and `100` when there is nothing to measure yet.
4. On the game over screen, draw `38 words per minute, 94% accurate` at `y = 175` and move `Press Enter to play again` to
   `y = 205`.

# --task-tr--

1. `frames`, `letters` ve `mistakes` ekle (`reset()`'te hepsi `0`). `update` oynarken `frames`'i sayar.
2. `type`'ta eşleşen kelimesi olmayan bir tuş ya da yanlış sıradaki harf `mistakes`'e 1 ekler; doğru bir harf `letters`'a 1
   ekler.
3. `wpm()` ve `accuracy()`'yi yukarıdaki gibi yaz; henüz ölçecek bir şey yokken `0` ve `100` döndürsünler.
4. Oyun bitti ekranında `y = 175`'e `38 words per minute, 94% accurate` çiz ve `Press Enter to play again`'i `y = 205`'e taşı.

# --tests--

Right letters and mistakes should be counted, and accuracy computed from them.
tr: Doğru harfler ve hatalar sayılmalı, doğruluk onlardan hesaplanmalı.

```js
spawnTimer = 100000
words = [{ text: 'sun', x: 10, y: 50 }]
$.press('q')
$.press('s')
$.press('x')
$.press('u')
$.press('n')
assert.strictEqual(letters, 3)
assert.strictEqual(mistakes, 2)
assert.strictEqual(accuracy(), 60)
```

WPM should count five letters as a word, and nothing should divide by zero at the start.
tr: WPM beş harfi bir kelime saymalı ve başta hiçbir şey sıfıra bölünmemeli.

```js
letters = 50
frames = 3600
assert.strictEqual(wpm(), 10, '50 letters in a minute is 10 words')
frames = 1800
assert.strictEqual(wpm(), 20)
frames = 0
letters = 0
mistakes = 0
assert.strictEqual(wpm(), 0)
assert.strictEqual(accuracy(), 100)
```

The game over screen should show the speed and the accuracy.
tr: Oyun bitti ekranı hızı ve doğruluğu göstermeli.

```js
spawnTimer = 100000
words = [{ text: 'sun', x: 10, y: 50 }]
for (const k of 'sxun') $.press(k)
$.tick(3600 - 1)
words = [1, 2, 3].map((i) => ({ text: 'cat', x: i * 50, y: GROUND + 1 }))
$.tick(1)
assert.strictEqual(state, 'over')
$.tick(1)
assert.include($.texts(), '1 words per minute, 75% accurate')
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

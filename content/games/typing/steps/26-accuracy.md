---
title: Accuracy
title_tr: Doğruluk
skills: [game.state, prog.functions]
---

# --goal--

Every key that did not help (a letter no word starts with, or the wrong next letter) is a mistake. Accuracy is the
share of keys that were right.

# --goal-tr--

Hızlı yazmak güzel, ama **doğru** yazmak da önemli. İşe yaramayan her tuş bir **hata**: hiçbir kelimenin başlamadığı
bir harf ya da hedefin yanlış sıradaki harfi. Doğru harfleri ve hataları sayıp bir **yüzde** hesaplayacağız:
doğruluk.

# --code--

```js
let letters // correct letters typed
let mistakes

  letters = 0
  mistakes = 0

    if (options.length === 0) {
      mistakes += 1
      return
    }

  if (target.text[typed] !== key) {
    mistakes += 1
    return
  }
  typed += 1
  letters += 1

const accuracy = () => (letters + mistakes === 0 ? 100 : Math.round((100 * letters) / (letters + mistakes)))
```

# --meaning--

- The two one-line `return`s become blocks that count a mistake first.
- A right letter adds 1 to `letters`.
- `accuracy` is `100 * letters / (letters + mistakes)`, rounded. Before any key it would divide by zero (`0 / 0` is
  `NaN` in JavaScript), so it returns 100 then.

# --meaning-tr--

- `let letters` → doğru yazılan harfler. `let mistakes` → hatalar. İkisi de `reset` içinde `0`.
- İki tek satırlık `return`, süslü parantezli bloğa dönüştü: önce `mistakes += 1`, sonra `return`.
- `letters += 1` → doğru her harf.
- `const accuracy = () => (...)` → `100 * letters / (letters + mistakes)`, `Math.round` ile tam sayıya yuvarlanmış.
  3 doğru, 2 hata → 100 × 3 / 5 = **60**.
- `letters + mistakes === 0 ? 100 : ...` → hiç tuşa basılmadıysa bölen sıfır olur; JavaScript'te `0 / 0` **`NaN`**
  ("sayı değil") verir ve ekranda "NaN%" yazardı. O zaman %100 diyoruz.

# --task--

1. Above `let best` write `let letters` and `let mistakes`; at the end of `reset`, set both to 0.
2. In `type`, turn the two one-line `return`s into blocks that add a mistake, and add `letters += 1` under `typed += 1`.
3. Above the `keydown` listener write `accuracy`, with an empty line after it.

# --task-tr--

1. `let best = ...` satırının **üstüne** `let letters ...` ve `let mistakes` yaz; `reset`'in sonunda `state = 'playing'`
   satırının altına `letters = 0` ve `mistakes = 0` yaz.
2. `type` içinde `if (options.length === 0) return` satırını, içinde `mistakes += 1` ve `return` olan bir bloğa
   çevir. Aynısını `if (target.text[typed] !== key) return` için yap. `typed += 1` satırının altına `letters += 1`
   yaz.
3. `document.addEventListener('keydown', ...` satırının **üstüne** `accuracy` satırını yaz; altında bir boş satır
   kalsın.
4. **Çalıştır**: doğruluk henüz görünmez; oyun sonunda göstereceğiz.

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

Before any key the accuracy should be 100, not NaN.
tr: Hiç tuşa basılmadan doğruluk NaN değil 100 olmalı.

```js
assert.strictEqual(accuracy(), 100)
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

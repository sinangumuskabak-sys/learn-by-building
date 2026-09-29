---
title: Enter and Delete keys
title_tr: Enter ve Sil tuşları
skills: [prog.arrays]
---

# --goal--

The last row gets Enter (`OK`) and Backspace (`DEL`), one and a half keys wide. In `KEY_ROWS` they are written as `>`
and `<`; a small lookup turns them into their key names and labels, and each key now has its own width.

# --goal-tr--

Ekran klavyesinde iki tuş eksik: **Enter** ve **silme**. Son satırın başına `OK`, sonuna `DEL` tuşu ekleyeceğiz; bir
buçuk tuş genişliğinde.

`KEY_ROWS` içinde onları tek karakterle yazıyoruz: `>` Enter, `<` Backspace. Küçük bir tablo bu karakterleri tuşun
adına ve yazısına çevirecek. Tuşlar artık farklı genişlikte olduğu için her tuşun enini de ayrıca tutacağız.

# --code--

```js
const KEY_ROWS = ['qwertyuiop', 'asdfghjkl', '>zxcvbnm<'] // > is Enter, < is Backspace

    const widths = [...row].map((k) => (k === '>' || k === '<' ? KEY_W * 1.5 : KEY_W))
    const total = widths.reduce((a, b) => a + b, 0) + (row.length - 1) * 4
    let x = (canvas.width - total) / 2
    ;[...row].forEach((k, i) => {
      const [key, label] = { '>': ['Enter', 'OK'], '<': ['Backspace', 'DEL'] }[k] || [k, k]
      rects.push({ key, label, x, y: KEYS_TOP + r * (KEY_H + 6), w: widths[i], h: KEY_H })
      x += widths[i] + 4
    })
```

# --meaning--

- `widths` has one width per key: 48 for `>` and `<`, 32 for letters.
- `reduce((a, b) => a + b, 0)` adds them all up.
- The lookup object gives `['Enter', 'OK']` or `['Backspace', 'DEL']`; for a letter it gives `undefined`, and `|| [k, k]`
  uses the letter for both.
- `const [key, label] = ...` names the two items of the pair.

# --meaning-tr--

- `[...row].map((k) => (k === '>' || k === '<' ? KEY_W * 1.5 : KEY_W))` → her tuşun eni: özel tuşlar 48, harfler 32.
- `widths.reduce((a, b) => a + b, 0)` → `reduce` listeyi **tek bir değere indirger**: 0'dan başlayıp her eni üstüne
  ekler: toplam en.
- `forEach((k, i) => ...)` → artık tuşun sırası `i` de lazım: `widths[i]` o tuşun eni.
- `{ '>': ['Enter', 'OK'], '<': ['Backspace', 'DEL'] }[k]` → küçük bir **tablo**: `>` için `['Enter', 'OK']`. Harfler
  tabloda yok; `undefined` gelir ve `|| [k, k]` harfin kendisini iki kez kullanır.
- `const [key, label] = ...` → çiftin ilkine `key`, ikincisine `label` adını verir.
- `{ key, label, ... }` → `{ key: key, label: label, ... }`'ın kısası. `w: widths[i]` ve `x += widths[i] + 4`.
- `type` Enter ve Backspace'i zaten biliyor; dokunma dinleyicisi `hit.key`'i ona veriyor. Başka bir şey değişmiyor.

# --task--

1. Change the third string of `KEY_ROWS` to `'>zxcvbnm<'` and add the comment.
2. In `keyRects`, replace the lines inside `KEY_ROWS.forEach` with the new ones. Press **Run**.

# --task-tr--

1. `KEY_ROWS`'un üçüncü yazısını `'>zxcvbnm<'` yap ve satırın sonuna yorumu ekle.
2. `keyRects` içinde, `KEY_ROWS.forEach((row, r) => {` satırının altındaki satırları kod bloğundakilerle değiştir.
3. **Çalıştır**: son satırda `OK` ve `DEL` tuşlarını görmelisin. Tamamen ekran klavyesiyle oynayabilirsin.

# --tests--

Enter and Backspace should be wide keys on the last row.
tr: Enter ve Backspace son satırda geniş tuşlar olmalı.

```js
const keys = keyRects()
assert.lengthOf(keys, 28)
assert.deepEqual(keys[0], { key: 'q', label: 'q', x: 2, y: 408, w: 32, h: 44 })
const enter = keys.find((k) => k.key === 'Enter')
assert.deepEqual([enter.label, enter.x, enter.y, enter.w], ['OK', 4, 508, 48])
assert.deepEqual(keys.find((k) => k.key === 'Backspace').x, 308)
```

Tapping OK and DEL should submit and delete.
tr: OK ve DEL'e dokunmak göndermeli ve silmeli.

```js
answer = 'crane'
for (const letter of 'caper') {
  const k = keyRects().find((r) => r.key === letter)
  $.click(k.x + 10, k.y + 10)
}
$.click(330, 530) // DEL
assert.strictEqual(current, 'cape')
$.click(18, 430) // q
$.click(28, 530) // OK
assert.strictEqual(guesses[0].word, 'capeq')
```

# --solution--

```js
// Word guessing game, step by step.
// The page already has <canvas id="game" width="360" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const WORDS = ['apple', 'beach', 'brain', 'bread', 'brick', 'chair', 'chess', 'clock', 'cloud', 'crane', 'dance', 'dream',
  'drink', 'eagle', 'earth', 'flame', 'fruit', 'ghost', 'glass', 'grape', 'green', 'heart', 'horse', 'house', 'juice',
  'knife', 'laugh', 'lemon', 'light', 'magic', 'money', 'mouse', 'music', 'night', 'ocean', 'paint', 'party', 'piano',
  'pilot', 'plane', 'plant', 'pride', 'queen', 'radio', 'river', 'robot', 'sheep', 'shirt', 'smile', 'snake', 'space',
  'spoon', 'storm', 'sugar', 'table', 'tiger', 'toast', 'train', 'water', 'whale', 'world', 'zebra']
const TRIES = 6
const SIZE = 56 // one letter tile
const GAP = 6
const LEFT = (canvas.width - 5 * SIZE - 4 * GAP) / 2
const TOP = 12
const COLORS = { green: '#16a34a', yellow: '#ca8a04', gray: '#3f3f46' }
const KEY_ROWS = ['qwertyuiop', 'asdfghjkl', '>zxcvbnm<'] // > is Enter, < is Backspace
const KEY_W = 32
const KEY_H = 44
const KEYS_TOP = 408

let answer
let guesses // the finished guesses, each { word, marks }
let current // the letters typed so far
let state // 'playing', 'won' or 'lost'

function reset() {
  answer = WORDS[Math.floor(Math.random() * WORDS.length)]
  guesses = []
  current = ''
  state = 'playing'
}

// Mark each letter: green in the right place, yellow somewhere else in the word, gray not (or not that many times).
function score(guess, word) {
  const marks = Array(5).fill('gray')
  const left = {} // letters of the word not matched by a green
  for (let i = 0; i < 5; i++) {
    if (guess[i] === word[i]) marks[i] = 'green'
    else left[word[i]] = (left[word[i]] || 0) + 1
  }
  for (let i = 0; i < 5; i++) {
    if (marks[i] !== 'green' && left[guess[i]] > 0) {
      marks[i] = 'yellow'
      left[guess[i]] -= 1
    }
  }
  return marks
}

function type(key) {
  if (state !== 'playing') {
    if (key === 'Enter') reset()
    return
  }
  if (key === 'Backspace') current = current.slice(0, -1)
  else if (/^[a-z]$/.test(key) && current.length < 5) current += key
  else if (key === 'Enter' && current.length === 5) {
    guesses.push({ word: current, marks: score(current, answer) })
    if (current === answer) state = 'won'
    else if (guesses.length === TRIES) state = 'lost'
    current = ''
  }
}

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
  if (key === 'Enter' || key === 'Backspace' || /^[a-z]$/.test(key)) {
    event.preventDefault()
    type(key)
  }
})

// The on-screen keyboard: each row is centered.
function keyRects() {
  const rects = []
  KEY_ROWS.forEach((row, r) => {
    const widths = [...row].map((k) => (k === '>' || k === '<' ? KEY_W * 1.5 : KEY_W))
    const total = widths.reduce((a, b) => a + b, 0) + (row.length - 1) * 4
    let x = (canvas.width - total) / 2
    ;[...row].forEach((k, i) => {
      const [key, label] = { '>': ['Enter', 'OK'], '<': ['Backspace', 'DEL'] }[k] || [k, k]
      rects.push({ key, label, x, y: KEYS_TOP + r * (KEY_H + 6), w: widths[i], h: KEY_H })
      x += widths[i] + 4
    })
  })
  return rects
}

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  const hit = keyRects().find((k) => x >= k.x && x < k.x + k.w && y >= k.y && y < k.y + k.h)
  if (hit) type(hit.key)
  else if (state !== 'playing') reset()
})

function draw() {
  ctx.fillStyle = '#18181b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let row = 0; row < TRIES; row++) {
    const guess = guesses[row]
    const letters = guess ? guess.word : row === guesses.length ? current : ''
    for (let i = 0; i < 5; i++) {
      const x = LEFT + i * (SIZE + GAP)
      const y = TOP + row * (SIZE + GAP)
      if (guess) {
        ctx.fillStyle = COLORS[guess.marks[i]]
        ctx.fillRect(x, y, SIZE, SIZE)
      } else {
        ctx.strokeStyle = letters[i] ? '#a1a1aa' : '#3f3f46'
        ctx.lineWidth = 2
        ctx.strokeRect(x + 1, y + 1, SIZE - 2, SIZE - 2)
      }
      if (letters[i]) {
        ctx.fillStyle = 'white'
        ctx.font = 'bold 28px sans-serif'
        ctx.fillText(letters[i].toUpperCase(), x + SIZE / 2, y + SIZE / 2 + 1)
      }
    }
  }

  ctx.font = 'bold 14px sans-serif'
  for (const k of keyRects()) {
    ctx.fillStyle = '#71717a'
    ctx.fillRect(k.x, k.y, k.w, k.h)
    ctx.fillStyle = 'white'
    ctx.fillText(k.label.toUpperCase(), k.x + k.w / 2, k.y + k.h / 2)
  }

  ctx.font = 'bold 16px sans-serif'
  ctx.fillStyle = 'white'
  let message = 'Guess the five-letter word'
  if (state === 'won') message = 'You got it! Enter for a new word'
  if (state === 'lost') message = 'It was ' + answer.toUpperCase() + '. Enter for a new word'
  ctx.fillText(message, canvas.width / 2, 393)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```

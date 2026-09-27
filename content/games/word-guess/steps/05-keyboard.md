---
title: A keyboard on the screen
title_tr: Ekranda bir klavye
skills: [game.input, prog.arrays]
---

# --explanation--

On a phone there is no keyboard, so the game draws its own. It also does something a real keyboard cannot: each key is
colored with what you already know about that letter, so you can see at a glance which letters are left to try.

The keys come from three strings, one per row, just like a real keyboard. Two special characters stand for Enter and
Backspace, which are drawn wider. Each row is centered by adding up its widths first:

```js
let x = (canvas.width - total) / 2
```

`keyRects()` turns the rows into a list of rectangles with a `key` and a `label`. The same list is used twice: to **draw**
the keys and to find which key a tap landed on. Drawing and hit-testing from one source means they can never disagree.

For the colors, look at all the guesses and remember the best thing known about each letter. "Best" has an order, so give
each mark a rank: green (3) beats yellow (2) beats gray (1). A letter that was yellow once and green later is green.

Tapping anywhere else when the game is over starts a new word.

# --explanation-tr--

Telefonda klavye yok; bu yüzden oyun kendi klavyesini çizer. Gerçek bir klavyenin yapamadığı bir şeyi de yapar: her tuş o harf
hakkında zaten bildiklerinle boyanır; böylece denenecek hangi harflerin kaldığını bir bakışta görürsün.

Tuşlar, tıpkı gerçek bir klavye gibi, her satır için bir tane olmak üzere üç metinden gelir. İki özel karakter daha geniş
çizilen Enter ve Backspace'i temsil eder. Her satır önce genişlikleri toplanarak ortalanır:

```js
let x = (canvas.width - total) / 2
```

`keyRects()` satırları `key` ve `label`'ı olan dikdörtgenlerden oluşan bir listeye çevirir. Aynı liste iki kez kullanılır:
tuşları **çizmek** ve bir dokunuşun hangi tuşa düştüğünü bulmak için. Çizimi ve isabet sınamasını tek bir kaynaktan yapmak
ikisinin asla çelişmemesi demektir.

Renkler için bütün tahminlere bak ve her harf hakkında bilinen en iyi şeyi hatırla. "En iyi"nin bir sırası var; bu yüzden her
işarete bir derece ver: yeşil (3) sarıyı (2), sarı griyi (1) yener. Bir kez sarı, sonra yeşil olan bir harf yeşildir.

Oyun bittiğinde başka herhangi bir yere dokunmak yeni bir kelime başlatır.

# --task--

1. Add `KEY_ROWS = ['qwertyuiop', 'asdfghjkl', '>zxcvbnm<']` (`>` is Enter, `<` Backspace), `KEY_W = 32`, `KEY_H = 44` and
   `KEYS_TOP = 408`.
2. Write `keyRects()`: letter keys are `KEY_W` wide, Enter and Backspace one and a half times that, with 4 pixels between
   keys; each row is centered and rows are `KEY_H + 6` apart. Each rectangle has `key` (`'Enter'`, `'Backspace'` or the
   letter), `label` (`'OK'`, `'DEL'` or the letter), `x`, `y`, `w` and `h`.
3. On `pointerdown`, convert to canvas pixels and `type()` the key that was hit; if none was hit and the game is over,
   `reset()`.
4. Write `letterColors()` returning an object from letter to its best mark. Draw each key in its letter's color, or
   `'#71717a'` if nothing is known, with its label in white upper case (`'bold 14px sans-serif'`).

# --task-tr--

1. `KEY_ROWS = ['qwertyuiop', 'asdfghjkl', '>zxcvbnm<']` (`>` Enter, `<` Backspace), `KEY_W = 32`, `KEY_H = 44` ve
   `KEYS_TOP = 408` ekle.
2. `keyRects()` yaz: harf tuşları `KEY_W` genişliğinde, Enter ve Backspace bunun bir buçuk katı, tuşlar arasında 4 piksel;
   her satır ortalı ve satırlar `KEY_H + 6` aralıklı. Her dikdörtgenin `key`'i (`'Enter'`, `'Backspace'` ya da harf),
   `label`'ı (`'OK'`, `'DEL'` ya da harf), `x`, `y`, `w` ve `h`'si var.
3. `pointerdown`'da canvas piksellerine çevir ve isabet eden tuşu `type()` et; hiçbirine isabet etmediyse ve oyun bittiyse
   `reset()`.
4. Harften en iyi işaretine giden bir nesne döndüren `letterColors()` yaz. Her tuşu harfinin renginde, hiçbir şey
   bilinmiyorsa `'#71717a'` ile, etiketi beyaz büyük harfle (`'bold 14px sans-serif'`) çiz.

# --tests--

The keys should be laid out in three centered rows.
tr: Tuşlar üç ortalı satır hâlinde dizilmeli.

```js
const keys = keyRects()
assert.lengthOf(keys, 28)
assert.deepEqual(keys[0], { key: 'q', label: 'q', x: 2, y: 408, w: 32, h: 44 })
const enter = keys.find((k) => k.key === 'Enter')
assert.deepEqual([enter.label, enter.x, enter.y, enter.w], ['OK', 4, 508, 48])
assert.deepEqual(keys.find((k) => k.key === 'Backspace').x, 308)
```

Tapping the keys should type, delete and submit.
tr: Tuşlara dokunmak yazmalı, silmeli ve göndermeli.

```js
answer = 'crane'
for (const letter of 'caperx') {
  const k = keyRects().find((r) => r.key === letter)
  $.click(k.x + 10, k.y + 10)
}
assert.strictEqual(current, 'caper', 'the sixth letter does not fit')
$.click(330, 530) // DEL
assert.strictEqual(current, 'cape')
$.click(18, 430) // q
$.click(28, 530) // OK
assert.strictEqual(guesses[0].word, 'capeq')
```

Keys should show the best thing known about each letter.
tr: Tuşlar her harf hakkında bilinen en iyi şeyi göstermeli.

```js
answer = 'crane'
for (const word of ['reach', 'crane']) {
  for (const k of word) $.press(k)
  $.press('Enter')
}
const known = letterColors()
assert.strictEqual(known.r, 'green', 'yellow first, green later')
assert.strictEqual(known.h, 'gray')
assert.isUndefined(known.z)
$.tick(1)
const key = (letter) => keyRects().find((k) => k.key === letter)
const colorOf = (letter) => $.rects().find((r) => r.x === key(letter).x && r.y === key(letter).y).color
assert.strictEqual(colorOf('r'), '#16a34a')
assert.strictEqual(colorOf('h'), '#3f3f46')
assert.strictEqual(colorOf('z'), '#71717a')
$.click(180, 200)
assert.strictEqual(state, 'playing', 'a tap on the board after winning starts a new word')
assert.lengthOf(guesses, 0)
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

// The best thing known about each letter so far: green beats yellow beats gray.
function letterColors() {
  const rank = { gray: 1, yellow: 2, green: 3 }
  const known = {}
  for (const g of guesses) {
    ;[...g.word].forEach((letter, i) => {
      const mark = g.marks[i]
      if (!known[letter] || rank[mark] > rank[known[letter]]) known[letter] = mark
    })
  }
  return known
}

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

  const known = letterColors()
  ctx.font = 'bold 14px sans-serif'
  for (const k of keyRects()) {
    ctx.fillStyle = known[k.key] ? COLORS[known[k.key]] : '#71717a'
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

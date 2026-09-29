---
title: Where the keys go
title_tr: Tuşlar nereye
skills: [prog.arrays]
---

# --goal--

A phone has no keyboard for a canvas, so the game draws its own. `keyRects()` turns three strings (one per row, like a
real keyboard) into a list of rectangles, each row centered. The same list will be used to draw the keys and to find
the key under a tap.

# --goal-tr--

Telefonda canvas için klavye açılmaz; oyun **kendi klavyesini** çizecek. Tuşlar gerçek klavyedeki gibi üç satır:
her satır bir yazı (`'qwertyuiop'`...).

`keyRects()` bu satırları bir **dikdörtgen listesine** çevirecek: her tuşun adı, yazısı, yeri ve boyu. Aynı listeyi hem
tuşları **çizmek** hem de dokunulan tuşu **bulmak** için kullanacağız; böylece gördüğün tuş ile bastığın tuş asla
birbirini tutmazlık etmez. Bu adımda sadece hesap.

# --code--

```js
const KEY_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']
const KEY_W = 32
const KEY_H = 44
const KEYS_TOP = 408

// The on-screen keyboard: each row is centered.
function keyRects() {
  const rects = []
  KEY_ROWS.forEach((row, r) => {
    const total = row.length * KEY_W + (row.length - 1) * 4
    let x = (canvas.width - total) / 2
    ;[...row].forEach((k) => {
      rects.push({ key: k, label: k, x, y: KEYS_TOP + r * (KEY_H + 6), w: KEY_W, h: KEY_H })
      x += KEY_W + 4
    })
  })
  return rects
}
```

# --meaning--

- A key is 32×44 pixels, 4 pixels apart; rows are 50 pixels apart, starting at y = 408.
- For each row, `total` is its width; `x` starts at the left edge that centers it and moves right after every key.
- Each key becomes `{ key, label, x, y, w, h }`.

# --meaning-tr--

- `KEY_W = 32`, `KEY_H = 44` → tuşun eni ve boyu. `KEYS_TOP = 408` → klavyenin başladığı yükseklik.
- `KEY_ROWS.forEach((row, r) => { ... })` → `forEach` her satır için fonksiyonu çalıştırır: `row` satırın yazısı,
  `r` sıra numarası (0, 1, 2).
- `const total = row.length * KEY_W + (row.length - 1) * 4` → satırın eni: tuşlar + aralarındaki 4'er piksel.
- `let x = (canvas.width - total) / 2` → satırı ortalayan sol kenar. `let`, çünkü her tuştan sonra sağa kayacak.
- `;[...row].forEach((k) => ...)` → `[...row]` yazıyı harflerine dağıtır; her harf `k`. Baştaki `;` satır `[` ile
  başladığı için bir güvenlik işareti.
- `rects.push({ key: k, label: k, x, y: ..., w: KEY_W, h: KEY_H })` → tuşun bilgileri: `key` (basınca ne olur),
  `label` (üstünde ne yazar), yeri ve boyu. `x` tek başına `x: x` demek.
- `x += KEY_W + 4` → bir sonraki tuş 36 piksel sağda.
- `return rects` → listeyi geri ver.

# --task--

1. Under `COLORS`, write the four keyboard constants.
2. Above `function draw() {`, write the comment and `keyRects`, and leave an empty line. Press **Run**.

# --task-tr--

1. `COLORS` satırının altına dört klavye sabitini yaz.
2. `function draw() {` satırının **üstüne** yorum satırını ve `keyRects` fonksiyonunu yaz; arada bir boş satır kalsın.
3. **Çalıştır**. Tuşları bir sonraki adımda çizeceğiz; kontroller hesabı okuyor.

# --tests--

The keys should be laid out in three centered rows.
tr: Tuşlar üç ortalı satırda dizilmeli.

```js
const keys = keyRects()
assert.lengthOf(keys, 26)
assert.deepEqual(keys[0], { key: 'q', label: 'q', x: 2, y: 408, w: 32, h: 44 })
assert.deepEqual(keys[10], { key: 'a', label: 'a', x: 20, y: 458, w: 32, h: 44 })
const z = keys.find((k) => k.key === 'z')
assert.deepEqual([z.x, z.y], [56, 508])
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
const KEY_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']
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
    const total = row.length * KEY_W + (row.length - 1) * 4
    let x = (canvas.width - total) / 2
    ;[...row].forEach((k) => {
      rects.push({ key: k, label: k, x, y: KEYS_TOP + r * (KEY_H + 6), w: KEY_W, h: KEY_H })
      x += KEY_W + 4
    })
  })
  return rects
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

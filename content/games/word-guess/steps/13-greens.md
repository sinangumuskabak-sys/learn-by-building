---
title: Right letter, right place
title_tr: Doğru harf, doğru yer
skills: [prog.arrays]
---

# --goal--

`score(guess, word)` gives one mark per letter. First the easy part: a letter in the right place is `'green'`, and every
other letter stays `'gray'` for now.

# --goal-tr--

Bir tahmini **puanlayan** fonksiyonu yazıyoruz: `score(guess, word)` her harf için bir işaret verecek: `'green'`,
`'yellow'` ya da `'gray'`.

Önce kolay kısım: harf **doğru yerdeyse** yeşil. Diğerlerini şimdilik gri bırakıyoruz; sarının kuralı biraz çetrefilli,
bir sonraki adımda.

# --code--

```js
function score(guess, word) {
  const marks = Array(5).fill('gray')
  for (let i = 0; i < 5; i++) {
    if (guess[i] === word[i]) marks[i] = 'green'
  }
  return marks
}
```

# --meaning--

- `Array(5).fill('gray')` makes `['gray', 'gray', 'gray', 'gray', 'gray']`.
- The loop compares the letters at the same position; equal ones become `'green'`.
- `return marks` gives the list back.

# --meaning-tr--

- `Array(5).fill('gray')` → 5 elemanlı bir liste yapıp hepsini `'gray'` ile **doldurur**.
- `for (let i = 0; i < 5; i++)` → beş harfi sırayla gez.
- `guess[i] === word[i]` → tahminin `i`. harfi, kelimenin `i`. harfiyle **aynı mı**? Aynıysa `marks[i] = 'green'`.
- `return marks` → işaret listesini geri verir: `score('caper', 'crane')` → `['green', 'gray', 'gray', 'gray', 'gray']`.

# --task--

Under the `reset` function, leave an empty line and write `score`. Press **Run**.

# --task-tr--

`reset` fonksiyonunun altına bir boş satır bırakıp `score` fonksiyonunu yaz. **Çalıştır**. Kontroller fonksiyonu
birkaç kelimeyle deniyor.

# --tests--

Letters in the right place should be green, the rest gray for now.
tr: Doğru yerdeki harfler yeşil, kalanlar şimdilik gri olmalı.

```js
assert.deepEqual(score('crane', 'crane'), ['green', 'green', 'green', 'green', 'green'])
assert.deepEqual(score('caper', 'crane'), ['green', 'gray', 'gray', 'gray', 'gray'])
assert.deepEqual(score('stool', 'crane'), ['gray', 'gray', 'gray', 'gray', 'gray'])
assert.deepEqual(score('train', 'brain'), ['gray', 'green', 'green', 'green', 'green'])
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

let answer
let current // the letters typed so far

function reset() {
  answer = WORDS[Math.floor(Math.random() * WORDS.length)]
  current = ''
}

function score(guess, word) {
  const marks = Array(5).fill('gray')
  for (let i = 0; i < 5; i++) {
    if (guess[i] === word[i]) marks[i] = 'green'
  }
  return marks
}

function type(key) {
  if (key === 'Backspace') current = current.slice(0, -1)
  else if (/^[a-z]$/.test(key) && current.length < 5) current += key
}

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
  if (key === 'Backspace' || /^[a-z]$/.test(key)) {
    event.preventDefault()
    type(key)
  }
})

function draw() {
  ctx.fillStyle = '#18181b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let row = 0; row < TRIES; row++) {
    const letters = row === 0 ? current : ''
    for (let i = 0; i < 5; i++) {
      const x = LEFT + i * (SIZE + GAP)
      const y = TOP + row * (SIZE + GAP)
      ctx.strokeStyle = letters[i] ? '#a1a1aa' : '#3f3f46'
      ctx.lineWidth = 2
      ctx.strokeRect(x + 1, y + 1, SIZE - 2, SIZE - 2)
      if (letters[i]) {
        ctx.fillStyle = 'white'
        ctx.font = 'bold 28px sans-serif'
        ctx.fillText(letters[i].toUpperCase(), x + SIZE / 2, y + SIZE / 2 + 1)
      }
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```

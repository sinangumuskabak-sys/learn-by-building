---
title: Center the last row
title_tr: Son satırı ortala
skills: [game.canvas]
---

# --goal--

The last row has only 8 keys. Each row now works out its own left edge from how many keys it has, so every row is
centered.

# --goal-tr--

Son satırda sadece **8** tuş var ve sola yaslı duruyor. Her satırı **ortalayalım**: satırın sol kenarını, o satırda
kaç tuş olduğuna göre hesaplayacağız.

Hesap basit: tuşların toplam genişliğini tuvalin eninden çıkar, kalan boşluğu **ikiye böl**; yarısı sola, yarısı
sağa.

# --code--

```js
// The on-screen keyboard: rows of 9 keys, centered.
function keyRect(i) {
  const row = Math.floor(i / 9)
  const inRow = row === 2 ? 8 : 9
  const left = (canvas.width - inRow * (KEY_W + 4) + 4) / 2
  return { x: left + (i % 9) * (KEY_W + 4), y: KEYS_Y + row * (KEY_H + 6) }
}
```

# --meaning--

- `inRow` is how many keys this row has: 8 in the third row, 9 otherwise.
- The keys and the gaps between them take `inRow * 52 - 4` pixels. What is left of the 480, halved, is the left edge.
- For 9 keys that is 8, as before; for 8 keys it is 34.

# --meaning-tr--

- `const inRow = row === 2 ? 8 : 9` → bu satırdaki tuş sayısı: üçüncü satırsa (`row` 2) **8**, değilse **9**.
- Tuşlar ve aralarındaki boşluklar `inRow * (KEY_W + 4) - 4` piksel tutar (son tuştan sonra boşluk yok, o yüzden
  `- 4`).
- `canvas.width - ...` → tuvalde artan yer. `/ 2` → ikiye böl: sol kenar.
- Formülde `- (... - 4)` yerine `+ 4` yazılı; ikisi aynı şey.
- 9 tuş için: (480 − 468 + 4) / 2 = **8** (eskisi gibi). 8 tuş için: (480 − 416 + 4) / 2 = **34**.
- `return` satırında `8 +` yerine artık `left +`.
- Üstteki yorum fonksiyonun ne yaptığını söylüyor.

# --task--

In `keyRect`, write the comment above it, add the `inRow` and `left` lines under `row`, and change `8 +` to `left +`.

# --task-tr--

1. `function keyRect(i) {` satırının üstüne yorum satırını yaz.
2. `const row = ...` satırının altına `inRow` ve `left` satırlarını yaz.
3. `return` satırındaki `8 +` kısmını `left +` yap.
4. **Çalıştır**: son satır ortalanmalı.

# --hint--

Check the parentheses: `(canvas.width - inRow * (KEY_W + 4) + 4) / 2`, the division comes last.

# --hint-tr--

Parantezleri kontrol et: `(canvas.width - inRow * (KEY_W + 4) + 4) / 2`; bölme en son yapılır.

# --tests--

The last row of 8 should be centered.
tr: 8 tuşluk son satır ortalanmalı.

```js
assert.deepEqual(keyRect(18), { x: 34, y: 440 })
assert.deepEqual(keyRect(25), { x: 34 + 7 * 52, y: 440 })
```

The rows of 9 should stay where they were.
tr: 9 tuşluk satırlar yerinde kalmalı.

```js
assert.deepEqual(keyRect(0), { x: 8, y: 360 })
assert.deepEqual(keyRect(17), { x: 8 + 8 * 52, y: 400 })
```

# --solution--

```js
// Hangman, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const WORDS = [
  'APPLE', 'BANANA', 'CASTLE', 'DRAGON', 'ELEPHANT', 'FOREST', 'GARDEN', 'HAMMER', 'ISLAND', 'JACKET',
  'KITCHEN', 'LEMON', 'MONKEY', 'NOTEBOOK', 'ORANGE', 'PENGUIN', 'QUEEN', 'ROCKET', 'SPIDER', 'TIGER',
  'UMBRELLA', 'VIOLIN', 'WINDOW', 'YELLOW', 'ZEBRA', 'BRIDGE', 'CANDLE', 'DOLPHIN', 'ENGINE', 'FLOWER',
  'GUITAR', 'HONEY', 'IGLOO', 'JUNGLE', 'KANGAROO', 'LADDER', 'MARKET', 'NEEDLE', 'OCEAN', 'PIRATE',
  'RABBIT', 'SILVER', 'TURTLE', 'VALLEY', 'WIZARD', 'PLANET', 'COOKIE', 'PUZZLE', 'KEYBOARD', 'CAMERA',
]
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const MAX_WRONG = 6
const KEY_W = 48
const KEY_H = 34
const KEYS_Y = 360

let word
let guessed // a Set of the letters tried so far
let wrong
let state // 'playing', 'won' or 'lost'
let streak = 0
let best = Number(localStorage.getItem('hangman-best')) || 0

// The word with the letters not guessed yet hidden: 'C _ S T _ E'.
const masked = () => [...word].map((letter) => (guessed.has(letter) ? letter : '_')).join(' ')

function newWord() {
  let next
  do next = WORDS[Math.floor(Math.random() * WORDS.length)]
  while (next === word) // never the same word twice in a row
  word = next
  guessed = new Set()
  wrong = 0
  state = 'playing'
}

function guess(letter) {
  if (state !== 'playing' || guessed.has(letter)) return
  guessed.add(letter)
  if (!word.includes(letter)) wrong += 1
  if ([...word].every((l) => guessed.has(l))) {
    state = 'won'
    streak += 1
    if (streak > best) {
      best = streak
      localStorage.setItem('hangman-best', best)
    }
  } else if (wrong === MAX_WRONG) {
    state = 'lost'
    streak = 0
  }
}

document.addEventListener('keydown', (event) => {
  if (state !== 'playing' && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault()
    newWord()
    return
  }
  const letter = event.key.toUpperCase()
  if (letter.length === 1 && LETTERS.includes(letter)) guess(letter)
})

// The on-screen keyboard: rows of 9 keys, centered.
function keyRect(i) {
  const row = Math.floor(i / 9)
  const inRow = row === 2 ? 8 : 9
  const left = (canvas.width - inRow * (KEY_W + 4) + 4) / 2
  return { x: left + (i % 9) * (KEY_W + 4), y: KEYS_Y + row * (KEY_H + 6) }
}

canvas.addEventListener('pointerdown', () => {
  if (state !== 'playing') newWord()
})

function line(x1, y1, x2, y2) {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

// One drawing per wrong guess.
const PARTS = [
  () => {
    ctx.beginPath()
    ctx.arc(170, 110, 20, 0, Math.PI * 2) // head
    ctx.stroke()
  },
  () => line(170, 130, 170, 200), // body
  () => line(170, 150, 140, 180), // left arm
  () => line(170, 150, 200, 180), // right arm
  () => line(170, 200, 145, 245), // left leg
  () => line(170, 200, 195, 245), // right leg
]

function draw() {
  ctx.fillStyle = '#fefce8'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // The gallows
  ctx.strokeStyle = '#78350f'
  ctx.lineWidth = 6
  line(40, 270, 220, 270)
  line(80, 270, 80, 50)
  line(80, 50, 170, 50)
  line(170, 50, 170, 90)
  ctx.strokeStyle = '#1f2937'
  ctx.lineWidth = 4
  for (let i = 0; i < wrong; i++) PARTS[i]()

  ctx.fillStyle = '#1f2937'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Streak ' + streak + '  Best ' + best, 260, 70)
  ctx.fillText('Misses ' + wrong + ' / ' + MAX_WRONG, 260, 100)
  ctx.fillStyle = '#b91c1c'
  ctx.fillText([...guessed].filter((l) => !word.includes(l)).join(' '), 260, 130)

  ctx.textAlign = 'center'
  ctx.font = 'bold 32px monospace'
  if (state === 'lost') {
    ctx.fillStyle = '#b91c1c'
    ctx.fillText([...word].join(' '), canvas.width / 2, 340)
  } else {
    ctx.fillStyle = '#1f2937'
    ctx.fillText(masked(), canvas.width / 2, 340)
  }
  if (state !== 'playing') {
    ctx.font = 'bold 20px sans-serif'
    ctx.fillStyle = state === 'won' ? '#15803d' : '#b91c1c'
    ctx.fillText(state === 'won' ? 'You got it! Click for the next word' : 'Hanged! Click to try another', canvas.width / 2, 298)
  }

  for (let i = 0; i < LETTERS.length; i++) {
    const letter = LETTERS[i]
    const k = keyRect(i)
    ctx.fillStyle = '#e7e5e4'
    ctx.fillRect(k.x, k.y, KEY_W, KEY_H)
    ctx.fillStyle = '#1f2937'
    ctx.font = 'bold 18px sans-serif'
    ctx.fillText(letter, k.x + KEY_W / 2, k.y + 24)
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newWord()
requestAnimationFrame(loop)
```

---
title: Draw the keys
title_tr: Tuşları çiz
skills: [game.canvas, prog.loops]
---

# --goal--

A loop over the 26 letters draws each key: a light box from `keyRect(i)` with its letter centered on it.

# --goal-tr--

Şimdi tuşları çiziyoruz. 26 harfin her biri için: `keyRect` ile yerini bul, açık gri bir kutu çiz, harfini ortasına
yaz. 26 kez aynı iş, yani bir **döngü**.

# --code--

```js
function draw() {
  // ...

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
```

# --meaning--

- The loop runs for `i` = 0 to 25; `LETTERS[i]` is the i-th letter.
- `k` is the key's corner. The box is `KEY_W × KEY_H` there.
- The letter is centered (`textAlign` is still `'center'`) at the middle of the key, 24 pixels down.

# --meaning-tr--

- `for (let i = 0; i < LETTERS.length; i++)` → `i` 0'dan 25'e kadar. `LETTERS.length` 26.
- `const letter = LETTERS[i]` → yazılarda da köşeli parantez çalışır: `LETTERS[0]` `'A'`.
- `const k = keyRect(i)` → tuşun sol üst köşesi: `k.x`, `k.y`.
- `ctx.fillRect(k.x, k.y, KEY_W, KEY_H)` → açık gri kutu.
- `ctx.fillText(letter, k.x + KEY_W / 2, k.y + 24)` → harf, tuşun **yatay ortasına** (`k.x + 24`) ve üstten 24 piksel
  aşağı. `textAlign` yukarıda `'center'` yapıldığı için harf tam ortalanır.

# --task--

In `draw`, at the very end (under the end-message block, above the closing `}`), leave an empty line and write the
loop. Press **Run**.

# --task-tr--

`draw` fonksiyonunun **en sonuna**, bitiş mesajı bloğunun `}`'sinin altına ve `draw`'u kapatan `}`'nin üstüne, bir
boş satır bırakıp döngüyü yaz. **Çalıştır**: kelimenin altında A'dan Z'ye üç satırlık bir klavye görmelisin.

# --try--

Look at the last row: 8 keys pushed to the left. It looks a bit off, doesn't it? We fix it next.

# --try-tr--

Son satıra bak: 8 tuş sola yaslanmış, sağda boşluk kalmış. Biraz yamuk duruyor, değil mi? Bir sonraki adımda düzelteceğiz.

# --tests--

All 26 letters should be drawn on keys.
tr: 26 harfin hepsi tuşların üstüne yazılmalı.

```js
$.tick(1)
for (const letter of LETTERS) assert.include($.texts(), letter)
assert.lengthOf($.rects('#e7e5e4'), 26)
```

Each key should be a 48×34 box at `keyRect(i)`.
tr: Her tuş `keyRect(i)`'de 48×34'lük bir kutu olmalı.

```js
$.tick(1)
assert.deepInclude($.rects('#e7e5e4'), { x: 8, y: 360, w: 48, h: 34, color: '#e7e5e4' })
assert.deepInclude($.rects('#e7e5e4'), { x: 60, y: 400, w: 48, h: 34, color: '#e7e5e4' })
const a = $.screen().find((c) => c.op === 'fillText' && c.args[0] === 'A')
assert.deepEqual(a.args.slice(1), [32, 384])
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

function keyRect(i) {
  const row = Math.floor(i / 9)
  return { x: 8 + (i % 9) * (KEY_W + 4), y: KEYS_Y + row * (KEY_H + 6) }
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

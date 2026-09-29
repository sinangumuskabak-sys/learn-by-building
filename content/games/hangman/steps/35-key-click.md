---
title: Tap a key
title_tr: Tuşa dokun
skills: [game.input]
---

# --goal--

Clicking or tapping a key guesses its letter. We turn the pointer position into canvas pixels and ask each key
whether the point is inside it.

# --goal-tr--

Son adım: ekrandaki tuşa **tıklamak** ya da **dokunmak** o harfi tahmin etsin. Böylece oyun telefonda da oynanır.

İki iş var: tıklanan noktayı **canvas piksellerine** çevirmek ve 26 tuşa tek tek "bu nokta sende mi?" diye sormak.

# --code--

```js
canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  if (state !== 'playing') {
    newWord()
    return
  }
  for (let i = 0; i < LETTERS.length; i++) {
    const k = keyRect(i)
    if (x >= k.x && x < k.x + KEY_W && y >= k.y && y < k.y + KEY_H) guess(LETTERS[i])
  }
})
```

# --meaning--

- `getBoundingClientRect()` tells where the canvas is on the screen and how big it looks. The canvas may be shown
  smaller or larger than 480 pixels, so we scale the pointer position into canvas pixels.
- After the game, a click still starts a new word.
- A point is inside a key when it is between its left and right edges **and** between its top and bottom. The gaps
  belong to no key.

# --meaning-tr--

- `(event)` → dinleyici artık olayı alıyor; tıklamanın yeri onda.
- `canvas.getBoundingClientRect()` → tuvalin ekrandaki **yeri ve boyu**. Tuval ekranda 480 pikselden küçük ya da
  büyük görünebilir (telefonda küçülür).
- `event.clientX - rect.left` → tıklamanın tuvalin sol kenarından uzaklığı (ekran pikseli). `* canvas.width /
  rect.width` → bunu **tuval pikseline** çevirir. `y` için aynısı.
- `if (state !== 'playing') { newWord(); return }` → oyun bittiyse eskisi gibi yeni kelime.
- `for` döngüsü 26 tuşa sorar: `x >= k.x && x < k.x + KEY_W` → nokta tuşun sol ve sağ kenarı **arasında mı**?
  `y` için aynı soru, üst ve alt kenar. `>=` "büyük ya da eşit".
- İkisi de doğruysa `guess(LETTERS[i])`. Tuşların arasındaki boşluk hiçbir tuşa ait değil; kenara basan kalın
  parmak yanlış harfe gitmez.

# --task--

Replace the whole `pointerdown` listener with the new one. Press **Run** and play with the mouse only.

# --task-tr--

Eski `pointerdown` dinleyicisini (üç satır) **sil** ve yerine yenisini yaz. **Çalıştır** ve sadece fareyle oyna:
tuşlara tıklayınca harfler tahmin edilmeli. Oyun bitti.

# --tests--

Clicking a key should guess its letter, and the gaps should not.
tr: Bir tuşa tıklamak harfini tahmin etmeli, boşluklar etmemeli.

```js
word = 'ZEBRA'
$.click(34 + 7 * 52 + 24, 440 + 17)
assert.isTrue(guessed.has('Z'))
$.click(8 + 3 * 52 + 24, 360 + 17)
assert.isTrue(guessed.has('D'))
assert.strictEqual(wrong, 1)
$.click(8 + 3 * 52 + 50, 360 + 17)
assert.strictEqual(guessed.size, 2, 'the gap between keys is not a key')
```

After the end, a click should still start a new word.
tr: Oyun bitince tıklama yine yeni kelime başlatmalı.

```js
state = 'lost'
$.click(240, 200)
assert.strictEqual(state, 'playing')
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

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  if (state !== 'playing') {
    newWord()
    return
  }
  for (let i = 0; i < LETTERS.length; i++) {
    const k = keyRect(i)
    if (x >= k.x && x < k.x + KEY_W && y >= k.y && y < k.y + KEY_H) guess(LETTERS[i])
  }
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
    let color = '#e7e5e4'
    if (guessed.has(letter)) color = word.includes(letter) ? '#86efac' : '#a8a29e'
    ctx.fillStyle = color
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

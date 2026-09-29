---
title: Remember the best streak
title_tr: En iyi seriyi hatırla
skills: [game.state]
---

# --goal--

The best streak should survive closing the page. `localStorage` keeps small pieces of text in the browser.

# --goal-tr--

Rekoru kırmak oyunun tadıdır. **En iyi seriyi** (best) tutacağız ve sayfa kapansa bile unutulmayacak.

Bunun için tarayıcının küçük not defterini kullanırız: `localStorage`. Oraya bir **ad** ile bir yazı kaydedersin;
sayfayı kapatıp açsan bile yerinde durur.

# --code--

```js
let best = Number(localStorage.getItem('hangman-best')) || 0

    streak += 1
    if (streak > best) {
      best = streak
      localStorage.setItem('hangman-best', best)
    }

  ctx.fillText('Streak ' + streak + '  Best ' + best, 260, 70)
```

# --meaning--

- `localStorage.getItem('hangman-best')` reads the saved text (or `null` the first time); `Number(...)` turns it into a
  number, and `|| 0` falls back to 0.
- When a win makes the streak bigger than the best, we update `best` and save it with `setItem`.
- The best is drawn next to the streak.

# --meaning-tr--

- `localStorage.getItem('hangman-best')` → not defterinden `hangman-best` adlı kaydı okur. İlk seferde kayıt yoktur:
  `null` (boş) gelir.
- `Number(...)` → kayıtlar hep yazıdır (`'3'`); `Number` onu sayıya (`3`) çevirir.
- `|| 0` → soldaki bir şey vermezse (kayıt yoksa) **0** kullan.
- `if (streak > best)` → seri rekoru geçtiyse (`>` "büyük"):
  - `best = streak` → yeni rekor.
  - `localStorage.setItem('hangman-best', best)` → deftere **yaz**.
- `'  Best '` → başında **iki** boşluk: seri ile rekor arasında biraz nefes payı.

# --task--

1. Under `let streak = 0` write the `best` line.
2. In `guess`, under `streak += 1`, write the `if (streak > best)` block.
3. In `draw`, add `+ '  Best ' + best` to the Streak text. Press **Run**.

# --task-tr--

1. `let streak = 0` satırının altına `best` satırını yaz.
2. `guess` içinde `streak += 1` satırının altına `if (streak > best) { ... }` bloğunu yaz.
3. `draw` içindeki `Streak` satırını `'Streak ' + streak + '  Best ' + best` olacak şekilde uzat.
4. **Çalıştır**, bir kelime bul, sonra sayfayı yenile: `Best 1` durmalı.

# --tests--

A new best streak should be saved.
tr: Yeni en iyi seri kaydedilmeli.

```js
assert.strictEqual(best, 0)
word = 'TIGER'
for (const key of 'tiger') $.press(key)
assert.strictEqual(best, 1)
assert.strictEqual(localStorage.getItem('hangman-best'), '1')
```

A loss should not lower the best.
tr: Kayıp rekoru düşürmemeli.

```js
streak = 4
best = 4
word = 'TIGER'
for (const key of 'abcdfh') $.press(key)
assert.strictEqual(streak, 0)
assert.strictEqual(best, 4)
```

The streak and the best should be drawn.
tr: Seri ve rekor yazılmalı.

```js
streak = 2
best = 5
$.tick(1)
assert.include($.texts(), 'Streak 2 Best 5')
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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newWord()
requestAnimationFrame(loop)
```

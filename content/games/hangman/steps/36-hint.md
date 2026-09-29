---
title: "Build it yourself: a hint button"
title_tr: "Kendin yap: ipucu düğmesi"
skills: [game.input, game.state]
---

# --goal--

Your game, your rules. Add a **Hint** button: clicking it reveals one hidden letter of the word, but it costs a miss.

# --goal-tr--

Oyun senin, kurallar da! Oyuna bir **ipucu düğmesi** ekle: tıklayınca kelimenin henüz açılmamış bir harfi açılsın,
ama bunun bedeli **bir ıska** olsun. Zor bir kelimede can simidi, ama bedava değil.

Bu adımda kod verilmiyor. Bildiklerin yetiyor: bir kutu ve yazı çizmek, tıklamanın bir kutunun içinde olup olmadığını
sormak, `guess`, `wrong`... Kontroller çalıştığında yeşile döner.

# --task--

- Draw a box at (380, 180), 80 wide and 36 tall, with the text `Hint` on it.
- While playing, a click inside that box reveals one letter of the word that is not guessed yet and adds one miss.
- If that letter completes the word, you win, as usual. After the game, a click still starts a new word.

# --task-tr--

- (380, 180) noktasına 80 piksel eninde, 36 piksel boyunda bir kutu çiz ve üstüne `Hint` yaz.
- Oyun sürerken bu kutunun içine tıklamak, kelimenin **henüz açılmamış** bir harfini açsın ve **bir ıska** eklesin.
- O harf kelimeyi tamamlıyorsa her zamanki gibi kazanırsın. Oyun bitince tıklama yine yeni kelime başlatır.

Değiştireceğin yerler: `draw` (düğme), `pointerdown` dinleyicisi (tıklama) ve belki yeni bir fonksiyon. Takılırsan
Maymun'a sor ya da ipucu kutusuna bak.

# --hint--

In the `pointerdown` listener, check the box the same way as a key: `x >= 380 && x < 460 && y >= 180 && y < 216`.
`[...word].find((l) => !guessed.has(l))` gives the first letter not guessed yet.

# --hint-tr--

`pointerdown` dinleyicisinde kutuyu bir tuş gibi sor: `x >= 380 && x < 460 && y >= 180 && y < 216`. Açılmamış ilk
harfi `[...word].find((l) => !guessed.has(l))` verir (`find`, koşulu tutan **ilk** elemanı bulur). Iskayı ekleyip
harfi `guess`'e verirsen kazanma kontrolü kendiliğinden çalışır.

# --tests--

The Hint button should be drawn.
tr: İpucu düğmesi çizilmeli.

```js
$.tick(1)
assert.include($.texts(), 'Hint')
```

Clicking Hint should reveal one hidden letter and cost one miss.
tr: İpucuna tıklamak gizli bir harfi açmalı ve bir ıskaya mal olmalı.

```js
word = 'TIGER'
guessed = new Set(['T'])
wrong = 0
state = 'playing'
$.click(420, 198)
assert.strictEqual(wrong, 1, 'a hint costs one miss')
assert.lengthOf([...guessed].filter((l) => word.includes(l)), 2, 'one more letter of the word is revealed')
assert.strictEqual(state, 'playing')
```

A hint that reveals the last letter should win.
tr: Son harfi açan ipucu kazandırmalı.

```js
word = 'TIGER'
guessed = new Set(['T', 'I', 'G', 'E'])
wrong = 1
state = 'playing'
$.click(420, 198)
assert.isTrue(guessed.has('R'))
assert.strictEqual(state, 'won')
```

A click outside the button and the keys should do nothing.
tr: Düğmenin ve tuşların dışına tıklamak hiçbir şey yapmamalı.

```js
word = 'TIGER'
guessed = new Set()
wrong = 0
state = 'playing'
$.click(300, 150)
assert.strictEqual(wrong, 0)
assert.strictEqual(guessed.size, 0)
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

function hint() {
  const hidden = [...word].find((l) => !guessed.has(l))
  wrong += 1
  guess(hidden)
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
  if (x >= 380 && x < 460 && y >= 180 && y < 216) {
    hint()
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

  ctx.fillStyle = '#fde68a'
  ctx.fillRect(380, 180, 80, 36)
  ctx.fillStyle = '#1f2937'
  ctx.fillText('Hint', 420, 204)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newWord()
requestAnimationFrame(loop)
```

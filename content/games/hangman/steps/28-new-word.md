---
title: Never the same word twice
title_tr: Aynı kelime art arda gelmesin
skills: [prog.loops]
---

# --goal--

A random pick can give the same word twice in a row, and players find that broken. A `do ... while` loop picks again
until the new word differs from the last one.

# --goal-tr--

Rastgele seçim aynı kelimeyi **art arda** verebilir; az önce bulduğun kelimenin yine gelmesi oyuncuya bozuk gibi
gelir. Çözüm: yeni kelime eskisiyle aynıysa **yeniden seç**.

Bunun için `do ... while` döngüsünü kullanacağız: **önce yapar, sonra kontrol eder**. Zar atıp "aynı geldi, bir
daha at" demek gibi.

# --code--

```js
function newWord() {
  let next
  do next = WORDS[Math.floor(Math.random() * WORDS.length)]
  while (next === word) // never the same word twice in a row
  word = next
  guessed = new Set()
```

# --meaning--

- `next` is the candidate word.
- `do ... while (next === word)` picks a candidate, then repeats as long as it equals the current word.
- Only then does `word` become `next`.

# --meaning-tr--

- `let next` → **aday** kelime için geçici bir değişken. Fonksiyonun içinde tanımlandığı için sadece orada vardır.
- `do next = ...` → önce bir aday **seç**.
- `while (next === word)` → aday şimdiki kelimeyle **aynıysa** `do` satırını tekrarla. Farklı olunca döngü biter.
- `word = next` → farklı olduğundan emin olduğumuz adayı kelime yap.
- İlk oyunda `word` henüz boş (`undefined`), hiçbir kelimeye eşit değil; döngü bir kerede biter.

# --task--

In `newWord`, replace the `word = WORDS[...]` line with the four lines. Press **Run**.

# --task-tr--

`newWord` içindeki `word = WORDS[...]` satırını dört satırla değiştir: `let next`, `do next = ...` (eski satırın sağ
tarafı), `while (...)` ve `word = next`. **Çalıştır**.

# --predict--

If `WORDS` had only one word, what would `newWord()` do the second time?
- [ ] Pick the same word
- [x] Loop forever
  Every pick equals the current word, so `while` never lets go. That is why the list must have at least two words.
- [ ] Pick an empty word

# --predict-tr--

`WORDS`'te tek bir kelime olsaydı, `newWord()` ikinci kez ne yapardı?
- [ ] Aynı kelimeyi seçerdi
- [x] Sonsuza kadar dönerdi
  Her aday şimdiki kelimeye eşit olur ve `while` hiç bırakmaz. Listede en az iki kelime olmasının sebebi bu.
- [ ] Boş bir kelime seçerdi

# --tests--

Even with only two words, the next word should always be the other one.
tr: Sadece iki kelime olsa bile yeni kelime hep diğeri olmalı.

```js
WORDS.splice(2)
word = 'APPLE'
for (let i = 0; i < 30; i++) {
  const last = word
  newWord()
  assert.notStrictEqual(word, last, 'never the same word twice in a row')
}
```

The new word should still be one of the `WORDS`.
tr: Yeni kelime yine `WORDS` listesinden olmalı.

```js
for (let i = 0; i < 50; i++) {
  newWord()
  assert.include(WORDS, word)
}
WORDS.splice(2)
word = 'APPLE'
newWord()
assert.strictEqual(word, 'BANANA')
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
  } else if (wrong === MAX_WRONG) {
    state = 'lost'
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

---
title: Winning, losing, again
title_tr: Kazanmak, kaybetmek, yeniden
skills: [game.state]
---

# --explanation--

You **win** when every letter of the word has been guessed. That is a question about all of them, and arrays have a method
that asks exactly that: `every` is true when the test is true for every item.

```js
[...word].every((l) => guessed.has(l))
```

You **lose** on the sixth miss, and then the game should show the word you missed, in red. It is only fair.

A `state` of `'playing'`, `'won'` or `'lost'` keeps it clear. `guess` only works while playing, and after the end, Enter,
Space or a click starts a new word.

One detail players notice: the same word twice in a row feels broken, even though a random pick allows it. A `do ... while`
loop picks again until the word is different from the last one.

A **streak** counts words solved in a row and goes back to 0 on a loss; the best streak is saved in `localStorage`.

# --explanation-tr--

Kelimenin her harfi tahmin edildiğinde **kazanırsın**. Bu hepsi hakkında bir sorudur ve dizilerin tam bunu soran bir yöntemi
vardır: `every`, test her öğe için doğruysa doğrudur.

```js
[...word].every((l) => guessed.has(l))
```

Altıncı ıskada **kaybedersin** ve sonra oyun kaçırdığın kelimeyi kırmızıyla göstermelidir. Adil olan budur.

`'playing'`, `'won'` ya da `'lost'` olan bir `state` bunu açık tutar. `guess` yalnızca oynarken çalışır; bittikten sonra Enter,
Boşluk ya da bir tıklama yeni bir kelime başlatır.

Oyuncuların fark ettiği bir ayrıntı: rastgele seçim buna izin verse de aynı kelimenin art arda iki kez gelmesi bozuk hissettirir.
Bir `do ... while` döngüsü kelime bir öncekinden farklı olana kadar yeniden seçer.

Bir **seri**, art arda çözülen kelimeleri sayar ve bir kayıpta 0'a döner; en iyi seri `localStorage`'a kaydedilir.

# --task--

1. Add `state` (`'playing'` in `newWord()`), `streak = 0` and `best`, kept in `localStorage` under `'hangman-best'`.
2. `newWord()` picks again while the new word equals the current one.
3. `guess` only works while `'playing'`. When every letter is guessed, set `'won'`, add 1 to `streak` and save a new best;
   at `MAX_WRONG` misses set `'lost'` and `streak = 0`.
4. When the game is not `'playing'`, Enter, Space (`preventDefault()`) or a click calls `newWord()`.
5. Draw `Streak 1  Best 3` at `(260, 70)`. When `'lost'`, draw the whole word in `'#b91c1c'` instead of `masked()`. When the game
   is over, draw `You got it! Click for the next word` (in `'#15803d'`) or `Hanged! Click to try another` (in `'#b91c1c'`),
   `'bold 20px sans-serif'`, centered at `y = 298`.

# --task-tr--

1. `state` (`newWord()`'de `'playing'`), `streak = 0` ve `localStorage`'da `'hangman-best'` adıyla tutulan `best` ekle.
2. `newWord()`, yeni kelime şimdikine eşit olduğu sürece yeniden seçer.
3. `guess` yalnızca `'playing'` iken çalışır. Her harf tahmin edildiğinde `'won'` yap, `streak`'e 1 ekle ve yeni bir en iyiyi
   kaydet; `MAX_WRONG` ıskada `'lost'` ve `streak = 0` yap.
4. Oyun `'playing'` değilken Enter, Boşluk (`preventDefault()`) ya da bir tıklama `newWord()`'ü çağırır.
5. `(260, 70)`'e `Streak 1  Best 3` çiz. `'lost'` olduğunda `masked()` yerine bütün kelimeyi `'#b91c1c'` ile çiz. Oyun
   bittiğinde `You got it! Click for the next word` (`'#15803d'` ile) ya da `Hanged! Click to try another` (`'#b91c1c'` ile)
   yazısını `'bold 20px sans-serif'` ile `y = 298`'de ortalı çiz.

# --tests--

Guessing every letter should win, grow the streak and save the best.
tr: Her harfi tahmin etmek kazandırmalı, seriyi büyütmeli ve en iyiyi kaydetmeli.

```js
word = 'TIGER'
guessed = new Set()
wrong = 0
state = 'playing'
for (const key of 'tigxe') $.press(key)
assert.strictEqual(state, 'playing')
$.press('r')
assert.strictEqual(state, 'won')
assert.strictEqual(streak, 1)
assert.strictEqual(best, 1)
assert.strictEqual(localStorage.getItem('hangman-best'), '1')
$.press('b')
assert.isFalse(guessed.has('B'), 'no guessing after the end')
$.tick(1)
assert.include($.texts(), 'You got it! Click for the next word')
```

The sixth miss should lose, end the streak and reveal the word in red.
tr: Altıncı ıska kaybettirmeli, seriyi bitirmeli ve kelimeyi kırmızıyla göstermeli.

```js
word = 'TIGER'
guessed = new Set()
wrong = 0
state = 'playing'
streak = 3
for (const key of 'abcdf') $.press(key)
assert.strictEqual(state, 'playing')
$.press('h')
assert.strictEqual(state, 'lost')
assert.strictEqual(streak, 0, 'a loss ends the streak')
$.tick(1)
const shown = $.screen().filter((c) => c.op === 'fillText' && c.args[0] === 'T I G E R')
assert.lengthOf(shown, 1, 'the word is revealed')
assert.strictEqual(shown[0].fill, '#b91c1c')
```

Enter or a click should start a new word, never the same one twice in a row.
tr: Enter ya da bir tıklama yeni bir kelime başlatmalı; art arda asla aynı kelime olmamalı.

```js
state = 'won'
const before = word
$.press('Enter')
assert.strictEqual(state, 'playing')
assert.notStrictEqual(word, before)
state = 'lost'
$.click(240, 200)
assert.strictEqual(state, 'playing', 'a click starts the next word')
for (let i = 0; i < 100; i++) {
  const last = word
  newWord()
  assert.notStrictEqual(word, last, 'never the same word twice in a row')
}
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

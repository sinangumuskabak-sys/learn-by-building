---
title: List the wrong letters
title_tr: Yanlış harfleri listele
skills: [prog.arrays]
---

# --goal--

Showing the wrong letters saves the player from trying them again. They are the guessed letters **not** in the word.

# --goal-tr--

Yanlış denediğin harfleri görmek işe yarar: aynı harfe boşuna tekrar basmazsın. Sayacın altına onları **kırmızıyla**
yazacağız: `Q X` gibi.

Yanlış harfler, denenen ama kelimede **olmayan** harflerdir. Listeyi süzerek buluruz.

# --code--

```js
function draw() {
  // ...
  ctx.fillText('Misses ' + wrong + ' / ' + MAX_WRONG, 260, 100)
  ctx.fillStyle = '#b91c1c'
  ctx.fillText([...guessed].filter((l) => !word.includes(l)).join(' '), 260, 130)
```

# --meaning--

- `[...guessed]` turns the Set into an array.
- `.filter((l) => !word.includes(l))` keeps only the letters the word does not contain.
- `.join(' ')` makes them one text: `'Q X'`. It is drawn in red under the counter.

# --meaning-tr--

- `ctx.fillStyle = '#b91c1c'` → kırmızı.
- `[...guessed]` → kümeyi bir **listeye** çevirir (kelimeyi harflerine ayırdığımız gibi).
- `.filter((l) => !word.includes(l))` → listeyi **süzer**: ok fonksiyonu `true` dediği elemanlar kalır, diğerleri
  atılır. Burada: kelimede **olmayan** harfler kalır. (`map` her elemanı değiştirir, `filter` bazılarını eler.)
- `.join(' ')` → aralarına boşluk koyup yazıya çevirir: `'Q X'`.
- `260, 130` → sayacın 30 piksel altı.

# --task--

In `draw`, under the `Misses` line, write the two lines. Press **Run** and try some letters.

# --task-tr--

`draw` içinde `ctx.fillText('Misses ' ...)` satırının hemen altına iki satırı yaz. **Çalıştır**, oyuna tıkla ve
harfler dene: yanlış olanlar kırmızıyla listelenmeli, doğrular listede olmamalı.

# --try--

Change `.join(' ')` to `.join(', ')` and run: `Q, X`. Put `' '` back.

# --try-tr--

`.join(' ')` yerine `.join(', ')` yaz ve çalıştır: `Q, X` olur. Sonra `' '`'ye geri al.

# --tests--

The wrong letters should be listed in red at (260, 130).
tr: Yanlış harfler (260, 130)'da kırmızıyla listelenmeli.

```js
word = 'CASTLE'
$.press('c')
$.press('q')
$.press('x')
$.tick(1)
assert.include($.texts(), 'C _ _ _ _ _')
const t = $.screen().find((c) => c.op === 'fillText' && c.args[0] === 'Q X')
assert.exists(t, 'Q X should be drawn')
assert.deepEqual(t.args.slice(1), [260, 130])
assert.strictEqual(t.fill, '#b91c1c')
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

// The word with the letters not guessed yet hidden: 'C _ S T _ E'.
const masked = () => [...word].map((letter) => (guessed.has(letter) ? letter : '_')).join(' ')

function newWord() {
  word = WORDS[Math.floor(Math.random() * WORDS.length)]
  guessed = new Set()
  wrong = 0
}

function guess(letter) {
  if (guessed.has(letter) || wrong === MAX_WRONG) return
  guessed.add(letter)
  if (!word.includes(letter)) wrong += 1
}

document.addEventListener('keydown', (event) => {
  const letter = event.key.toUpperCase()
  if (letter.length === 1 && LETTERS.includes(letter)) guess(letter)
})

function draw() {
  ctx.fillStyle = '#fefce8'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#1f2937'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Misses ' + wrong + ' / ' + MAX_WRONG, 260, 100)
  ctx.fillStyle = '#b91c1c'
  ctx.fillText([...guessed].filter((l) => !word.includes(l)).join(' '), 260, 130)

  ctx.textAlign = 'center'
  ctx.font = 'bold 32px monospace'
  ctx.fillStyle = '#1f2937'
  ctx.fillText(masked(), canvas.width / 2, 340)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newWord()
requestAnimationFrame(loop)
```

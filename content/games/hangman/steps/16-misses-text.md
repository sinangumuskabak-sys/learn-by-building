---
title: Show the misses
title_tr: Iskaları göster
skills: [game.canvas]
---

# --goal--

The player should see how many misses are left: `Misses 2 / 6` on the right.

# --goal-tr--

Oyuncu kaç ıska hakkı kaldığını **görmeli**. Sağ üste `Misses 2 / 6` (ıska 2 / 6) gibi bir sayaç yazacağız.

Yazı, sayı ve yazıyı `+` ile yan yana ekleyerek oluşacak.

# --code--

```js
function draw() {
  ctx.fillStyle = '#fefce8'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#1f2937'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Misses ' + wrong + ' / ' + MAX_WRONG, 260, 100)
```

# --meaning--

- A smaller font, `'bold 16px sans-serif'`, and left alignment: the text starts at x = 260.
- `'Misses ' + wrong + ' / ' + MAX_WRONG` joins text and numbers into `'Misses 2 / 6'`.

# --meaning-tr--

- `ctx.fillStyle = '#1f2937'` → koyu gri.
- `ctx.font = 'bold 16px sans-serif'` → daha küçük (16 piksel), düz bir yazı tipi.
- `ctx.textAlign = 'left'` → yazının **sol ucu** verilen noktaya gelir: yazı x = 260'tan başlayıp sağa uzar.
- `'Misses ' + wrong + ' / ' + MAX_WRONG` → `+` yazı ile sayıyı **yan yana ekler**: `'Misses '` + `2` + `' / '` +
  `6` = `'Misses 2 / 6'`. Tırnak içindeki boşluklara dikkat; onlar da yazının parçası.
- `260, 100` → sağ yarıda, yukarıdan 100 piksel.
- Kelimeyi yazan bölüm `textAlign`'ı yine `'center'` yaptığı için kelime ortalı kalır.

# --task--

In `draw`, under the `fillRect` line, leave an empty line and write the four lines (above `ctx.textAlign = 'center'`).
Press **Run**, click the game and try some wrong letters.

# --task-tr--

`draw` içinde, `ctx.fillRect(...)` satırının altına bir boş satır bırakıp dört satırı yaz; `ctx.textAlign = 'center'`
satırının **üstünde** bir boş satır kalsın. **Çalıştır**, oyuna tıkla ve yanlış harfler dene: sayı artmalı.

# --hint--

If the check about the text fails, look at the spaces inside the quotes: `'Misses '` and `' / '`.

# --hint-tr--

Yazı kontrolü kırmızıysa tırnak içindeki boşluklara bak: `'Misses '` ve `' / '`.

# --tests--

The misses should be shown as `Misses 2 / 6` at (260, 100).
tr: Iskalar (260, 100)'de `Misses 2 / 6` olarak gösterilmeli.

```js
word = 'CASTLE'
$.press('q')
$.press('x')
$.press('c')
$.tick(1)
const t = $.screen().find((c) => c.op === 'fillText' && c.args[0] === 'Misses 2 / 6')
assert.exists(t, 'Misses 2 / 6 should be drawn')
assert.deepEqual(t.args.slice(1), [260, 100])
```

The word should still be drawn centered.
tr: Kelime yine ortalı çizilmeli.

```js
word = 'CASTLE'
$.press('c')
$.tick(1)
const t = $.screen().find((c) => c.op === 'fillText' && c.args[0] === 'C _ _ _ _ _')
assert.exists(t)
assert.deepEqual(t.args.slice(1), [240, 340])
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

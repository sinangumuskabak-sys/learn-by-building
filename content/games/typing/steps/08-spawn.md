---
title: A new word from the list
title_tr: Listeden yeni bir kelime
skills: [prog.arrays]
---

# --goal--

`spawn` adds a random word from the `WORDS` list at the top. Its `x` is random too, but not so far right that the word
hangs off the edge: the canvas can **measure** how wide a text will be.

# --goal-tr--

Kelimeleri elle yazmak yerine uzun bir **kelime listesinden** rastgele seçeceğiz. `spawn` (doğur) fonksiyonu ekranın
tepesine yeni bir kelime koyacak.

Kelimenin yatay yeri de rastgele olacak; ama kelime ekranın sağından **taşmamalı**. Bunun için kelimenin kaç piksel
**geniş** olacağını bilmeliyiz. Canvas bunu ölçebilir: önce yazı tipini ayarlarsın, sonra "şu yazı ne kadar geniş?"
diye sorarsın.

# --code--

```js
const WORDS = [
  'cat', 'sun', 'code', 'game', 'jump', 'fast', 'loop', 'byte', 'star', 'tree', 'rain', 'blue', 'fire', 'wind', 'moon',
  'array', 'pixel', 'mouse', 'score', 'level', 'robot', 'light', 'music', 'space', 'river', 'green', 'cloud', 'train',
  'planet', 'rocket', 'string', 'number', 'button', 'screen', 'window', 'random', 'object', 'player', 'dragon', 'puzzle',
  'keyboard', 'function', 'variable', 'computer', 'triangle', 'elephant', 'mountain', 'sandwich',
]

function spawn() {
  const text = WORDS[Math.floor(Math.random() * WORDS.length)]
  ctx.font = FONT
  const width = ctx.measureText(text).width
  words.push({ text, x: 10 + Math.random() * (canvas.width - 20 - width), y: 30 })
}
```

# --meaning--

- `Math.random()` is a random number from 0 up to 1; times `WORDS.length`, rounded down by `Math.floor`, it is a
  random position in the list.
- `ctx.measureText(text).width` is the text's width in pixels with the current font.
- `x` goes from 10 to `canvas.width - 10 - width`, so the word always fits. `push` adds the new word to the list.
- `{ text, ... }` is short for `{ text: text, ... }`.

# --meaning-tr--

- `WORDS` → 48 kelimelik bir liste; hepsi küçük harf. Satırlar sadece okunsun diye bölündü.
- `Math.random()` → 0 ile 1 arasında rastgele bir sayı (0.73 gibi). `* WORDS.length` → 0 ile 48 arası.
  `Math.floor` → **aşağı yuvarlar**: 35.04 → 35. Yani listeden rastgele bir **sıra numarası**.
- `WORDS[...]` → o sıradaki kelime. Liste numaraları **0'dan** başlar.
- `ctx.font = FONT` ve `ctx.measureText(text).width` → önce yazı tipini ayarla, sonra yazının **genişliğini**
  piksel olarak ölç.
- `10 + Math.random() * (canvas.width - 20 - width)` → soldan en az 10 piksel içeride; en sağda da kelimenin sonu
  kenara 10 piksel kalacak kadar. 480 genişlikte 60 piksellik bir kelime için `x` 10 ile 410 arası.
- `words.push({ ... })` → listenin **sonuna** yeni bir kelime ekler. `text` tek başına, `text: text`'in kısaltması.
  `y: 30` → tepede, skor yazısının hemen altında.

# --task--

1. Under `const ctx = ...` and its empty line, above `GROUND`, write `WORDS`.
2. Above `function reset() {` write `spawn`, with an empty line after it.

# --task-tr--

1. `const GROUND = ...` satırının **üstüne** `WORDS` listesini yaz (ya da buradan kopyala: bu kod değil, bir kelime
   listesi).
2. `function reset() {` satırının **üstüne** `spawn` fonksiyonunu yaz; altında bir boş satır kalsın.
3. **Çalıştır**: henüz kimse `spawn`'ı çağırmıyor; ekran değişmez.

# --tests--

`WORDS` should have at least 30 words, small letters only.
tr: `WORDS` en az 30 kelime içermeli, yalnız küçük harf.

```js
assert.isAtLeast(WORDS.length, 30)
for (const w of WORDS) assert.match(w, /^[a-z]+$/, 'small letters only')
```

`spawn()` should add a random word from the list at the top, fitting on the screen.
tr: `spawn()` listeden rastgele bir kelimeyi tepeye, ekrana sığacak şekilde eklemeli.

```js
for (let i = 0; i < 50; i++) {
  words = []
  spawn()
  assert.lengthOf(words, 1)
  const w = words[0]
  assert.include(WORDS, w.text)
  assert.strictEqual(w.y, 30)
  assert.isAtLeast(w.x, 10)
  ctx.font = FONT
  assert.isAtMost(w.x + ctx.measureText(w.text).width, canvas.width - 10, 'the word fits on the screen')
}
```

# --solution--

```js
// Typing game, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const WORDS = [
  'cat', 'sun', 'code', 'game', 'jump', 'fast', 'loop', 'byte', 'star', 'tree', 'rain', 'blue', 'fire', 'wind', 'moon',
  'array', 'pixel', 'mouse', 'score', 'level', 'robot', 'light', 'music', 'space', 'river', 'green', 'cloud', 'train',
  'planet', 'rocket', 'string', 'number', 'button', 'screen', 'window', 'random', 'object', 'player', 'dragon', 'puzzle',
  'keyboard', 'function', 'variable', 'computer', 'triangle', 'elephant', 'mountain', 'sandwich',
]
const GROUND = 330 // words that fall past this line are gone
const SPEED = 0.35
const FONT = 'bold 20px monospace'

let words // { text, x, y }

function spawn() {
  const text = WORDS[Math.floor(Math.random() * WORDS.length)]
  ctx.font = FONT
  const width = ctx.measureText(text).width
  words.push({ text, x: 10 + Math.random() * (canvas.width - 20 - width), y: 30 })
}

function reset() {
  words = [
    { text: 'rocket', x: 40, y: 120 },
    { text: 'cat', x: 300, y: 60 },
  ]
}

function update() {
  for (const w of words) w.y += SPEED
}

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#7f1d1d'
  ctx.fillRect(0, GROUND + 4, canvas.width, 3)

  ctx.font = FONT
  ctx.textAlign = 'left'
  ctx.fillStyle = '#cbd5e1'
  for (const w of words) ctx.fillText(w.text, w.x, w.y)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```

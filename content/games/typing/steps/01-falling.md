---
title: Falling words
title_tr: Düşen kelimeler
skills: [game.loop, prog.arrays]
---

# --explanation--

In this game words fall from the sky, and you type them before they land. It is a fun way to practise typing, and a good
exercise in **text on a canvas**.

The words are objects in an array: `{ text, x, y }`. Two timers run the rain. A **spawn timer** counts down every frame, and
at zero a new word appears at the top and the timer starts again. Meanwhile every word moves down by `SPEED`. A word that
passes the red ground line is removed.

Where can a new word start? Not so far right that it hangs off the edge. We need to know how **wide** the word will be, and
the canvas can tell us: set the font, then `ctx.measureText(text).width` returns the width in pixels. The left edge can then
be anywhere from 10 to `canvas.width - 10 - width`.

With `textAlign = 'left'`, `fillText(text, x, y)` puts the start of the text at `x` and its **baseline** (the line the letters
sit on) at `y`.

# --explanation-tr--

Bu oyunda kelimeler gökten düşer ve sen onları yere değmeden yazarsın. Yazma pratiği yapmanın eğlenceli bir yoludur ve
**canvas'ta metin** için iyi bir alıştırmadır.

Kelimeler bir dizideki nesnelerdir: `{ text, x, y }`. Yağmuru iki zamanlayıcı yönetir. Bir **doğma zamanlayıcısı** her karede
geri sayar; sıfırda tepede yeni bir kelime belirir ve zamanlayıcı yeniden başlar. Bu sırada her kelime `SPEED` kadar aşağı
iner. Kırmızı zemin çizgisini geçen bir kelime silinir.

Yeni bir kelime nereden başlayabilir? Kenardan taşacak kadar sağdan değil. Kelimenin ne kadar **geniş** olacağını bilmemiz
gerekir ve canvas bunu söyleyebilir: yazı tipini ayarla, sonra `ctx.measureText(text).width` genişliği piksel olarak döndürür.
Sol kenar o zaman 10'dan `canvas.width - 10 - width`'e kadar herhangi bir yerde olabilir.

`textAlign = 'left'` iken `fillText(text, x, y)` metnin başını `x`'e ve **taban çizgisini** (harflerin oturduğu çizgi) `y`'ye
koyar.

# --task--

1. Add a `WORDS` list (at least 30 words, small letters only), `GROUND = 330`, `SPEED = 0.35`, `SPAWN_EVERY = 138` and
   `FONT = 'bold 20px monospace'`.
2. Write `spawn()`: a random word at `y = 30` (just under the score) and a random `x` from 10 to `canvas.width - 10` minus its measured width.
3. `reset()` starts with no words and `spawnTimer = 0`. Write `update()`, called before `draw()`: count `spawnTimer` down and
   at `0` (or below) spawn and set it to `SPAWN_EVERY`; move every word down by `SPEED`; remove words below `GROUND`.
4. Draw: fill `'#020617'`, a `'#7f1d1d'` line 3 high at `GROUND + 4`, and every word in `'#cbd5e1'` with `FONT`, left-aligned.

# --task-tr--

1. Bir `WORDS` listesi (en az 30 kelime, yalnızca küçük harf), `GROUND = 330`, `SPEED = 0.35`, `SPAWN_EVERY = 138` ve
   `FONT = 'bold 20px monospace'` ekle.
2. `spawn()` yaz: `y = 30`'da (puanın hemen altında) rastgele bir kelime ve 10'dan `canvas.width - 10` eksi ölçülen genişliğine rastgele bir `x`.
3. `reset()` kelimesiz ve `spawnTimer = 0` ile başlar. `draw()`'dan önce çağrılan `update()`'i yaz: `spawnTimer`'ı geri say ve
   `0`'da (ya da altında) doğur ve onu `SPAWN_EVERY` yap; her kelimeyi `SPEED` kadar indir; `GROUND`'un altındaki kelimeleri sil.
4. Çiz: `'#020617'` doldur, `GROUND + 4`'te 3 yüksekliğinde `'#7f1d1d'` bir çizgi ve her kelimeyi `FONT` ile, sola hizalı,
   `'#cbd5e1'` renginde.

# --tests--

The first word should appear at once, and fit on the screen.
tr: İlk kelime hemen belirmeli ve ekrana sığmalı.

```js
assert.isAtLeast(WORDS.length, 30)
for (const w of WORDS) assert.match(w, /^[a-z]+$/, 'small letters only')
assert.lengthOf(words, 0)
$.tick(1)
assert.lengthOf(words, 1, 'the first word comes at once')
assert.include(WORDS, words[0].text)
assert.isAtLeast(words[0].x, 10)
ctx.font = FONT
assert.isAtMost(words[0].x + ctx.measureText(words[0].text).width, canvas.width - 10, 'the word fits on the screen')
```

Words should fall, keep coming, and disappear past the ground.
tr: Kelimeler düşmeli, gelmeye devam etmeli ve zemini geçince kaybolmalı.

```js
$.tick(1)
const y = words[0].y
$.tick(10)
assert.isAbove(words[0].y, y, 'words fall')
$.tick(200)
assert.isAtLeast(words.length, 2, 'more words keep coming')
words = [{ text: 'cat', x: 10, y: GROUND - 0.1 }]
spawnTimer = 1000
$.tick(1)
assert.lengthOf(words, 0, 'a word past the ground is gone')
```

Each word should be drawn where it is.
tr: Her kelime bulunduğu yerde çizilmeli.

```js
spawnTimer = 1000
words = [{ text: 'rocket', x: 40, y: 120 }]
$.tick(1)
const t = $.screen().filter((c) => c.op === 'fillText' && c.args[0] === 'rocket')
assert.lengthOf(t, 1)
assert.closeTo(t[0].args[1], 40, 1e-9)
assert.isAbove(t[0].args[2], 120)
```

# --seed--

```js
// Typing game, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
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
const SPAWN_EVERY = 138
const FONT = 'bold 20px monospace'

let words // { text, x, y }
let spawnTimer

function spawn() {
  const text = WORDS[Math.floor(Math.random() * WORDS.length)]
  ctx.font = FONT
  const width = ctx.measureText(text).width
  words.push({ text, x: 10 + Math.random() * (canvas.width - 20 - width), y: 30 })
}

function reset() {
  words = []
  spawnTimer = 0
}

function update() {
  spawnTimer -= 1
  if (spawnTimer <= 0) {
    spawn()
    spawnTimer = SPAWN_EVERY
  }
  for (const w of words) w.y += SPEED
  words = words.filter((w) => w.y <= GROUND)
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

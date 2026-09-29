---
title: Half a word in yellow
title_tr: Yarım kelime sarı
skills: [game.canvas]
---

# --goal--

The typed part of the target is drawn in yellow and the rest in white. There is no "color half a word" command, so we
draw two pieces: the typed part at `x`, and the rest starting exactly where the first piece ends.

# --goal-tr--

Oyuncu nereye kadar yazdığını görmeli: hedefin yazılan kısmı **sarı**, kalanı **beyaz** olsun. Ama canvas'ta
"kelimenin yarısını boya" diye bir komut yok. Çözüm: kelimeyi **iki parça** çizmek. Önce yazılan kısım `x`'te, sonra
kalan kısım **tam birinci parçanın bittiği yerde**. Bitişi `measureText` ile ölçeriz.

Eş aralıklı yazı tipi sayesinde iki parça dikişsiz birleşir.

# --code--

```js
for (const w of words) {
  // The typed part in yellow, the rest in white right after it.
  const done = w === target ? w.text.slice(0, typed) : ''
  ctx.fillStyle = '#facc15'
  ctx.fillText(done, w.x, w.y)
  ctx.fillStyle = w === target ? '#ffffff' : '#cbd5e1'
  ctx.fillText(w.text.slice(done.length), w.x + ctx.measureText(done).width, w.y)
}
```

# --meaning--

- `slice(0, typed)` is the first `typed` letters; for words that are not the target, `done` is empty.
- The rest, `slice(done.length)`, starts at `x` plus the measured width of `done`.
- The target's rest is white, other words stay light grey.

# --meaning-tr--

- `for (const w of words) {` → döngü artık birkaç satırlık; süslü parantezli.
- `const done = w === target ? w.text.slice(0, typed) : ''` → bu kelime hedefse yazılan kısım, değilse boş yazı
  (`''`). `koşul ? evetse : hayırsa`.
- `w.text.slice(0, typed)` → `slice` yazının bir **parçasını** keser: 0'dan başlayıp `typed`'a kadar (o dahil
  değil). `'cat'.slice(0, 2)` → `'ca'`.
- `ctx.fillText(done, w.x, w.y)` → yazılan kısım sarı.
- `w.text.slice(done.length)` → tek sayı verilirse oradan **sona kadar**: `'cat'.slice(2)` → `'t'`.
- `w.x + ctx.measureText(done).width` → kalan kısım, sarı parçanın genişliği kadar sağdan başlar.
- `w === target ? '#ffffff' : '#cbd5e1'` → hedefin kalanı parlak beyaz, diğer kelimeler açık gri.

# --task--

In `draw`, replace the `'#cbd5e1'` color line and the one-line `for` with the new loop.

# --task-tr--

1. `draw` içindeki `ctx.fillStyle = '#cbd5e1'` satırını ve tek satırlık `for` satırını sil.
2. Yerine yeni döngüyü yaz (`ctx.font` ve `ctx.textAlign` satırları üstte kalır).
3. **Çalıştır** ve bir kelimeyi yazmaya başla: yazdığın harfler sararmalı.

# --try--

Change `monospace` in `FONT` to `serif` and type a word: the two pieces still join, because we measure. Put `monospace` back.

# --try-tr--

`FONT` içindeki `monospace`'i `serif` yap ve bir kelime yaz: iki parça yine birleşir, çünkü ölçüyoruz. Sonra `monospace`'e geri al.

# --tests--

The typed part should be yellow, with the rest drawn right after it in white.
tr: Yazılan kısım sarı olmalı; geri kalanı hemen ardından beyaz çizilmeli.

```js
spawnTimer = 1000
words = [{ text: 'cat', x: 200, y: 200 }]
$.press('c')
$.press('a')
$.tick(1)
const texts = $.screen().filter((c) => c.op === 'fillText')
const done = texts.find((c) => c.args[0] === 'ca')
assert.strictEqual(done.fill, '#facc15', 'the typed part is yellow')
const rest = texts.find((c) => c.args[0] === 't')
assert.strictEqual(rest.fill, '#ffffff')
ctx.font = FONT
assert.closeTo(rest.args[1], 200 + ctx.measureText('ca').width, 1e-9, 'the rest starts right after it')
```

Other words should stay light grey and whole.
tr: Diğer kelimeler açık gri ve bütün kalmalı.

```js
spawnTimer = 1000
words = [{ text: 'sun', x: 50, y: 100 }, { text: 'cat', x: 200, y: 200 }]
$.press('c')
$.tick(1)
const sun = $.screen().find((c) => c.op === 'fillText' && c.args[0] === 'sun')
assert.strictEqual(sun.fill, '#cbd5e1')
assert.closeTo(sun.args[1], 50, 1e-9)
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
let target // the word being typed, or null
let typed // how many letters of the target are typed
let spawnTimer

function spawn() {
  const text = WORDS[Math.floor(Math.random() * WORDS.length)]
  ctx.font = FONT
  const width = ctx.measureText(text).width
  words.push({ text, x: 10 + Math.random() * (canvas.width - 20 - width), y: 30 })
}

function reset() {
  words = []
  target = null
  typed = 0
  spawnTimer = 0
}

function type(key) {
  if (!target) {
    // Lock on to the lowest word starting with this letter: it is the most urgent.
    const options = words.filter((w) => w.text[0] === key).sort((a, b) => b.y - a.y)
    if (options.length === 0) return
    target = options[0]
    typed = 0
  }
  if (target.text[typed] !== key) return
  typed += 1
  if (typed === target.text.length) {
    words = words.filter((w) => w !== target)
    target = null
  }
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

document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase()
  if (key.length === 1 && key >= 'a' && key <= 'z') {
    event.preventDefault()
    type(key)
  }
})

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#7f1d1d'
  ctx.fillRect(0, GROUND + 4, canvas.width, 3)

  ctx.font = FONT
  ctx.textAlign = 'left'
  for (const w of words) {
    // The typed part in yellow, the rest in white right after it.
    const done = w === target ? w.text.slice(0, typed) : ''
    ctx.fillStyle = '#facc15'
    ctx.fillText(done, w.x, w.y)
    ctx.fillStyle = w === target ? '#ffffff' : '#cbd5e1'
    ctx.fillText(w.text.slice(done.length), w.x + ctx.measureText(done).width, w.y)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```

---
title: Show the letters
title_tr: Harfleri göster
skills: [game.canvas]
---

# --goal--

The typed letters go into the first row, big and upper case, centered in their tiles. A tile with a letter gets a
brighter outline.

# --goal-tr--

Yazdıkların **görünmeli**: harfler ilk satırın karelerine, büyük harfle ve ortalanarak yazılsın. Harfi olan karenin
çerçevesi de biraz parlasın; nerede olduğunu hemen gör.

# --code--

```js
ctx.textAlign = 'center'
ctx.textBaseline = 'middle'

for (let row = 0; row < TRIES; row++) {
  const letters = row === 0 ? current : ''

    ctx.strokeStyle = letters[i] ? '#a1a1aa' : '#3f3f46'

    if (letters[i]) {
      ctx.fillStyle = 'white'
      ctx.font = 'bold 28px sans-serif'
      ctx.fillText(letters[i].toUpperCase(), x + SIZE / 2, y + SIZE / 2 + 1)
    }
```

# --meaning--

- Text is centered both ways on the point it is drawn at.
- `letters` is what this row shows: the typed letters on the first row, nothing on the others.
- `letters[i]` is the `i`-th letter, or `undefined` when there is none, which counts as false.
- `toUpperCase()` shows the letter as a capital.

# --meaning-tr--

- `ctx.textAlign = 'center'` ve `ctx.textBaseline = 'middle'` → yazı verilen noktaya **yatayda ve dikeyde** ortalanır.
  Bir kez, döngülerden önce ayarlanır.
- `const letters = row === 0 ? current : ''` → bu satırda gösterilecek harfler: ilk satırda yazdıkların, diğerlerinde
  hiçbir şey (şimdilik).
- `letters[i]` → yazının `i`. harfi (yazılarda da köşeli parantez çalışır). Harf yoksa `undefined` gelir; `if` onu
  "yanlış" sayar.
- `letters[i] ? '#a1a1aa' : '#3f3f46'` → harf varsa açık gri çerçeve, yoksa koyu.
- `ctx.fillText(letters[i].toUpperCase(), x + SIZE / 2, y + SIZE / 2 + 1)` → harfi **büyük harfe** çevirip karenin
  ortasına yazar (+1 piksel: harfler göze biraz yukarıda durur).

# --task--

1. In `draw`, under the `fillRect` line, write the two text settings (no empty line between).
2. Under the `row` loop's first line, write `const letters ...`.
3. Change the `strokeStyle` line, and under `strokeRect` write the `if (letters[i])` block. Press **Run** and type.

# --task-tr--

1. `draw` içinde `ctx.fillRect(...)` satırının hemen altına (boş satır bırakmadan) iki yazı ayarını yaz.
2. `for (let row = 0; ...) {` satırının altına `const letters = ...` satırını yaz.
3. `ctx.strokeStyle = '#3f3f46'` satırını `ctx.strokeStyle = letters[i] ? '#a1a1aa' : '#3f3f46'` yap.
4. `strokeRect` satırının altına `if (letters[i]) { ... }` bloğunu yaz.
5. **Çalıştır**, oyuna tıkla ve yaz: harfler ilk satırda görünmeli.

# --tests--

The typed letters should be drawn in the first row, in capitals.
tr: Yazılan harfler ilk satıra büyük harfle çizilmeli.

```js
$.press('h')
$.press('i')
$.tick(1)
const texts = $.screen().filter((c) => c.op === 'fillText')
assert.deepEqual(texts.map((c) => c.args[0]), ['H', 'I'])
assert.deepEqual(texts.map((c) => [c.args[1], c.args[2]]), [[56, 41], [118, 41]])
```

Tiles with a letter should get a brighter outline.
tr: Harfi olan kareler daha parlak bir çerçeve almalı.

```js
$.press('h')
$.tick(1)
const boxes = $.screen().filter((c) => c.op === 'strokeRect')
assert.strictEqual(boxes[0].stroke, '#a1a1aa')
assert.strictEqual(boxes[1].stroke, '#3f3f46')
```

# --solution--

```js
// Word guessing game, step by step.
// The page already has <canvas id="game" width="360" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TRIES = 6
const SIZE = 56 // one letter tile
const GAP = 6
const LEFT = (canvas.width - 5 * SIZE - 4 * GAP) / 2
const TOP = 12

let current // the letters typed so far

function reset() {
  current = ''
}

function type(key) {
  if (current.length < 5) current += key
}

document.addEventListener('keydown', (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
  if (/^[a-z]$/.test(key)) {
    event.preventDefault()
    type(key)
  }
})

function draw() {
  ctx.fillStyle = '#18181b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let row = 0; row < TRIES; row++) {
    const letters = row === 0 ? current : ''
    for (let i = 0; i < 5; i++) {
      const x = LEFT + i * (SIZE + GAP)
      const y = TOP + row * (SIZE + GAP)
      ctx.strokeStyle = letters[i] ? '#a1a1aa' : '#3f3f46'
      ctx.lineWidth = 2
      ctx.strokeRect(x + 1, y + 1, SIZE - 2, SIZE - 2)
      if (letters[i]) {
        ctx.fillStyle = 'white'
        ctx.font = 'bold 28px sans-serif'
        ctx.fillText(letters[i].toUpperCase(), x + SIZE / 2, y + SIZE / 2 + 1)
      }
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```

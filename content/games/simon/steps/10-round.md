---
title: Show the round
title_tr: Turu göster
skills: [game.canvas]
---

# --goal--

In the top strip we write the round number: `Round 1`, `Round 2`... The round is the length of the sequence.

# --goal-tr--

Üstteki boş şeride yazı yazma zamanı. Sol üste tur numarasını yazacağız: `Round 1` (1. tur), `Round 2`... Tur
numarası dizinin uzunluğu: dizide kaç tuş varsa o kadar.

# --code--

```js
  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Round ' + sequence.length, 10, 27)
}
```

# --meaning--

- `ctx.font` sets the size and style; `textAlign = 'left'` makes x the left edge of the text.
- `'Round ' + sequence.length` glues text and a number: `'Round 1'`.
- `fillText(text, 10, 27)` writes it 10 pixels from the left, in the strip.

# --meaning-tr--

- `ctx.fillStyle = 'white'` → yazılar beyaz.
- `ctx.font = 'bold 18px sans-serif'` → kalın (**bold**), 18 piksel, sade yazı tipi.
- `ctx.textAlign = 'left'` → verilen x yazının **sol** kenarı olsun.
- `'Round ' + sequence.length` → yazılarda `+` toplamak değil **ucuna eklemek**: `'Round ' + 1` → `'Round 1'`.
- `ctx.fillText(yazı, 10, 27)` → yazıyı soldan 10, yukarıdan 27 piksele yaz: şeridin içi.
- Sondaki `}` yeni değil: `draw` fonksiyonunun kapanışı. Yeni satırlar onun **üstüne** gelir.

# --task--

In `draw`, after the `forEach` block's `})`, leave an empty line and write the four lines, above the function's last `}`.

# --task-tr--

1. `draw` içinde `PADS.forEach(...)` bloğunun kapanan `})` işaretinin altına bir boş satır bırak.
2. Dört satırı fonksiyonun son `}` işaretinin **üstüne** yaz.
3. **Çalıştır**: sol üstte `Round 1` yazmalı.

# --try--

Call `nextRound()` two more times at the bottom and run: `Round 3`. Delete them.

# --try-tr--

En alta iki `nextRound()` daha yazıp çalıştır: `Round 3`. Sonra ikisini sil.

# --tests--

The round number should be written at the top left.
tr: Tur numarası sol üste yazılmalı.

```js
$.tick(1)
const text = $.screen().find((c) => c.op === 'fillText')
assert.exists(text)
assert.deepEqual(text.args.slice(0, 3), ['Round 1', 10, 27])
assert.strictEqual(text.fill, 'white')
```

It should follow the length of the sequence.
tr: Dizinin uzunluğunu izlemeli.

```js
sequence = [0, 1, 2]
$.tick(1)
assert.include($.texts(), 'Round 3')
```

# --solution--

```js
// Simon memory game, step by step.
// The page already has <canvas id="game" width="400" height="440"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TOP = 40 // room for the score
const HALF = canvas.width / 2
// Each pad: its dim color and its lit color. Pads 0 1 on top, 2 3 below.
const PADS = [
  { dim: '#14532d', lit: '#4ade80' },
  { dim: '#7f1d1d', lit: '#f87171' },
  { dim: '#713f12', lit: '#facc15' },
  { dim: '#1e3a8a', lit: '#60a5fa' },
]

let sequence = [] // the pads to repeat, growing by one every round
let lit = -1 // the pad lit right now, or -1

function nextRound() {
  sequence.push(Math.floor(Math.random() * 4))
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  PADS.forEach((pad, i) => {
    const x = (i % 2) * HALF
    const y = TOP + Math.floor(i / 2) * HALF
    ctx.fillStyle = i === lit ? pad.lit : pad.dim
    ctx.fillRect(x + 6, y + 6, HALF - 12, HALF - 12)
  })

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Round ' + sequence.length, 10, 27)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

nextRound()
requestAnimationFrame(loop)
```

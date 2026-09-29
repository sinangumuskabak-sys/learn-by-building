---
title: Light a pad for a while
title_tr: Bir tuşu bir süre yak
skills: [prog.functions]
---

# --goal--

A pad is lit for a number of frames. `light(pad, frames)` sets which pad is lit (`lit`) and for how long (`litFor`).

# --goal-tr--

Bir tuş sonsuza kadar yanmaz; **bir süre** yanar ve söner. Süreyi **kare** sayısıyla ölçeceğiz: saniyede 60 kare
olduğuna göre 30 kare **yarım saniye** eder.

`light(pad, frames)` (yak) fonksiyonu iki şeyi birden ayarlar: hangi tuş yanıyor (`lit`) ve daha kaç kare yanacak
(`litFor`). Söndürmeyi bir sonraki adımda ekleyeceğiz.

# --code--

```js
let litFor = 0

function light(pad, frames) {
  lit = pad
  litFor = frames
}
```

# --meaning--

- `litFor` counts how many frames the lit pad stays lit.
- `light` takes two parameters: the pad number and the number of frames.

# --meaning-tr--

- `let litFor = 0` → yanan tuşun daha kaç kare yanık kalacağı. Başta 0.
- `function light(pad, frames)` → iki **parametre** alır: tuş numarası ve kare sayısı. `light(2, 30)` çağrısında `pad`
  2, `frames` 30 olur.
- `lit = pad` → o tuşu yak.
- `litFor = frames` → kaç kare yanacağını not al.

# --task--

1. Under `let lit`, write `let litFor = 0`.
2. Above `function draw`, write `light` and an empty line.

# --task-tr--

1. `let lit = -1 ...` satırının altına `let litFor = 0` yaz.
2. `function draw() {` satırının **üstüne** (`nextRound`'un altına) `light` fonksiyonunu yaz; aralarda boş satır kalsın.
3. **Çalıştır**.

# --try--

Write `light(0, 30)` above `nextRound()` at the bottom and run: the green pad shines and stays lit. We fix that next. Delete the line.

# --try-tr--

En alttaki `nextRound()` satırının üstüne `light(0, 30)` yazıp çalıştır: yeşil tuş yanar ve sönmez. Onu bir sonraki adımda düzelteceğiz. Sonra satırı sil.

# --tests--

`light(pad, frames)` should light the pad and remember for how long.
tr: `light(pad, frames)` tuşu yakmalı ve ne kadar süreceğini hatırlamalı.

```js
assert.strictEqual(litFor, 0)
light(2, 30)
assert.strictEqual(lit, 2)
assert.strictEqual(litFor, 30)
$.tick(1)
assert.lengthOf($.rects('#facc15'), 1)
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
let litFor = 0

function nextRound() {
  sequence.push(Math.floor(Math.random() * 4))
}

function light(pad, frames) {
  lit = pad
  litFor = frames
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

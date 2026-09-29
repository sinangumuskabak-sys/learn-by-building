---
title: Show the whole sequence
title_tr: Bütün diziyi göster
skills: [game.state, game.loop]
---

# --goal--

A `for` loop cannot show the sequence: it would run through it in a single frame. Instead `showAt` remembers which step
comes next, and `timer` spreads the steps over many frames. After the last step, it is the player's turn.

# --goal-tr--

Dizide birden çok tuş olunca hepsini **sırayla** göstermeliyiz. Bunu bir `for` döngüsüyle yapamayız: döngü bütün diziyi
**tek bir karede** bitirir, göz hiçbir şey görmez.

Bunun yerine gösteriyi **birçok kareye yayarız**: `showAt` sıradaki adımı hatırlar; her tuştan sonra zamanlayıcı yeniden
kurulur. Dizi bitince sıra oyuncuya geçer.

# --code--

```js
let showAt // which step of the sequence is being shown, and when

  showAt = 0

  if (showAt === sequence.length) {
    state = 'input'
    return
  }
  // Light the next pad, then wait a little longer than it stays lit, so repeats are two separate flashes.
  light(sequence[showAt], 30)
  showAt += 1
  timer = 30 + 8
```

# --meaning--

- `showAt` is the step of the sequence to show next; `nextRound` starts it at 0.
- When every step has been shown (`showAt === sequence.length`), it is the player's turn.
- Otherwise light `sequence[showAt]`, move on to the next step, and wait 38 frames.
- The wait is 8 frames longer than the light: if the same pad comes twice, it goes dark in between.

# --meaning-tr--

- `let showAt` → dizinin sıradaki **hangi adımının** gösterileceği. `nextRound` içinde `showAt = 0`: baştan başla.
- `if (showAt === sequence.length) {` → bütün adımlar gösterildiyse...
  - `state = 'input'` → ...sıra oyuncuda,
  - `return` → ...ve çık.
- `light(sequence[showAt], 30)` → sıradaki tuşu 30 kare yak. `sequence[showAt]` dizinin `showAt` numaralı elemanı.
- `showAt += 1` → bir sonraki adıma geç.
- `timer = 30 + 8` → bir sonraki tuşa kadar 38 kare bekle.
- Neden **+ 8**? Aynı tuş arka arkaya iki kez gelirse arada **sönmesi** gerekir; yoksa oyuncu iki yanış yerine tek uzun
  bir yanış görür.

# --task--

1. Under `let state`, write `let showAt`.
2. In `nextRound`, write `showAt = 0` under `state = 'showing'`.
3. In `update`, replace `light(sequence[0], 30)` and `state = 'input'` with the new lines.

# --task-tr--

1. `let state ...` satırının altına `let showAt ...` satırını yaz.
2. `nextRound` içinde `state = 'showing'` satırının altına `showAt = 0` yaz.
3. `update`'in sonundaki `light(sequence[0], 30)` ve `state = 'input'` satırlarını sil; yerine yeni satırları yaz.
4. **Çalıştır**. Uzun bir dizi görmek için en alttaki `nextRound()` satırını geçici olarak üç kez yaz. Sonra teke indir.

# --try--

Change `30 + 8` to `30` and play a sequence where a pad repeats: the two flashes melt into one. Put `30 + 8` back.

# --try-tr--

`30 + 8`'i `30` yap ve bir tuşun tekrar ettiği bir diziye bak: iki yanış tek yanışa dönüşür. Sonra `30 + 8`'e geri al.

# --tests--

The same pad twice should flash twice, with a dark moment in between.
tr: Aynı tuş iki kez gelirse arada bir karanlık anla iki kez yanmalı.

```js
sequence = [2, 2]
$.tick(40)
assert.strictEqual(lit, 2)
$.tick(34)
assert.strictEqual(lit, -1)
$.tick(6)
assert.strictEqual(lit, 2)
assert.strictEqual(state, 'showing')
```

After the last pad it should be the player's turn.
tr: Son tuştan sonra sıra oyuncuya geçmeli.

```js
sequence = [0, 3]
$.tick(115)
assert.strictEqual(state, 'showing')
$.tick(1)
assert.strictEqual(state, 'input')
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
let state // 'showing' or 'input'
let showAt // which step of the sequence is being shown, and when
let timer
let lit = -1 // the pad lit right now, or -1
let litFor = 0

function nextRound() {
  sequence.push(Math.floor(Math.random() * 4))
  state = 'showing'
  showAt = 0
  timer = 40 // a short pause before the sequence is shown
}

function light(pad, frames) {
  lit = pad
  litFor = frames
}

function update() {
  if (litFor > 0) {
    litFor -= 1
    if (litFor === 0) lit = -1
  }
  if (state !== 'showing') return
  timer -= 1
  if (timer > 0) return
  if (showAt === sequence.length) {
    state = 'input'
    return
  }
  // Light the next pad, then wait a little longer than it stays lit, so repeats are two separate flashes.
  light(sequence[showAt], 30)
  showAt += 1
  timer = 30 + 8
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
  update()
  draw()
  requestAnimationFrame(loop)
}

nextRound()
requestAnimationFrame(loop)
```

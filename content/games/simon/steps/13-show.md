---
title: The computer shows a pad
title_tr: Bilgisayar bir tuş gösterir
skills: [game.state, game.loop]
---

# --goal--

The game has two phases: the computer is `'showing'` the sequence, or it waits for the player's `'input'`. After a
short pause (`timer`), the computer lights the first pad for 30 frames and hands the turn to the player.

# --goal-tr--

Oyun iki **aşamadan** birindedir: bilgisayar diziyi **gösteriyordur** (`'showing'`) ya da oyuncunun **cevabını**
bekliyordur (`'input'`). Hangisinde olduğumuzu tek bir değişken söyler: `state`.

Tur başlayınca kısa bir **bekleme** olur (40 kare), sonra bilgisayar ilk tuşu 30 kare yakar ve sırayı oyuncuya verir.
Beklemeyi de bir geri sayımla yaparız: `timer`.

# --code--

```js
let state // 'showing' or 'input'
let timer

  state = 'showing'
  timer = 40 // a short pause before the sequence is shown

  if (state !== 'showing') return
  timer -= 1
  if (timer > 0) return
  light(sequence[0], 30)
  state = 'input'
```

# --meaning--

- `nextRound` starts the show: state `'showing'`, a 40 frame pause.
- In `update`: if we are not showing, stop here. Otherwise count `timer` down; while time is left, stop here.
- When the pause is over: light the first pad of the sequence for 30 frames, and it is the player's turn.

# --meaning-tr--

- `let state`, `let timer` → değer vermeden tanıtıyoruz; değerlerini `nextRound` veriyor.
- `nextRound` içinde `state = 'showing'` → gösteri başlasın. `timer = 40` → önce 40 karelik kısa bir bekleme.
- `update` içinde:
  - `if (state !== 'showing') return` → `!==` "eşit **değil** mi?". Gösteri yapmıyorsak `return` ile **hemen çık**;
    aşağısı çalışmaz.
  - `timer -= 1` → zamanlayıcıyı bir azalt.
  - `if (timer > 0) return` → daha zaman varsa çık, bir sonraki karede yine bak.
  - `light(sequence[0], 30)` → dizinin **ilk** tuşunu 30 kare yak.
  - `state = 'input'` → sıra oyuncuda.
- `litFor` bölümü `if (state ...)` satırının **üstünde** kalmalı: tuş, gösteri bitince de sönebilsin.

# --task--

1. Under `let sequence`, write `let state` and `let timer`.
2. In `nextRound`, under `push`, set `state` and `timer`.
3. At the end of `update`, under the `litFor` block, write the five new lines.

# --task-tr--

1. `let sequence = [] ...` satırının altına `let state ...` ve `let timer` satırlarını yaz.
2. `nextRound` içinde `sequence.push(...)` satırının altına `state` ve `timer` satırlarını yaz.
3. `update` içinde, `litFor` bloğunun kapanan `}` işaretinin **altına** (fonksiyonun son `}` işaretinden önce) beş yeni
   satırı yaz.
4. **Çalıştır**: kısa bir beklemeden sonra bir tuş yarım saniye yanıp sönmeli.

# --predict--

The pause is 40 frames. About how long do you wait before the pad lights up?
- [ ] 40 seconds
- [x] Two thirds of a second
  The loop runs about 60 frames a second: 40 frames is about 0.67 seconds.
- [ ] No wait at all

# --predict-tr--

Bekleme 40 kare. Tuş yanmadan önce yaklaşık ne kadar beklersin?
- [ ] 40 saniye
- [x] Üçte iki saniye kadar
  Döngü saniyede yaklaşık 60 kare döner: 40 kare 0,67 saniye eder.
- [ ] Hiç beklemezsin

# --tests--

After a pause of 40 frames the first pad should light up for 30 frames.
tr: 40 karelik beklemeden sonra ilk tuş 30 kare yanmalı.

```js
assert.strictEqual(state, 'showing')
$.tick(39)
assert.strictEqual(lit, -1)
$.tick(1)
assert.strictEqual(lit, sequence[0])
$.tick(29)
assert.strictEqual(lit, sequence[0])
$.tick(1)
assert.strictEqual(lit, -1)
```

Then it should be the player's turn.
tr: Sonra sıra oyuncuya geçmeli.

```js
$.tick(40)
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
let timer
let lit = -1 // the pad lit right now, or -1
let litFor = 0

function nextRound() {
  sequence.push(Math.floor(Math.random() * 4))
  state = 'showing'
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
  light(sequence[0], 30)
  state = 'input'
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

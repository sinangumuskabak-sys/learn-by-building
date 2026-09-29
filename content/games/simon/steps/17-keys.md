---
title: Play with the keyboard
title_tr: Klavyeyle oyna
skills: [game.input]
---

# --goal--

Q W on the top row and A S below mirror the pads; 1 to 4 work too. A lookup table, `KEYS`, turns a key name into a pad
number, and a `keydown` listener presses that pad.

# --goal-tr--

Klavyeyle oynayabilelim: **Q W** üst sırada, **A S** alt sırada, tıpkı tuşların dizilişi gibi. **1–4** de çalışsın.

Tuş adından tuş numarasına bir **arama tablosu** kullanacağız: bir sözlük gibi, "q'nun karşılığı 0". Tarayıcıya da "bir
tuşa basılınca bana haber ver" diyeceğiz. Buna **olay dinlemek** (event listener) denir: kapı zili gibi.

# --code--

```js
const KEYS = { q: 0, w: 1, a: 2, s: 3, 1: 0, 2: 1, 3: 2, 4: 3 }

document.addEventListener('keydown', (event) => {
  if (event.repeat) return
  if (event.key in KEYS) press(KEYS[event.key])
})
```

# --meaning--

- `KEYS` is an object used as a lookup table: key name → pad number.
- `keydown` fires when a key goes down; `event.key` is its name, like `'w'`.
- A held key sends many `keydown`s with `event.repeat` true; we ignore those.
- `event.key in KEYS` asks whether the table has that key; `KEYS[event.key]` reads its pad number.

# --meaning-tr--

- `const KEYS = { q: 0, w: 1, ... }` → bir **nesne**, ama bu sefer arama tablosu olarak: sol taraf tuşun adı, sağ
  taraf tuş numarası.
- `document.addEventListener('keydown', (event) => { ... })` → "sayfada bir tuşa **basıldığında** içini çalıştır".
  `event` basılan tuşun bilgilerini taşır.
- `if (event.repeat) return` → tuş **basılı tutulunca** tarayıcı tekrar tekrar `keydown` gönderir; `event.repeat`
  bunlarda doğrudur. Onları yok sayarız, yoksa tek basış birkaç basış sayılırdı.
- `event.key in KEYS` → "bu tuş adı tabloda **var mı**?" Boşluk ya da ok tuşları tabloda yok; onlar bir şey yapmaz.
- `KEYS[event.key]` → **köşeli parantezle** okuma: adı bir değişkende duran alanı okur. `'w'` basıldıysa `KEYS['w']`
  = **1**.

# --task--

1. Under `PADS`, write `KEYS`.
2. Under `press`, leave an empty line and write the `keydown` listener.

# --task-tr--

1. `PADS` listesinin kapanan `]` işaretinin hemen altına `KEYS` satırını yaz.
2. `press` fonksiyonunun altına bir boş satır bırak ve `keydown` dinleyicisini yaz.
3. **Çalıştır**, oyuna bir kez tıkla (klavye oyuna gitsin), gösteriyi izle ve Q, W, A ya da S ile tekrarla.

# --hint--

Letters are lowercase in `KEYS`: `q`, `w`, `a`, `s`.

# --hint-tr--

`KEYS` içindeki harfler küçük: `q`, `w`, `a`, `s`. Numaralar da tırnaksız yazılabilir.

# --tests--

The keys should press the matching pads.
tr: Tuşlar karşılık gelen tuşlara basmalı.

```js
sequence = [1]
$.tick(78)
$.press('w')
assert.lengthOf(sequence, 2)
assert.strictEqual(KEYS.s, 3)
assert.strictEqual(KEYS[4], 3)
```

Held-down repeats and other keys should be ignored.
tr: Basılı tutma tekrarları ve başka tuşlar yok sayılmalı.

```js
sequence = [2]
$.tick(78)
$.press('ArrowUp')
$.press('q', { repeat: true })
assert.strictEqual(state, 'input')
$.press('a')
assert.lengthOf(sequence, 2)
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
const KEYS = { q: 0, w: 1, a: 2, s: 3, 1: 0, 2: 1, 3: 2, 4: 3 }

let sequence = [] // the pads to repeat, growing by one every round
let state // 'showing', 'input' or 'over'
let showAt // which step of the sequence is being shown, and when
let timer
let inputAt // how many pads of the sequence the player has repeated
let lit = -1 // the pad lit right now, or -1
let litFor = 0

function nextRound() {
  sequence.push(Math.floor(Math.random() * 4))
  state = 'showing'
  showAt = 0
  timer = 40 // a short pause before the sequence is shown
  inputAt = 0
}

function light(pad, frames) {
  lit = pad
  litFor = frames
}

function press(pad) {
  if (state !== 'input') return
  if (pad !== sequence[inputAt]) {
    state = 'over'
    return
  }
  inputAt += 1
  if (inputAt === sequence.length) nextRound()
}

document.addEventListener('keydown', (event) => {
  if (event.repeat) return
  if (event.key in KEYS) press(KEYS[event.key])
})

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
  ctx.textAlign = 'right'
  ctx.fillText(state === 'showing' ? 'Watch...' : 'Your turn', canvas.width - 10, 27)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

nextRound()
requestAnimationFrame(loop)
```

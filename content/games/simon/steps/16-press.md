---
title: Check each press
title_tr: Her basışı kontrol et
skills: [game.state, prog.functions]
---

# --goal--

Now the player repeats the sequence. `inputAt` counts how far they have got, and every press is checked against that
one step: a wrong pad ends the game (`'over'`), a right one moves on, and after the last step the next round starts.

# --goal-tr--

Sıra oyuncuda. `inputAt`, oyuncunun dizinin **kaçıncı adımında** olduğunu sayar. Her basış dizinin **tek bir adımıyla**
karşılaştırılır:

- yanlış tuş → oyun biter (`'over'`),
- doğru tuş → bir sonraki adıma geç; son adımdıysa **yeni tur** (dizi bir uzar, gösteri yeniden başlar).

Cevabın tamamını beklemek yerine her basışı hemen kontrol etmek, hatanın turu anında bitirmesini sağlar. Bu adımda
`press` fonksiyonunu yazıyoruz; tıklamaya ve klavyeye sonra bağlayacağız.

# --code--

```js
let inputAt // how many pads of the sequence the player has repeated

  inputAt = 0

function press(pad) {
  if (state !== 'input') return
  if (pad !== sequence[inputAt]) {
    state = 'over'
    return
  }
  inputAt += 1
  if (inputAt === sequence.length) nextRound()
}
```

# --meaning--

- Presses only count in the player's turn.
- `sequence[inputAt]` is the pad expected now. A different pad ends the game.
- A right pad adds 1 to `inputAt`; when it equals the length, the whole sequence was repeated: `nextRound()` adds a pad
  and starts a new show (and sets `inputAt` back to 0).

# --meaning-tr--

- `let inputAt` → oyuncunun kaç tuşu doğru tekrarladığı. `nextRound` içinde `inputAt = 0`: her tur baştan.
- `let state` yorumunda artık üçüncü aşama da var: `'over'` (bitti).
- `function press(pad)` → oyuncu `pad` numaralı tuşa bastı.
- `if (state !== 'input') return` → sıra oyuncuda değilse basış sayılmaz: gösteri sırasında tıklamalar yok sayılır.
- `if (pad !== sequence[inputAt]) {` → basılan tuş, beklenen tuş (`sequence[inputAt]`) **değilse**:
  - `state = 'over'` → oyun biter, `return` → çık.
- `inputAt += 1` → doğru! Bir sonraki adıma geç.
- `if (inputAt === sequence.length) nextRound()` → dizinin sonuna geldiysen yeni tur.
- Aynı basış, oyunun aşamasına göre farklı anlama gelir. Aşamayı tek değişkende tutan bu düzene **durum makinesi**
  (state machine) denir.

# --task--

1. Change the comment of `let state` to include `'over'`, and under `let timer` write `let inputAt`.
2. At the end of `nextRound`, write `inputAt = 0`.
3. Under `light`, leave an empty line and write `press`.

# --task-tr--

1. `let state` satırının yorumunu `// 'showing', 'input' or 'over'` yap (yorum olduğu için kontrolleri etkilemez).
2. `let timer` satırının altına `let inputAt ...` satırını yaz.
3. `nextRound`'un son satırı olarak `inputAt = 0` yaz.
4. `light` fonksiyonunun altına bir boş satır bırak ve `press` fonksiyonunu yaz.
5. **Çalıştır**. Henüz basamazsın; kontroller `press`'i doğrudan deneyecek.

# --hint--

Check the order in `press`: first the state check, then the wrong-pad check, then `inputAt += 1`.

# --hint-tr--

`press` içinde sıra önemli: önce aşama kontrolü, sonra yanlış tuş kontrolü, en son `inputAt += 1`.

# --tests--

Repeating the sequence correctly should start a longer one.
tr: Diziyi doğru tekrarlamak daha uzun birini başlatmalı.

```js
$.tick(78)
assert.strictEqual(state, 'input')
const first = sequence[0]
press(first)
assert.lengthOf(sequence, 2)
assert.strictEqual(sequence[0], first, 'the old sequence stays, one pad is added')
assert.deepEqual([state, inputAt], ['showing', 0])
```

Each press should be checked against the next step.
tr: Her basış sıradaki adımla karşılaştırılmalı.

```js
sequence = [1, 2, 3]
state = 'input'
inputAt = 0
press(1)
press(2)
assert.deepEqual([state, inputAt], ['input', 2])
press(1)
assert.strictEqual(state, 'over')
```

Presses during the show should be ignored.
tr: Gösteri sırasındaki basışlar yok sayılmalı.

```js
press(0)
press(1)
assert.strictEqual(state, 'showing')
assert.lengthOf(sequence, 1)
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

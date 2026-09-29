---
title: The sequence to remember
title_tr: Hatırlanacak dizi
skills: [prog.arrays]
---

# --goal--

The sequence is the list of pads the player must repeat. It starts empty; every round `nextRound` adds one random pad
(0 to 3) to its end.

# --goal-tr--

Oyunun kalbi **dizi**: oyuncunun tekrarlaması gereken tuşların listesi, örneğin `[2, 0, 3]` (sarı, yeşil, mavi).

Liste boş başlar. Her yeni turda `nextRound` (sonraki tur) fonksiyonu listenin **sonuna rastgele bir tuş** ekler.
Eskiler yerinde kalır; dizi her turda bir uzar. İlk tur için onu bir kez çağırıyoruz. Ekranda henüz bir şey değişmeyecek.

# --code--

```js
let sequence = [] // the pads to repeat, growing by one every round

function nextRound() {
  sequence.push(Math.floor(Math.random() * 4))
}

nextRound()
requestAnimationFrame(loop)
```

# --meaning--

- `[]` is an empty array; `push` adds an item to its end.
- `Math.random()` is a random number from 0 up to 1; times 4, rounded down, it is 0, 1, 2 or 3: a random pad.
- `nextRound()` at the bottom adds the first pad before the loop starts.

# --meaning-tr--

- `let sequence = []` → `[]` **boş bir dizi**.
- `Math.random()` → 0 ile 1 arasında (1 hariç) rastgele bir sayı: 0.73 gibi.
- `Math.random() * 4` → 0 ile 3.99 arası. `Math.floor(...)` aşağı yuvarlar: **0, 1, 2 ya da 3**. Yani rastgele bir
  tuş numarası.
- `sequence.push(...)` → `push` bir elemanı dizinin **sonuna ekler**. Eski elemanlar yerinde kalır.
- `sequence.length` → dizinin eleman sayısı. Bu, aynı zamanda **tur numarası**.
- En alttaki `nextRound()` → döngü başlamadan ilk tuşu ekler: 1. tur.

# --task--

1. Above `let lit`, write the `sequence` line.
2. Above `function draw`, write `nextRound` and an empty line.
3. At the very bottom, write `nextRound()` above `requestAnimationFrame(loop)`.

# --task-tr--

1. `let lit = -1 ...` satırının **üstüne** `sequence` satırını yaz.
2. `function draw() {` satırının **üstüne** `nextRound` fonksiyonunu yaz; arada bir boş satır kalsın.
3. Dosyanın **en altında**, `requestAnimationFrame(loop)` satırının üstüne `nextRound()` yaz.
4. **Çalıştır**: ekran aynı; kontroller diziye bakacak.

# --hint--

`Math.floor(Math.random() * 4)`: multiply first, then round down, so you get 0 to 3.

# --hint-tr--

`Math.floor(Math.random() * 4)`: önce çarp, sonra aşağı yuvarla; böylece 0–3 arası bir sayı çıkar.

# --tests--

The game should start with one random pad in the sequence.
tr: Oyun dizide rastgele tek bir tuşla başlamalı.

```js
assert.lengthOf(sequence, 1)
assert.include([0, 1, 2, 3], sequence[0])
```

`nextRound()` should add one random pad and keep the old ones.
tr: `nextRound()` rastgele bir tuş eklemeli ve eskileri korumalı.

```js
sequence = [3, 1]
nextRound()
assert.lengthOf(sequence, 3)
assert.deepEqual(sequence.slice(0, 2), [3, 1])
for (let i = 0; i < 40; i++) nextRound()
assert.sameMembers([...new Set(sequence)], [0, 1, 2, 3], 'every pad should come up sometimes')
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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

nextRound()
requestAnimationFrame(loop)
```

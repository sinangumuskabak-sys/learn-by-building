---
title: The longest sequence
title_tr: En uzun dizi
skills: [game.state]
---

# --explanation--

The score in Simon is how long a sequence you could repeat. When you fail in round 5, you had repeated round 4 correctly,
so the score is `sequence.length - 1`. Small off-by-one details like this are worth thinking through: the round you lost
does not count.

Save the best score in `localStorage` and show it when the game ends, so there is always a number to beat.

That completes Simon: a little show driven by timers, turns between computer and player, checking each answer as it comes,
feedback on every press and a game that speeds up.

# --explanation-tr--

**Bu adımda:** en iyi skoru kaydedeceğiz. Yanlış basınca üstte, ör. `Wrong! Best 4. Click to retry` yazacak:
şimdiye kadar tekrarladığın en uzun dizi. Sayfayı yenilesen de bu sayı kalacak.

**Skor ne?** Simon'da skor, tekrarlayabildiğin en uzun dizinin uzunluğudur. 5. turda hata yaptıysan 4. turu doğru
tekrarlamışsındır; skor `sequence.length - 1` olur. Bu tür "bir fazla, bir eksik" ayrıntıları üzerine düşünmeye
değer: kaybettiğin tur sayılmaz.

**Sayfa yenilense de kalan bilgi: `localStorage`.** Değişkenler sayfa kapanınca silinir. Tarayıcının her site
için tuttuğu küçük bir defter vardır: `localStorage`. İçine bir **ad** ile bir değer yazarsın, sonra aynı adla
okursun.

```js
localStorage.setItem('simon-best', best)                   // "simon-best" adıyla kaydet
Number(localStorage.getItem('simon-best')) || 0            // oku; hiç kayıt yoksa 0
```

Bunu parça parça okuyalım:

- `setItem(ad, değer)` → deftere yaz. Defter her şeyi **yazı** olarak saklar (`4` → `'4'`).
- `getItem(ad)` → defterden oku. Hiç kayıt yoksa boş (`null`) gelir.
- `Number(...)` → yazıyı sayıya çevirir: `'4'` → `4`.
- `|| 0` → "soldaki boşsa ya da sıfırsa 0 kullan": bir yedek değer.

Oyun bitince skor en iyiden **büyükse** (`>`) en iyiyi güncelleyip deftere yazarız. Böylece hep yenilecek bir sayı
olur.

İşte Simon tamam: sayaçlarla yönetilen küçük bir gösteri, bilgisayar ile oyuncu arasında sıra, her cevabı geldiği
anda kontrol etmek, her basışta geri bildirim ve hızlanan bir oyun.

# --task--

1. Add `best` from `localStorage` `'simon-best'`.
2. When the game is lost, the score is `sequence.length - 1`; if it beats `best`, save it.
3. The message when over becomes `Wrong! Best 4. Click to retry`.

# --task-tr--

1. `let litFor` satırının hemen altına en iyi skoru ekle:

   ```js
   let best = Number(localStorage.getItem('simon-best')) || 0
   ```

2. `press()` fonksiyonunda, yanlış basış bölümüne skoru hesaplayıp kaydeden satırları ekle:

   ```js
     if (pad !== sequence[inputAt]) {
       state = 'over'
       const score = sequence.length - 1 // ← yeni
       if (score > best) { // ← yeni
         best = score // ← yeni
         localStorage.setItem('simon-best', best) // ← yeni
       } // ← yeni
       return
     }
   ```

3. `draw()` fonksiyonunda oyun sonu mesajını değiştir:

   ```js
     if (state === 'over') message = 'Wrong! Best ' + best + '. Click to retry' // ← değişti
   ```

   Boşluklara ve noktaya dikkat: sonuç `Wrong! Best 4. Click to retry` gibi görünmeli.

4. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Birkaç tur oyna ve bilerek yanlış bas: üstte en iyi skorun
   görünmeli. Alttaki kontrollerin hepsi yeşil olmalı. Mesaj kontrolü kırmızıysa yazıyı harf harf karşılaştır.

Tebrikler, Simon oyunun bitti!

# --tests--

Failing in round 5 should record 4.
tr: 5. turda başarısız olmak 4 kaydetmeli.

```js
sequence = [0, 1, 2, 3, 0]
$.tick(400)
assert.strictEqual(state, 'input')
press(3)
assert.strictEqual(state, 'over')
assert.strictEqual(best, 4)
assert.strictEqual(localStorage.getItem('simon-best'), '4')
$.tick(1)
assert.include($.texts(), 'Wrong! Best 4. Click to retry')
```

A shorter game should not lower the best.
tr: Daha kısa bir oyun en iyiyi düşürmemeli.

```js
best = 7
$.tick(100)
press((sequence[0] + 1) % 4)
assert.strictEqual(state, 'over')
assert.strictEqual(best, 7)
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
const PRESS_FRAMES = 12 // how long a pad the player pressed stays lit

let sequence // the pads to repeat, growing by one every round
let state // 'showing', 'input' or 'over'
let showAt // which step of the sequence is being shown, and when
let timer
let inputAt // how many pads of the sequence the player has repeated
let lit // the pad lit right now, or -1
let litFor
let best = Number(localStorage.getItem('simon-best')) || 0

function reset() {
  sequence = []
  lit = -1
  litFor = 0
  nextRound()
}

function nextRound() {
  sequence.push(Math.floor(Math.random() * 4))
  state = 'showing'
  showAt = 0
  timer = 40 // a short pause before the sequence is shown
  inputAt = 0
}

// Longer sequences are shown faster, down to a limit.
function showFrames() {
  return Math.max(12, 30 - sequence.length * 2)
}

function light(pad, frames) {
  lit = pad
  litFor = frames
}

function press(pad) {
  if (state !== 'input') return
  light(pad, PRESS_FRAMES)
  if (pad !== sequence[inputAt]) {
    state = 'over'
    const score = sequence.length - 1
    if (score > best) {
      best = score
      localStorage.setItem('simon-best', best)
    }
    return
  }
  inputAt += 1
  if (inputAt === sequence.length) nextRound()
}

function padAt(x, y) {
  if (y < TOP) return -1
  return (y - TOP < HALF ? 0 : 2) + (x < HALF ? 0 : 1)
}

canvas.addEventListener('pointerdown', (event) => {
  if (state === 'over') {
    reset()
    return
  }
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  const pad = padAt(x, y)
  if (pad >= 0) press(pad)
})
document.addEventListener('keydown', (event) => {
  if (event.repeat) return
  if (event.key in KEYS) press(KEYS[event.key])
  if (event.key === ' ' && state === 'over') {
    event.preventDefault()
    reset()
  }
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
  light(sequence[showAt], showFrames())
  showAt += 1
  timer = showFrames() + 8
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
  let message = state === 'showing' ? 'Watch...' : 'Your turn: ' + inputAt + '/' + sequence.length
  if (state === 'over') message = 'Wrong! Best ' + best + '. Click to retry'
  ctx.fillText(message, canvas.width - 10, 27)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```

---
title: Showing the sequence
title_tr: Diziyi göstermek
skills: [game.loop, game.state]
---

# --explanation--

The computer has to **play a little show**: light the first pad for half a second, pause, light the next, and so on. A
`for` loop cannot do this, because it would run through the whole sequence in one frame. Instead, the show is spread over
many frames with counters:

- `timer` counts down to the next event,
- `showAt` says which step of the sequence comes next,
- `litFor` counts down how long the current pad stays lit.

Each frame, `update()` counts down; when `timer` reaches zero it lights the next pad and sets `timer` again. When every step
has been shown, the state changes from `'showing'` to `'input'`: the player's turn.

Why wait `SHOW_FRAMES + 8` between pads instead of exactly `SHOW_FRAMES`? If the same pad comes twice in a row, it must
go dark in between, or the player would see one long flash instead of two.

# --explanation-tr--

**Bu adımda:** bilgisayar diziyi göstermeye başlayacak. Çalıştırınca kısa bir beklemeden sonra rastgele bir tuş
yarım saniye kadar parlayıp sönecek. Üstte solda `Round 1` (1. tur), sağda önce `Watch...` (izle), sonra
`Your turn` (sıra sende) yazacak.

**Küçük bir gösteri.** Bilgisayar bir gösteri yapmalı: ilk tuşu yarım saniye yak, dur, sonrakini yak... Bunu
bir `for` döngüsüyle yapamayız, çünkü döngü bütün diziyi tek bir karede (ekranın bir kez çizildiği anda) bitirir,
göz hiçbir şey görmez. Bunun yerine gösteriyi **sayaçlarla** birçok kareye yayarız. Döngümüz saniyede yaklaşık
60 kez çalışıyor, yani 30 kare yarım saniye eder.

- `timer` → bir sonraki olaya kaç kare kaldığını geri sayar.
- `showAt` → dizinin sıradaki hangi adımının gösterileceğini tutar.
- `litFor` → yanan tuşun daha kaç kare yanık kalacağını geri sayar.

Mutfak zamanlayıcısı gibi: her karede bir azalır, sıfıra inince bir şey olur.

**Oyunun hâli (`state`).** Oyun ya gösteri yapıyor (`'showing'`) ya da oyuncuyu bekliyor (`'input'`). Bunu bir
yazıyla tutarız. Bütün dizi gösterilince hâl `'showing'`'den `'input'`'a geçer: sıra oyuncuda.

**Diziye rastgele tuş eklemek.**

```js
sequence.push(Math.floor(Math.random() * 4))
```

- `Math.random()` 0 ile 1 arasında (1 hariç) rastgele bir sayı verir; `* 4` ile 0–3.99 olur; `Math.floor` aşağı
  yuvarlar: 0, 1, 2 ya da 3. Yani rastgele bir tuş numarası.
- `dizi.push(x)` → `x`'i dizinin **sonuna ekler**. `sequence.length` dizinin eleman sayısıdır; bu da tur
  numarasıdır.

**Yeni kısaltmalar ve kalıplar.**

- `litFor -= 1` → "`litFor`'dan 1 çıkar" (`litFor = litFor - 1`'in kısası). `showAt += 1` ise 1 ekler.
- `>` büyüktür, `!==` "eşit değil mi?" demektir.
- `if (...) return` → "koşul doğruysa fonksiyondan hemen çık, aşağıyı yapma". Örneğin
  `if (state !== 'showing') return` = "gösteri yapmıyorsak geri kalan gösteri kodunu atla".

**Neden `SHOW_FRAMES + 8`?** Bir tuş 30 kare yanar ama bir sonrakine kadar 38 kare bekleriz. Aynı tuş arka arkaya
iki kez gelirse arada **sönmesi** gerekir; yoksa oyuncu iki yanış yerine tek uzun bir yanış görür.

**Yeni oyun ve yeni tur.** `reset()` her şeyi baştan kurar (boş dizi, ışık kapalı) ve `nextRound()`'u çağırır.
`nextRound()` diziye bir tuş ekler ve gösteriyi başlatır. Bu yüzden dosyanın üstünde değişkenler artık **değersiz**
tanıtılır (`let sequence`); değerlerini bu fonksiyonlar verir. `lit` de böyle: değerini (`-1`) artık `reset()`
veriyor.

**Yazı.** `ctx.font` yazı tipini, `ctx.textAlign` hizalamayı seçer: `'left'` ise verilen `x` yazının solu,
`'right'` ise sağı olur. `ctx.fillText(yazı, x, y)` yazıyı boyar. `'Round ' + sequence.length` → `+` yazıyla
sayıyı yan yana yapıştırır: `'Round 1'`.

# --task--

1. Add `SHOW_FRAMES = 30`, and `sequence`, `state`, `showAt`, `timer` and `litFor`.
2. `reset()` empties the sequence, turns the light off and calls `nextRound()`, which adds a random pad (0 to 3), sets state
   `'showing'`, `showAt = 0` and `timer = 40`.
3. `light(pad, frames)` sets `lit` and `litFor`.
4. `update()`: count `litFor` down and turn the light off when it reaches 0. While showing, count `timer` down; at 0, if the
   whole sequence has been shown, switch to `'input'`; otherwise light the next pad for `SHOW_FRAMES` and set
   `timer = SHOW_FRAMES + 8`.
5. Draw `Round 1` at the top left and `Watch...` or `Your turn` at the top right (white, `'bold 18px sans-serif'`, `y = 27`).

# --task-tr--

1. `PADS` listesinin kapanan `]` işaretinin altına gösteri süresini ekle:

   ```js
   const SHOW_FRAMES = 30 // how long each pad of the sequence stays lit
   ```

2. `let lit = -1 // the pad lit right now, or -1` satırını sil ve yerine şu değişkenleri yaz (araya bir boş
   satır bırak):

   ```js
   let sequence // the pads to repeat, growing by one every round
   let state // 'showing' or 'input'
   let showAt // which step of the sequence is being shown, and when
   let timer
   let lit // the pad lit right now, or -1
   let litFor
   ```

3. Bunların altına bir boş satır bırak ve dört fonksiyonu yaz (`function draw()`'dan önce):

   ```js
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
     light(sequence[showAt], SHOW_FRAMES)
     showAt += 1
     timer = SHOW_FRAMES + 8
   }
   ```

   `update()`'i yukarıdan aşağı oku: önce yanan tuşun süresini azalt; gösteri yoksa çık; zamanlayıcıyı azalt,
   daha zaman varsa çık; dizi bittiyse sırayı oyuncuya ver; bitmediyse sıradaki tuşu yak.

4. `draw()` fonksiyonunda, `PADS.forEach(...)` bloğunun kapanan `})` işaretinden sonra, fonksiyonun son `}`
   işaretinden **önce** üst yazıları ekle:

   ```js
     ctx.fillStyle = 'white'
     ctx.font = 'bold 18px sans-serif'
     ctx.textAlign = 'left'
     ctx.fillText('Round ' + sequence.length, 10, 27)
     ctx.textAlign = 'right'
     ctx.fillText(state === 'showing' ? 'Watch...' : 'Your turn', canvas.width - 10, 27)
   ```

5. `loop()` fonksiyonunda çizimden önce güncelle, ve en alttaki başlatma satırının üstüne `reset()` ekle:

   ```js
   function loop() {
     update() // ← yeni
     draw()
     requestAnimationFrame(loop)
   }

   reset() // ← yeni
   requestAnimationFrame(loop)
   ```

6. **Çalıştır**'a bas. Kısa bir süre sonra bir tuş parlayıp sönmeli, üstte `Round 1` ve önce `Watch...`, sonra
   `Your turn` yazmalı. Alttaki kontrollerin hepsi yeşil olmalı. Tuş hiç yanmıyorsa `loop()` içindeki `update()`
   çağrısını ya da en alttaki `reset()` çağrısını kontrol et.

# --tests--

After a short pause the pad should light up for 30 frames, then it is the player's turn.
tr: Kısa bir duraklamadan sonra tuş 30 kare yanmalı, sonra sıra oyuncuya geçmeli.

```js
assert.lengthOf(sequence, 1)
assert.include([0, 1, 2, 3], sequence[0])
$.tick(39)
assert.strictEqual(lit, -1)
$.tick(1)
assert.strictEqual(lit, sequence[0])
$.tick(29)
assert.strictEqual(lit, sequence[0])
$.tick(1)
assert.strictEqual(lit, -1)
assert.strictEqual(state, 'showing')
$.tick(8)
assert.strictEqual(state, 'input')
assert.include($.texts(), 'Your turn')
```

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
assert.include($.texts(), 'Round 2')
assert.include($.texts(), 'Watch...')
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
const SHOW_FRAMES = 30 // how long each pad of the sequence stays lit

let sequence // the pads to repeat, growing by one every round
let state // 'showing' or 'input'
let showAt // which step of the sequence is being shown, and when
let timer
let lit // the pad lit right now, or -1
let litFor

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
  light(sequence[showAt], SHOW_FRAMES)
  showAt += 1
  timer = SHOW_FRAMES + 8
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

reset()
requestAnimationFrame(loop)
```

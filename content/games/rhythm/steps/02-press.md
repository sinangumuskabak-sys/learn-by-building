---
title: Hitting a note
title_tr: Bir notaya vurmak
skills: [game.input, game.state]
---

# --explanation--

Nobody presses at exactly the right frame, so a hit needs a **window**: a press counts if the note's time is within `WINDOW`
frames of now, a little early or a little late.

Which note does a press hit? The **closest** one in that lane that has not been hit yet. If even the closest is outside the window,
the press was too early (or too late) and nothing happens: the note is still there, waiting.

```js
const off = Math.abs(closest.time - frame)
if (off > WINDOW) return
```

A detail that matters a lot here: when you hold a key down, the computer repeats the `keydown` event many times a second. In most
games that is useful, but in a rhythm game one press must be one hit, so repeated events (`event.repeat` is true) are ignored.

The keys are D, F, J and K, where your fingers rest on a keyboard, or the four arrows. A pressed lane lights up for a moment, and a
short message shows what happened.

# --explanation-tr--

**Bu adımda:** notalara tuşla vuracağız. `D`, `F`, `J`, `K` (ya da dört ok tuşu) dört şeride karşılık gelir. Nota
çizgiye geldiğinde doğru tuşa basarsan nota kaybolur, ortada sarı "Hit" yazısı çıkar, basılan şerit bir an aydınlanır
ve sol üstte `Hits 1` gibi bir sayaç artar.

**Tuşu şeride çevirmek.** Hangi tuşun hangi şeride gittiğini bir **nesnede** tutarız:

```js
const KEYS = { d: 0, f: 1, j: 2, k: 3, ArrowLeft: 0, ArrowDown: 1, ArrowUp: 2, ArrowRight: 3 }
```

`KEYS['j']` → 2. Olmayan bir tuş sorulursa sonuç `undefined` ("tanımsız", yani yok) olur.

**Tuşa basılınca: olay (event).** Tarayıcı bir tuşa basıldığında `keydown` **olayı** gönderir. `addEventListener` ile
"bu olay olunca şu fonksiyonu çalıştır" deriz. Fonksiyona olayın bilgileri `event` adıyla gelir; `event.key` basılan
tuşun adıdır (`'d'`, `'ArrowUp'`).

**Zamanlama penceresi.** Kimse tam doğru karede basamaz. Bu yüzden notanın zamanına `WINDOW` (9) kare kadar yakın her
basış sayılır, biraz erken ya da biraz geç. Uzaklığı `Math.abs` ile ölçeriz (işaretsiz değer: `Math.abs(-3)` → 3):

```js
const off = Math.abs(closest.time - frame)
if (off > WINDOW) return   // çok erken ya da çok geç: hiçbir şey olmasın, nota beklemeye devam etsin
```

Tek başına `return` "burada dur, fonksiyonun gerisini yapma" demektir.

**Hangi nota?** O şeritteki, henüz vurulmamış **en yakın** nota. Bunu bulmak için listeyi baştan sona geziyoruz ve
şimdiye kadarki en yakını `closest` adlı değişkende tutuyoruz:

- `let closest = null` → `null` "henüz hiçbir şey" demek.
- `if (n.hit || n.lane !== lane) continue` → vurulmuşsa **veya** (`||`) başka şeritteyse (`!==` "eşit değil") atla.
- `if (!closest || ...) closest = n` → `!` "değil" demektir: "henüz bir aday yoksa **veya** bu nota adaydan daha
  yakınsa, yeni aday bu".

**Basılı tutmak sayılmaz.** Bir tuşu basılı tutunca bilgisayar `keydown`'u saniyede birçok kez tekrarlar. Ritim
oyununda bir basış bir vuruş olmalı; tekrarlanan olaylarda `event.repeat` `true`'dur ve onları yok sayarız.

**Büyük harf de çalışsın.** Caps Lock açıksa tuş `'D'` gelir. `event.key.toLowerCase()` yazıyı küçük harfe çevirir.
`a ?? b` → "`a` yoksa (`undefined` ya da `null`) `b`'yi kullan": önce tuşun kendisine, bulamazsak küçük harflisine
bakarız. `event.preventDefault()` ok tuşlarının sayfayı kaydırmasını engeller.

**Kısa süreli şeyler: sayaçlar.** Şeridin yanması ve mesaj bir an görünüp kaybolmalı. Her biri için bir geri sayım
tutarız, `update()` her karede bir azaltır:

- `lit = [0, 0, 0, 0]` → her şerit için "kaç kare daha yanık kalacak". Basınca `lit[lane] = 8`.
- `lit.map((n) => Math.max(0, n - 1))` → `map` listenin her elemanını dönüştürüp yeni bir liste yapar: her sayıdan 1
  çıkar ama 0'ın altına inme (`Math.max` iki sayıdan büyüğünü verir).
- `feedback = { text, color, time: 30 }` → gösterilecek mesaj ve 30 karelik ömrü. `--feedback.time` sayıyı bir
  azaltır ve yeni değeri verir; 0'a inince `feedback = null` ile mesaj silinir. `feedback && ...` "mesaj varsa" demektir
  (`&&` "ve"): mesaj yoksa ikinci kısma hiç bakılmaz.

**Koşullu renk.** `lit[lane] > 0 ? '#334155' : '#1e293b'` → `koşul ? evetse : hayırsa`: şerit yanıksa açık, değilse
koyu renk. `'Hits ' + hits` yazıyla sayıyı uç uca ekler: `'Hits 3'`. `ctx.textAlign` yazının verilen `x`'e göre
nereye hizalanacağını seçer (`'center'` ortalı, `'left'` soldan başlar); `ctx.font` boyu ve türü seçer.

# --task--

1. Add `WINDOW = 9`, `KEYS` (d, f, j, k and the arrows to lanes 0 to 3), and `hits`, `feedback` and `lit` (`0`, `null` and four
   zeros in `reset()`).
2. Write `judge(text, color)`, which sets `feedback = { text, color, time: 30 }`.
3. Write `press(lane)`: light the lane (`lit[lane] = 8`), find the closest note in the lane not yet hit, and if it is within
   `WINDOW` frames mark it hit, add 1 to `hits` and `judge('Hit', '#fde047')`.
4. On `keydown`: ignore repeats; find the lane for the key (also for capital letters) and `press` it (`preventDefault()`).
5. `update()` counts `lit` and the feedback's time down. Draw a lit lane `'#334155'`, the feedback in its color
   (`'bold 28px sans-serif'`, centered at `y = 300`), and `Hits 3` at `(12, 24)`.

# --task-tr--

1. `const LEAD = 120 ...` satırının altına pencereyi ve tuş tablosunu ekle:

   ```js
   const WINDOW = 9 // frames either side of the exact moment that still count
   const KEYS = { d: 0, f: 1, j: 2, k: 3, ArrowLeft: 0, ArrowDown: 1, ArrowUp: 2, ArrowRight: 3 }
   ```

2. `let frame` satırının altına üç değişken ekle:

   ```js
   let hits
   let feedback // { text, color, time } shown for a moment
   let lit // frames each lane stays lit after a press
   ```

3. `reset()` içinde, `frame = 0` satırının altına başlangıç değerlerini ekle:

   ```js
     frame = 0
     hits = 0                  // ← yeni
     feedback = null           // ← yeni
     lit = [0, 0, 0, 0]        // ← yeni
   }
   ```

4. `const noteY = ...` satırından sonra bir boş satır bırak ve (`function update()`'in **üstüne**) mesaj ve basış
   fonksiyonlarını yaz:

   ```js
   function judge(text, color) {
     feedback = { text, color, time: 30 }
   }

   // A key press hits the closest note in its lane, if it is close enough in time.
   function press(lane) {
     lit[lane] = 8
     let closest = null
     for (const n of notes) {
       if (n.hit || n.lane !== lane) continue
       if (!closest || Math.abs(n.time - frame) < Math.abs(closest.time - frame)) closest = n
     }
     if (!closest) return
     const off = Math.abs(closest.time - frame)
     if (off > WINDOW) return // too early: nothing happens, and the note is still there
     closest.hit = true
     hits += 1
     judge('Hit', '#fde047')
   }
   ```

5. `update()`'in başına iki geri sayım satırı ekle:

   ```js
   function update() {
     lit = lit.map((n) => Math.max(0, n - 1))                   // ← yeni
     if (feedback && --feedback.time === 0) feedback = null     // ← yeni
     frame += 1
   }
   ```

6. `update()`'in kapanan `}`'sinden sonra bir boş satır bırak ve (`function draw()`'un **üstüne**) klavye dinleyicisini
   yaz:

   ```js
   document.addEventListener('keydown', (event) => {
     if (event.repeat) return // holding a key down is not a new press
     const lane = KEYS[event.key] ?? KEYS[event.key.toLowerCase()]
     if (lane === undefined) return
     event.preventDefault()
     press(lane)
   })
   ```

7. `draw()` içinde şerit rengini seçen `ctx.fillStyle = '#1e293b'` satırını değiştir:

   ```js
       ctx.fillStyle = lit[lane] > 0 ? '#334155' : '#1e293b'     // ← değişti
   ```

8. `draw()`'un sonunda, notaları çizen `for (const n of notes) { ... }` bloğunun kapanışından sonra, fonksiyonun son
   `}`'sinden önce bir boş satır bırak ve yazıları ekle:

   ```js
     ctx.fillStyle = 'white'
     ctx.textAlign = 'center'
     ctx.font = 'bold 14px sans-serif'
     if (feedback) {
       ctx.fillStyle = feedback.color
       ctx.font = 'bold 28px sans-serif'
       ctx.fillText(feedback.text, canvas.width / 2, 300)
     }
     ctx.fillStyle = 'white'
     ctx.font = 'bold 16px sans-serif'
     ctx.textAlign = 'left'
     ctx.fillText('Hits ' + hits, 12, 24)
   }
   ```

9. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Nota renkli çizgiye gelince o şeridin tuşuna bas (`D F J K`):
   nota kaybolmalı, "Hit" yazısı çıkmalı, sayaç artmalı. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa
   `??` (iki soru işareti) ve `--feedback.time` (iki eksi) yazımına bak.

# --tests--

A press right on time should hit the note.
tr: Tam zamanında bir basış notaya vurmalı.

```js
$.tick(LEAD)
$.press('d')
assert.isTrue(notes[0].hit, 'pressed right on time')
assert.strictEqual(hits, 1)
$.tick(1)
assert.include($.texts(), 'Hit')
assert.include($.texts(), 'Hits 1')
```

A press far too early should do nothing, a held key should not count again, and a little early should be fine.
tr: Çok erken bir basış hiçbir şey yapmamalı, basılı tutulan tuş yeniden sayılmamalı ve biraz erken olmak sorun olmamalı.

```js
$.tick(LEAD - 20)
$.press('d')
assert.isFalse(notes[0].hit, 'far too early: nothing happens')
$.tick(20 - 5)
$.press('d', { repeat: true })
assert.isFalse(notes[0].hit, 'a key held down does not count again')
$.press('d')
assert.isTrue(notes[0].hit, 'a little early is fine')
```

The arrow keys should work, the lane should light up, and an empty lane should not count.
tr: Ok tuşları çalışmalı, şerit yanmalı ve boş bir şerit sayılmamalı.

```js
const second = notes.find((n) => n.lane === 1)
$.tick(second.time)
$.press('ArrowDown')
assert.isTrue(second.hit, 'the arrow keys work too')
$.tick(1)
assert.lengthOf($.rects('#334155'), 1, 'the pressed lane lights up')
$.press('J')
assert.strictEqual(hits, 1, 'no note near in that lane')
```

# --solution--

```js
// Rhythm game, step by step.
// The page already has <canvas id="game" width="400" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const LANES = 4
const LANE_W = 70
const LEFT = (canvas.width - LANES * LANE_W) / 2
const HIT_Y = 480 // where a note should be when you press
const SPEED = 4 // pixels a note falls per frame
const STEP = 15 // frames between rows of the chart (an eighth note at 120 beats a minute)
const LEAD = 120 // frames before the first row reaches the line
const WINDOW = 9 // frames either side of the exact moment that still count
const KEYS = { d: 0, f: 1, j: 2, k: 3, ArrowLeft: 0, ArrowDown: 1, ArrowUp: 2, ArrowRight: 3 }
const COLORS = ['#f43f5e', '#f59e0b', '#22c55e', '#3b82f6']
// The song, one row per eighth note: a 1 is a note in that lane.
const CHART = [
  '1000', '0000', '0100', '0000', '0010', '0000', '0001', '0000',
  '1000', '0100', '0010', '0001', '1001', '0000', '0110', '0000',
  '1000', '0010', '0100', '0001', '1000', '0010', '0100', '0001',
  '1100', '0000', '0011', '0000', '1100', '0000', '0011', '0000',
  '1000', '0100', '0010', '0001', '0010', '0100', '1000', '0000',
  '1010', '0101', '1010', '0101', '1001', '0110', '1001', '0000',
]

let notes // { lane, time, hit }
let frame
let hits
let feedback // { text, color, time } shown for a moment
let lit // frames each lane stays lit after a press

function reset() {
  notes = []
  CHART.forEach((row, i) => {
    for (let lane = 0; lane < LANES; lane++) if (row[lane] === '1') notes.push({ lane, time: LEAD + i * STEP, hit: false })
  })
  frame = 0
  hits = 0
  feedback = null
  lit = [0, 0, 0, 0]
}

// Where a note is drawn: on the line at its time, higher up the earlier it is.
const noteY = (note) => HIT_Y - (note.time - frame) * SPEED

function judge(text, color) {
  feedback = { text, color, time: 30 }
}

// A key press hits the closest note in its lane, if it is close enough in time.
function press(lane) {
  lit[lane] = 8
  let closest = null
  for (const n of notes) {
    if (n.hit || n.lane !== lane) continue
    if (!closest || Math.abs(n.time - frame) < Math.abs(closest.time - frame)) closest = n
  }
  if (!closest) return
  const off = Math.abs(closest.time - frame)
  if (off > WINDOW) return // too early: nothing happens, and the note is still there
  closest.hit = true
  hits += 1
  judge('Hit', '#fde047')
}

function update() {
  lit = lit.map((n) => Math.max(0, n - 1))
  if (feedback && --feedback.time === 0) feedback = null
  frame += 1
}

document.addEventListener('keydown', (event) => {
  if (event.repeat) return // holding a key down is not a new press
  const lane = KEYS[event.key] ?? KEYS[event.key.toLowerCase()]
  if (lane === undefined) return
  event.preventDefault()
  press(lane)
})

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  for (let lane = 0; lane < LANES; lane++) {
    const x = LEFT + lane * LANE_W
    ctx.fillStyle = lit[lane] > 0 ? '#334155' : '#1e293b'
    ctx.fillRect(x + 2, 0, LANE_W - 4, canvas.height)
    ctx.fillStyle = COLORS[lane]
    ctx.fillRect(x + 6, HIT_Y - 4, LANE_W - 12, 8)
  }
  for (const n of notes) {
    if (n.hit) continue
    const y = noteY(n)
    if (y < -20 || y > canvas.height + 20) continue
    ctx.fillStyle = COLORS[n.lane]
    ctx.fillRect(LEFT + n.lane * LANE_W + 8, y - 10, LANE_W - 16, 20)
  }

  ctx.fillStyle = 'white'
  ctx.textAlign = 'center'
  ctx.font = 'bold 14px sans-serif'
  if (feedback) {
    ctx.fillStyle = feedback.color
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText(feedback.text, canvas.width / 2, 300)
  }
  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Hits ' + hits, 12, 24)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```

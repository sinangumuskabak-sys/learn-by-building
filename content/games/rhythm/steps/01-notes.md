---
title: Notes on a timeline
title_tr: Bir zaman çizelgesinde notalar
skills: [prog.arrays, game.loop]
---

# --explanation--

In a rhythm game notes slide down four lanes towards a line, and you press the lane's key the moment a note reaches it.

The song is written as a **chart**: one string per row, one character per lane, `'1'` for a note. Each row is an eighth note,
`STEP = 15` frames apart, which is 120 beats a minute at 60 frames a second. Writing music as text makes it easy to read and to
change, and turning it into notes is two loops: every `'1'` becomes `{ lane, time }`, where `time` is the frame at which the note
must be hit.

The screen follows from the time, not the other way round. The game only counts `frame`; a note's position is worked out from
how far away its time is:

```js
const noteY = (note) => HIT_Y - (note.time - frame) * SPEED
```

At its time the note is exactly on the line, and `SPEED` pixels higher for every frame still to go. Nothing is moved step by step,
so a note can never drift away from the beat. That is the core idea of every rhythm game: **the clock is the truth, and the
picture is computed from it**.

`LEAD` frames of silence before the first note give the player time to get ready.

# --explanation-tr--

**Bu adımda:** bir ritim oyununun temelini kuracağız. Sağda dört dikey şerit, her şeridin altında renkli bir vuruş
çizgisi ve yukarıdan bu çizgilere doğru kayan renkli notalar göreceksin. Henüz tuşa basmıyoruz, sadece izliyoruz.

Bu ilk adım uzun, çünkü birçok temel şeyi birlikte öğreneceğiz. Acele etme.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya** okur. `//` ile başlayan kısımlar **yorumdur**: bilgisayar atlar,
sadece insanlar için not.

**Canvas ve fırça.** Sayfada 400×560 piksellik bir resim alanı (`canvas`, kimliği `game`) var. Önce onu bulur, sonra
çizim aracını (**context**) alırız:

```js
const canvas = document.getElementById('game')   // sayfada kimliği 'game' olanı bul
const ctx = canvas.getContext('2d')              // onun fırçasını al
```

`const ad = ...` bir şeye ad (etiket) verir; buna **sabit** denir. Nokta (`.`) "bunun içindeki" demektir. Tırnak
içindekiler **yazıdır** (metin). `ctx.fillStyle = '#1e293b'` fırçanın rengini seçer (`#` ile başlayan renk kodu),
`ctx.fillRect(x, y, en, boy)` bir dikdörtgen boyar. Canvas'ın **sol üst köşesi** `(0, 0)`'dır; `x` sağa, `y`
**aşağı** doğru büyür.

**Ayar sabitleri.** Değişmeyen ayarları BÜYÜK HARFLE adlandırırız: şerit sayısı (`LANES`), şerit eni (`LANE_W`),
vuruş çizgisinin yüksekliği (`HIT_Y`)... `LEFT`, dört şeridi ortalamak için soldan bırakılan boşluktur:
`(400 - 4 × 70) / 2 = 60`. Parantez içi önce hesaplanır, `*` çarpma, `/` bölmedir.

**Dizi (array): bir liste.** Köşeli parantez içinde virgülle ayrılmış değerler: `['#f43f5e', '#f59e0b', ...]`.
Elemanlara sıra numarasıyla ulaşılır ve sayma **0'dan başlar**: `COLORS[0]` ilk renk.

**Şarkı yazı olarak: `CHART`.** Şarkı bir **çizelgedir**: her satır bir yazı, her harf bir şerit, `'1'` o şeritte bir
nota demek. `'1001'` → ilk ve son şeritte aynı anda iki nota (akor). Satırlar 15 karede bir gelir (`STEP`): saniyede 60
kare ile dakikada 120 vuruşta sekizlik notalar. Müziği yazı olarak tutmak okumayı ve değiştirmeyi kolaylaştırır.
Satırın bir harfine de sıra numarasıyla ulaşılır: `'1001'[3]` → `'1'`.

**Değişken ve nesne.** `let notes` açılan ama henüz boş olan bir kutudur; `let` ile açılanlar sonra değişebilir. Her
nota bir **nesnedir**: birbirine ait bilgiler `ad: değer` çiftleriyle tek pakette: `{ lane: 0, time: 120, hit: false }`
(hangi şerit, hangi karede vurulmalı, vuruldu mu). `false` "hayır", `true` "evet" demektir.

**Çizelgeyi notalara çevirmek.** İki iç içe döngüyle:

```js
CHART.forEach((row, i) => {
  for (let lane = 0; lane < LANES; lane++) if (row[lane] === '1') notes.push({ lane, time: LEAD + i * STEP, hit: false })
})
```

- `CHART.forEach((row, i) => { ... })` → çizelgenin her satırı için bir kez çalışır; `row` satırın yazısı, `i` sıra
  numarası. `(row, i) => { ... }` adı olmayan küçük bir fonksiyondur (ok fonksiyonu).
- `for (let lane = 0; lane < LANES; lane++)` → `lane`'i 0'dan başlat, 4'ten küçükken tekrar et, her turda bir artır
  (`++`). Yani 0, 1, 2, 3.
- `if (row[lane] === '1')` → o harf `'1'` ise (`===` "eşit mi"), `notes.push(...)` listeye bir nota ekler. Sadece
  `lane` yazmak `lane: lane` yazmanın kısasıdır.
- `LEAD + i * STEP` → notanın vurulacağı kare. `LEAD` (120 kare, 2 saniye) oyuncuya hazırlanma zamanı verir.

**Saat asıl olandır.** Oyun sadece `frame` (kare sayısı) sayar. Notanın ekrandaki yeri zamanından **hesaplanır**:

```js
const noteY = (note) => HIT_Y - (note.time - frame) * SPEED
```

Zamanı gelince (`note.time - frame` = 0) nota tam çizgidedir; gelmesine kalan her kare için `SPEED` piksel daha
yukarıdadır. Notalar adım adım kaydırılmadığı için ritimden asla kaymaz. Her ritim oyununun ana fikri budur: **saat
gerçektir, resim ondan hesaplanır.** Buradaki `=>` fonksiyonu tek satırlık; sonucu otomatik geri verir.

**Fonksiyon, döngü, çizim.** `function reset() { ... }` bir iş listesine ad verir (tarif gibi); `reset()` diye
**çağırınca** çalışır. `requestAnimationFrame(loop)` tarayıcıya "ekranı yenilemeden önce `loop`'u çağır" der; `loop`
kendini yeniden istediği için saniyede ~60 kez: saati ilerlet (`update`), çiz (`draw`).

`draw()` içinde iki yeni şey: `for (const n of notes)` → "listedeki her nota için, ona `n` de". `continue` → "bu notayı
atla, sıradakine geç": vurulmuş (`n.hit`) ya da ekranın dışında kalan (`||` "veya") notalar çizilmez.

# --task--

1. Add `LANES = 4`, `LANE_W = 70`, `LEFT` (the lanes centered), `HIT_Y = 480`, `SPEED = 4`, `STEP = 15`, `LEAD = 120`, the four lane
   `COLORS` and the `CHART` (the song, one row per eighth note: a `1` is a note in that lane):

   ```js
   const COLORS = ['#f43f5e', '#f59e0b', '#22c55e', '#3b82f6']
   const CHART = [
     '1000', '0000', '0100', '0000', '0010', '0000', '0001', '0000',
     '1000', '0100', '0010', '0001', '1001', '0000', '0110', '0000',
     '1000', '0010', '0100', '0001', '1000', '0010', '0100', '0001',
     '1100', '0000', '0011', '0000', '1100', '0000', '0011', '0000',
     '1000', '0100', '0010', '0001', '0010', '0100', '1000', '0000',
     '1010', '0101', '1010', '0101', '1001', '0110', '1001', '0000',
   ]
   ```

2. In `reset()`, build `notes`: for row `i` and lane `lane` with a `'1'`, `{ lane, time: LEAD + i * STEP, hit: false }`; and
   `frame = 0`. `update()` counts `frame` up.
3. Write `noteY(note)` as above.
4. Draw each lane (`'#1e293b'`, 2 pixels in from its sides), a hit bar across it (`COLORS[lane]`, 8 high, centered on `HIT_Y`, 6 in
   from the sides), and every note not yet hit that is on screen as a 20 high block in its lane's color, 8 in from the sides,
   centered on `noteY`.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** canvas'ı ve fırçayı al:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir boş satır bırak ve ayarları, renkleri ve şarkıyı yaz. Çizelge uzun: dikkatle kopyala ya da **Çözümü göster**
   ile karşılaştır.

   ```js
   const LANES = 4
   const LANE_W = 70
   const LEFT = (canvas.width - LANES * LANE_W) / 2
   const HIT_Y = 480 // where a note should be when you press
   const SPEED = 4 // pixels a note falls per frame
   const STEP = 15 // frames between rows of the chart (an eighth note at 120 beats a minute)
   const LEAD = 120 // frames before the first row reaches the line
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
   ```

3. Bir boş satır bırak ve iki değişkeni aç:

   ```js
   let notes // { lane, time, hit }
   let frame
   ```

4. Bir boş satır bırak ve çizelgeden notaları kuran `reset()`'i yaz. Ortadaki `for ... if ... push` satırı uzun ama
   tek satırdır:

   ```js
   function reset() {
     notes = []
     CHART.forEach((row, i) => {
       for (let lane = 0; lane < LANES; lane++) if (row[lane] === '1') notes.push({ lane, time: LEAD + i * STEP, hit: false })
     })
     frame = 0
   }
   ```

5. Bir boş satır bırak ve notanın yerini hesaplayan fonksiyonu, sonra saati ilerleten `update()`'i yaz:

   ```js
   // Where a note is drawn: on the line at its time, higher up the earlier it is.
   const noteY = (note) => HIT_Y - (note.time - frame) * SPEED

   function update() {
     frame += 1
   }
   ```

   `frame += 1` saati bir kare ilerletir (`frame = frame + 1`).

6. Bir boş satır bırak ve çizimi yaz: arka plan, şeritler ve vuruş çizgileri, sonra notalar:

   ```js
   function draw() {
     ctx.fillStyle = '#0f172a'
     ctx.fillRect(0, 0, canvas.width, canvas.height)
     for (let lane = 0; lane < LANES; lane++) {
       const x = LEFT + lane * LANE_W
       ctx.fillStyle = '#1e293b'
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
   }
   ```

   `x + 2` ve `LANE_W - 4` şeridi iki yandan 2 piksel daraltır, aralarda ince boşluk kalır. `HIT_Y - 4` ve `y - 10`
   dikdörtgenleri yüksekliklerinin yarısı kadar yukarı alıp ortalar.

7. Bir boş satır bırak ve oyun döngüsünü yazıp başlat:

   ```js
   function loop() {
     update()
     draw()
     requestAnimationFrame(loop)
   }

   reset()
   requestAnimationFrame(loop)
   ```

8. **Çalıştır**'a bas (ya da `Ctrl + Enter`). İki saniye sonra renkli notalar yukarıdan inip renkli çizgilerden geçmeli;
   alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa çizelgedeki tırnak ve virgülleri, büyük/küçük harfleri
   (`forEach`, `LANE_W`) kontrol et.

# --tests--

Every 1 in the chart should become a note at its row's time, chords included.
tr: Çizelgedeki her 1, akorlar dahil, satırının zamanında bir nota olmalı.

```js
const ones = CHART.join('').split('').filter((c) => c === '1').length
assert.lengthOf(notes, ones, 'one note for every 1 in the chart')
assert.deepInclude(notes, { lane: 0, time: LEAD, hit: false }, 'the first row')
assert.deepInclude(notes, { lane: 3, time: LEAD + 12 * STEP, hit: false }, 'row 12 has a note in lane 3')
assert.deepInclude(notes, { lane: 0, time: LEAD + 12 * STEP, hit: false }, 'and one in lane 0 at the same time')
```

A note should be on the line exactly at its time.
tr: Bir nota tam zamanında çizginin üstünde olmalı.

```js
const first = notes[0]
assert.strictEqual(noteY(first), HIT_Y - LEAD * SPEED, 'far above the line at the start')
$.tick(LEAD)
assert.strictEqual(frame, LEAD)
assert.strictEqual(noteY(first), HIT_Y, 'on the line exactly at its time')
```

The hit bars and the falling notes should be drawn in place.
tr: Vuruş çubukları ve düşen notalar yerlerinde çizilmeli.

```js
$.tick(1)
for (let lane = 0; lane < 4; lane++) {
  assert.deepInclude($.rects(COLORS[lane]), { x: LEFT + lane * LANE_W + 6, y: HIT_Y - 4, w: LANE_W - 12, h: 8, color: COLORS[lane] }, 'the hit line')
}
$.tick(LEAD - 1 - 10)
assert.deepInclude($.rects(COLORS[0]), { x: LEFT + 8, y: HIT_Y - 10 * SPEED - 10, w: LANE_W - 16, h: 20, color: COLORS[0] }, 'the first note, 10 frames away')
```

# --seed--

```js
// Rhythm game, step by step.
// The page already has <canvas id="game" width="400" height="560"></canvas>.
// Write your code below.
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

function reset() {
  notes = []
  CHART.forEach((row, i) => {
    for (let lane = 0; lane < LANES; lane++) if (row[lane] === '1') notes.push({ lane, time: LEAD + i * STEP, hit: false })
  })
  frame = 0
}

// Where a note is drawn: on the line at its time, higher up the earlier it is.
const noteY = (note) => HIT_Y - (note.time - frame) * SPEED

function update() {
  frame += 1
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  for (let lane = 0; lane < LANES; lane++) {
    const x = LEFT + lane * LANE_W
    ctx.fillStyle = '#1e293b'
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
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```

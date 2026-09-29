---
title: The song as text
title_tr: Yazı olarak şarkı
skills: [prog.arrays]
---

# --goal--

The song is written as a **chart**: one text per row, one character per lane, `1` for a note. Each row is an eighth
note. Writing music as text makes it easy to read and to change.

# --goal-tr--

Şarkıyı bir **çizelge** (chart) olarak yazacağız. Her satır küçük bir yazı, her harf bir şerit: `1` o şeritte bir
nota, `0` sessizlik. `'1001'` → ilk ve son şeritte **aynı anda** iki nota (bir akor).

Satırlar sırayla, eşit aralıklarla gelir; her biri müzikte bir **sekizlik nota** kadar sürer. Müziği yazı olarak
tutmak onu okumayı ve değiştirmeyi kolaylaştırır: bir piyano rulosu gibi, sadece yan yatmış.

# --code--

```js
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

# --meaning--

- `CHART` is an array of 48 texts. Eight rows per line of code only makes it easier to read; it is one list.
- Each text has four characters, one per lane: `'0100'` is a note in lane 1.
- The comma after the last item is allowed and keeps the lines alike.

# --meaning-tr--

- `const CHART = [ ... ]` → **48 yazıdan** oluşan bir dizi. Kodda her satıra sekiz tane yazdık ki okunsun; hepsi tek
  bir liste.
- Tırnak içindeki her yazı dört harfli; her harf bir şerit: `'0100'` → yalnız 1. şeritte (turuncu) bir nota.
- Bir yazının harfine de sıra numarasıyla ulaşılır: `'1001'[3]` → `'1'` (sayma 0'dan).
- Son satırdan sonraki virgüle izin var; satırlar aynı görünsün diye yazılır.
- Şarkının ilk satırları sırayla dört şeridi dolaşıyor: `1000`, `0100`, `0010`, `0001`... bir merdiven gibi.

# --task--

Under `COLORS`, write the comment and `CHART`.

# --task-tr--

`const COLORS = ...` satırının altına yorum satırını ve `CHART` listesini yaz. Dikkatle yaz (ya da buradan kopyala:
bu kod değil, bir nota kâğıdı). **Çalıştır**: ekran değişmez; notaları bir sonraki adımda çıkaracağız.

# --hint--

Every row is four characters in quotes, followed by a comma: `'1000',`.

# --hint-tr--

Her satır tırnak içinde dört karakter ve arkasından bir virgül: `'1000',`.

# --tests--

`CHART` should be 48 rows of four characters, each `0` or `1`.
tr: `CHART` her biri `0` ya da `1` olan dört karakterlik 48 satır olmalı.

```js
assert.lengthOf(CHART, 48)
for (const row of CHART) assert.match(row, /^[01]{4}$/)
assert.strictEqual(CHART[12], '1001')
assert.strictEqual(CHART.join('').split('').filter((c) => c === '1').length, 49)
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
}

draw()
```

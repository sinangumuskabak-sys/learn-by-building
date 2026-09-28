---
title: Lay out the cards
title_tr: Kartları diz
skills: [game.canvas, prog.loops]
---

# --explanation--

The board is a 4×4 grid of cards with a gap between them and around the edges. One pair of nested loops draws the whole
grid: the outer loop goes down the rows, the inner loop across the columns.

Each card's position comes from a formula, so there are no magic numbers scattered around:

```
x = GAP + col * (CARD + GAP)
y = TOP + GAP + row * (CARD + GAP)
```

The numbers are chosen to fit exactly: four 85 px cards and five 12 px gaps make `4 × 85 + 5 × 12 = 400` pixels, the
canvas width. The canvas is 40 px taller than it is wide (`TOP`), which leaves a strip at the top for the move counter
later.

Face-down cards all look the same: a plain colored square. That is the whole point of the game.

# --explanation-tr--

**Bu adımda:** hafıza oyununun tahtasını çizeceğiz. Sağda koyu lacivert bir alanın üstünde 4 satır, 4 sütun halinde
dizilmiş 16 mor kare (kapalı kart) göreceksin.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya, satır satır** okur ve yapar. `//` ile başlayan yazılar
**yorumdur**: bilgisayar onları atlar, sadece insanlar için not.

**Canvas (tuval) nedir?** Sayfada 400 piksel eninde, 440 piksel boyunda boş bir resim alanı var. Adı `canvas`,
kimliği (id) `game`. Oyundaki her şeyi bu alanın üstüne **boyayarak** göstereceğiz: önce kâğıdı buluruz, sonra
fırçayı alırız.

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')
```

Bunu parça parça okuyalım:

- `const canvas =` → "Bundan sonra şuna `canvas` diyeceğim." `const` ile ad verilen şeye **sabit** (constant)
  denir: bir kutuya etiket yapıştırmak gibidir, sonra hep o adla çağırırsın.
- `document.getElementById('game')` → "sayfada kimliği `game` olanı bul". Nokta (`.`) "bunun içindeki şu komut"
  demektir. Tırnak içindeki `'game'` bir **yazıdır** (metin).
- `canvas.getContext('2d')` → canvas'ın çizim aracını (bağlam, **context**) verir. `ctx` artık senin fırçan.

**Boyamak iki hareket:** önce renk seç, sonra dikdörtgen boya.

```js
ctx.fillStyle = 'orange'      // fırçaya turuncu boya sür
ctx.fillRect(10, 20, 50, 30)  // dikdörtgen: x, y, genişlik, yükseklik
```

Canvas'ın **sol üst köşesi** `(0, 0)`'dır. `x` sağa gittikçe, `y` **aşağı** indikçe büyür. Renkler `'orange'` gibi
İngilizce adlarla ya da `'#6366f1'` gibi kodlarla yazılır.

**Sabitlerle sayılara ad vermek.** Kartın boyu 85, aradaki boşluk 12 gibi sayıları bir kez adlandırırız:
`CARD = 85`, `GAP = 12`. Sonra kodda `85` yerine `CARD` yazarız; hem okunur olur hem de değiştirmek istersen tek yeri
değiştirirsin. `SIZE = 4` bir satırdaki kart sayısı, `TOP = 40` ise üstte hamle sayacı için bırakılan şerit. Sayılar
tam sığacak şekilde seçildi: dört 85'lik kart ve beş 12'lik boşluk `4 × 85 + 5 × 12 = 400` eder, yani canvas'ın eni.

**Döngü (loop) nedir?** 16 kartı tek tek 16 satırla çizmek yerine bilgisayara "bunu tekrarla" deriz:

```js
for (let col = 0; col < 4; col++) {
  // buradaki kod col = 0, 1, 2, 3 için 4 kez çalışır
}
```

- `let col = 0` → `col` adında bir **değişken** (variable) aç, 0'dan başlasın. `let`, `const`'tan farklı olarak
  değeri sonradan değişebilen bir kutudur.
- `col < 4` → "`col` 4'ten küçük olduğu sürece devam et".
- `col++` → her turun sonunda `col`'u 1 artır.
- `{ }` süslü parantezler arası, tekrarlanacak kodun gövdesidir.

Bir döngünün **içine** ikinci bir döngü koyarsak (**iç içe döngü**): dış döngü satırları (`row`) sırayla gezer, her
satır için iç döngü o satırdaki sütunları (`col`) gezer. 4 × 4 = 16 kez çalışır, her kart için bir kez.

**Kartın yeri nereden gelir?** Her kartın konumu bir formülden hesaplanır:

```
x = GAP + col * (CARD + GAP)
y = TOP + GAP + row * (CARD + GAP)
```

`*` çarpma demektir. Örneğin `col = 0` için `x = 12`, `col = 1` için `x = 12 + 97 = 109`. Kapalı kartların hepsi aynı
düz renkli karedir: oyunun bütün amacı da bu.

# --task--

1. Store the canvas and context in `canvas` and `ctx`, and add constants `SIZE = 4`, `CARD = 85`, `GAP = 12` and
   `TOP = 40`.
2. Fill the canvas with `'#1e1b4b'`.
3. With two nested loops (`row` and `col` from `0` to `SIZE - 1`), draw a `'#6366f1'` `CARD` × `CARD` square at
   `x = GAP + col * (CARD + GAP)`, `y = TOP + GAP + row * (CARD + GAP)`.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** tıkla ve kâğıt ile fırçayı alan iki
   satırı yaz:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir satır boşluk bırak ve dört sabiti ekle:

   ```js
   const SIZE = 4
   const CARD = 85
   const GAP = 12
   const TOP = 40
   ```

3. Bir satır boşluk bırak, sonra bütün alanı koyu laciverte boya:

   ```js
   ctx.fillStyle = '#1e1b4b'
   ctx.fillRect(0, 0, canvas.width, canvas.height)
   ```

   `canvas.width` ve `canvas.height` canvas'ın eni ve boyudur (400 ve 440).

4. Bir satır boşluk bırak, sonra mor rengi seçip iç içe iki döngüyle 16 kartı çiz:

   ```js
   ctx.fillStyle = '#6366f1'
   for (let row = 0; row < SIZE; row++) {
     for (let col = 0; col < SIZE; col++) {
       ctx.fillRect(GAP + col * (CARD + GAP), TOP + GAP + row * (CARD + GAP), CARD, CARD)
     }
   }
   ```

   Her `{` bir `}` ile kapanmalı: sonda iki tane `}` var, biri iç döngünün, biri dış döngünün.

5. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sağda lacivert zemin üstünde 4×4 dizilmiş 16 mor kare görmelisin ve
   alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa parantezleri ve büyük/küçük harfleri harf harf karşılaştır.

# --tests--

The background should fill the 400×440 canvas.
tr: Arka plan 400×440 canvas'ı doldurmalı.

```js
assert.deepEqual([SIZE, CARD, GAP, TOP], [4, 85, 12, 40])
assert.isTrue($.rects('#1e1b4b').some((r) => r.x === 0 && r.y === 0 && r.w === 400 && r.h === 440))
```

There should be 16 face-down cards in a 4×4 grid.
tr: 4×4 ızgarada 16 kapalı kart olmalı.

```js
const cards = $.rects('#6366f1')
assert.lengthOf(cards, 16)
assert.isTrue(cards.every((c) => c.w === 85 && c.h === 85))
const xs = [...new Set(cards.map((c) => c.x))].sort((a, b) => a - b)
const ys = [...new Set(cards.map((c) => c.y))].sort((a, b) => a - b)
assert.deepEqual(xs, [12, 109, 206, 303])
assert.deepEqual(ys, [52, 149, 246, 343])
```

# --seed--

```js
// Memory, step by step.
// The page already has <canvas id="game" width="400" height="440"></canvas>.
// Write your code below.
```

# --solution--

```js
// Memory, step by step.
// The page already has <canvas id="game" width="400" height="440"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 4 // cards per row and per column
const CARD = 85
const GAP = 12
const TOP = 40 // room for the move counter above the cards

ctx.fillStyle = '#1e1b4b'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.fillStyle = '#6366f1'
for (let row = 0; row < SIZE; row++) {
  for (let col = 0; col < SIZE; col++) {
    ctx.fillRect(GAP + col * (CARD + GAP), TOP + GAP + row * (CARD + GAP), CARD, CARD)
  }
}
```

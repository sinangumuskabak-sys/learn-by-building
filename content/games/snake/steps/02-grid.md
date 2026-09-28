---
title: Think in grid cells
title_tr: Izgara hücreleriyle düşün
skills: [game.canvas]
---

# --explanation--

Snake does not move smoothly pixel by pixel: it jumps from one **cell** of a grid to the next. So instead of thinking
in pixels, think in cells, and convert to pixels only when drawing.

With cells of 20 pixels, the 400×400 board is a 20×20 grid. The cell in column `5`, row `5` starts at pixel
`5 * 20 = 100` on both axes:

```
pixel x = column * CELL
pixel y = row * CELL
```

Putting the size in a named constant (`CELL`) instead of typing `20` everywhere means you can change it in one place
later, and the code says *why* the number is there.

# --explanation-tr--

**Bu adımda:** koyu tahtanın üstüne küçük, yeşil bir kare çizeceğiz. Çalıştırınca sağda, sol üst köşeye yakın
bir yerde tek bir yeşil kare göreceksin. Bu kare, yılanın başı olacak.

**Izgara (grid) nedir?** Yılan pikselden piksele kayarak gitmez; bir **hücreden** yanındaki hücreye atlar. Tahtayı
bir satranç tahtası ya da kareli defter gibi düşün: her kare bir hücre. Hücreler 20 piksel olursa 400×400'lük tahta
yan yana 20 sütun, alt alta 20 satır eder.

Bu yüzden oyunda "yılan şu pikselde" değil, "yılan şu **sütunda** ve şu **satırda**" diye düşüneceğiz. Piksele
yalnızca çizerken çevireceğiz. Çevirmek kolay: sütun numarasını hücre boyuyla çarparsın.

```
piksel x = sütun * CELL
piksel y = satır * CELL
```

Sayma sıfırdan başlar: en soldaki sütun `0`. sütundur. Yani `5`. sütun, soldan `5 * 20 = 100` piksel içeride
başlar. `*` işareti bilgisayarda **çarpma** demektir.

**Sayıya ad vermek.** Her yere `20` yazmak yerine bu sayıya bir ad veririz:

```js
const CELL = 20
```

1. adımda `const` ile `canvas`'a ad vermiştik; burada da aynı şeyi bir **sayıya** yapıyoruz. Artık `CELL`
yazdığın her yerde bilgisayar `20` anlar. İki faydası var: hücre boyunu ileride değiştirmek istersen tek bir yeri
değiştirirsin, ve kodu okuyan biri `20`'nin ne olduğunu hemen anlar. Sayılar tırnak **içine yazılmaz**: `20` bir
sayıdır, `'20'` ise bir yazı olurdu.

**Kareyi çizmek.** 1. adımdaki gibi iki hamle: önce renk, sonra dikdörtgen.

```js
ctx.fillStyle = 'lime'
ctx.fillRect(5 * CELL, 5 * CELL, CELL, CELL)
```

Bunu parça parça okuyalım:

- `'lime'` → açık, parlak yeşil.
- `5 * CELL` (ilk sayı) → x: 5. sütun, yani 100 piksel.
- `5 * CELL` (ikinci sayı) → y: 5. satır, yani 100 piksel.
- `CELL, CELL` → genişlik ve yükseklik: tam bir hücre, 20×20.

**Sıra önemli.** Bilgisayar yukarıdan aşağı çalışır ve her çizim öncekinin **üstüne** boyanır. Kareyi arka
plandan önce çizersen koyu renk onu örter ve göremezsin. O yüzden kare, arka planı boyayan satırların **altına**
yazılır.

# --task--

1. Add a constant `CELL` with the value `20`.
2. After painting the background, draw one `'lime'` square exactly one cell big, in column `5`, row `5`. Use `CELL`
   for the position and the size.

# --task-tr--

1. `const ctx = canvas.getContext('2d')` satırının altında bir satır boşluk bırak ve şunu yaz:

   ```js
   const CELL = 20
   ```

2. En alttaki `ctx.fillRect(0, 0, canvas.width, canvas.height)` satırının **altına** bir satır boşluk bırak ve
   yeşil kareyi çizen iki satırı ekle:

   ```js
   ctx.fillStyle = 'lime'
   ctx.fillRect(5 * CELL, 5 * CELL, CELL, CELL)
   ```

   Kodunun sonu artık şöyle görünmeli:

   ```js
   const CELL = 20

   ctx.fillStyle = '#111'
   ctx.fillRect(0, 0, canvas.width, canvas.height)

   ctx.fillStyle = 'lime'
   ctx.fillRect(5 * CELL, 5 * CELL, CELL, CELL)
   ```

3. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Koyu tahtanın sol üst tarafında küçük yeşil bir kare görmelisin ve
   alttaki kontrollerin hepsi yeşil olmalı. "Kare arka planın üstüne çizilmeli" kontrolü kırmızıysa, yeşil kareyi
   çizen satırlar arka planı boyayan satırların üstünde kalmıştır; onları aşağı taşı.

# --tests--

`CELL` should be `20`.
tr: `CELL` değeri `20` olmalı.

```js
assert.strictEqual(CELL, 20)
```

A single lime 20×20 square should be drawn at pixel (100, 100).
tr: Piksel (100, 100) noktasına tek bir 20×20 lime kare çizilmeli.

```js
assert.deepEqual($.rects('lime'), [{ x: 100, y: 100, w: 20, h: 20, color: 'lime' }])
```

The square should be drawn on top of the background, not under it.
tr: Kare arka planın altına değil üstüne çizilmeli.

```js
const order = $.screen().filter((c) => c.op === 'fillRect').map((c) => c.fill)
assert.deepEqual(order, ['#111', 'lime'])
```

# --solution--

```js
// Snake, step by step.
// The page already has <canvas id="game" width="400" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 20

ctx.fillStyle = '#111'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.fillStyle = 'lime'
ctx.fillRect(5 * CELL, 5 * CELL, CELL, CELL)
```

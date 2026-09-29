---
title: A row of cards
title_tr: Bir sıra kart
skills: [prog.loops]
---

# --goal--

Instead of four nearly identical lines, a `for` loop draws a row of four cards. Card `col` starts at
`GAP + col * (CARD + GAP)`: each card is one card plus one gap further right.

# --goal-tr--

Dört kartı dört ayrı satırla çizmek yerine bilgisayara "bunu **tekrarla**" diyeceğiz. Buna **döngü** (loop) denir.

Her kart bir öncekinin **bir kart artı bir boşluk** (85 + 12 = 97 piksel) sağında durur. Yani `col` numaralı kartın
x'i: `GAP + col * (CARD + GAP)`.

# --code--

```js
for (let col = 0; col < SIZE; col++) {
  ctx.fillRect(GAP + col * (CARD + GAP), TOP + GAP, CARD, CARD)
}
```

# --meaning--

- `let col = 0` starts a counter at 0; `col < SIZE` keeps going while it is below 4; `col++` adds 1 after each round.
- So the body runs for `col` = 0, 1, 2, 3: x = 12, 109, 206, 303.

# --meaning-tr--

- `for ( ... ) { ... }` → "süslü parantezin içini tekrarla".
- `let col = 0` → `col` (sütun) adında bir **sayaç**, 0'dan başlar. `let` de `const` gibi ad verir ama değeri
  **sonradan değişebilir**; böyle adlara **değişken** denir.
- `col < SIZE` → "`col` 4'ten küçük olduğu sürece devam et".
- `col++` → her turdan sonra `col`'u 1 artır.
- `GAP + col * (CARD + GAP)` → `*` çarpma; parantez önce hesaplanır. `col = 0` için 12, `col = 1` için
  12 + 97 = **109**, sonra 206, 303.

# --task--

Replace the line `ctx.fillRect(GAP, TOP + GAP, CARD, CARD)` with the loop. Press **Run**.

# --task-tr--

1. En alttaki `ctx.fillRect(GAP, TOP + GAP, CARD, CARD)` satırını sil.
2. Yerine üç satırlık döngüyü yaz.
3. **Çalıştır**: üstte yan yana dört mor kart görmelisin.

# --predict--

How many cards will you see?
- [ ] 3
- [x] 4
  `col` takes the values 0, 1, 2 and 3; at 4 the condition `col < SIZE` is false.
- [ ] 5

# --predict-tr--

Kaç kart göreceksin?
- [ ] 3
- [x] 4
  `col` 0, 1, 2 ve 3 değerlerini alır; 4 olunca `col < SIZE` koşulu yanlış olur.
- [ ] 5

# --tests--

There should be a row of four cards.
tr: Yan yana dört kart olmalı.

```js
const cards = $.rects('#6366f1')
assert.deepEqual(cards.map((c) => [c.x, c.y]), [[12, 52], [109, 52], [206, 52], [303, 52]])
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
for (let col = 0; col < SIZE; col++) {
  ctx.fillRect(GAP + col * (CARD + GAP), TOP + GAP, CARD, CARD)
}
```

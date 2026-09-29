---
title: A checkered grid
title_tr: Damalı ızgara
skills: [prog.loops, game.canvas]
---

# --goal--

Two loops, one inside the other, visit all 64 cells: the outer one the rows `r`, the inner one the columns `c`. Each
cell is a square in one of two shades, like a chessboard.

# --goal-tr--

Şimdi 64 hücrenin her birini bir kare olarak çiziyoruz; satranç tahtası gibi, iki tonlu **dama** deseniyle.

64 kareyi tek tek yazmak yerine **iç içe iki döngü**: dıştaki satırları (`r`), içteki o satırın sütunlarını (`c`)
gezer. Bir kitabı satır satır, her satırı soldan sağa okumak gibi.

# --code--

```js
for (let r = 0; r < N; r++) {
  for (let c = 0; c < N; c++) {
    const x = LEFT + c * SIZE
    const y = TOP + r * SIZE
    ctx.fillStyle = (r + c) % 2 === 0 ? '#312e81' : '#3730a3'
    ctx.fillRect(x, y, SIZE, SIZE)
  }
}
```

# --meaning--

- `for (let r = 0; r < N; r++)` counts 0 to 7; inside, `c` counts 0 to 7 for each row.
- Cell `(r, c)` starts at `x = LEFT + c * SIZE`, `y = TOP + r * SIZE`.
- `%` is the remainder: `(r + c) % 2` is 0 on every other cell, so the colors alternate like a chessboard.
- `condition ? a : b` picks `a` if the condition is true, otherwise `b`.

# --meaning-tr--

- `for (let r = 0; r < N; r++) {` → sayan döngü: `r` 0'dan başlar, `N`'den (8) küçük olduğu sürece içi çalışır,
  her turdan sonra `r++` ile 1 artar. İçindeki `c` döngüsü her satır için 0'dan 7'ye sayar: toplam 64 tur.
- `const x = LEFT + c * SIZE` → `c`. sütunun sol kenarı; `const y = TOP + r * SIZE` → `r`. satırın üst kenarı.
- `(r + c) % 2 === 0` → `%` **bölümden kalan**: `(r + c) % 2` satır + sütun çiftse 0, tekse 1. Komşu hücrelerde
  hep değişir: dama deseni.
- `koşul ? a : b` → koşul doğruysa `a`, değilse `b`. Çiftse koyu, tekse biraz açık mor.
- `ctx.fillRect(x, y, SIZE, SIZE)` → 48 × 48'lik kare.

# --task--

At the very end, leave an empty line and write the two loops.

# --task-tr--

1. Dosyanın **en sonuna**, bir boş satırdan sonra iki döngüyü yaz.
2. **Çalıştır**: ortada damalı, 8 × 8'lik bir ızgara görmelisin.

# --try--

Change `% 2` to `% 3` and run: a diagonal pattern. Put `% 2` back.

# --try-tr--

`% 2` yerine `% 3` yaz ve çalıştır: çapraz bir desen. Sonra `% 2`'ye geri al.

# --tests--

There should be 64 squares, in two alternating shades.
tr: İki tonu sırayla değişen 64 kare olmalı.

```js
const squares = $.rects().filter((r) => r.w === 48 && r.h === 48)
assert.lengthOf(squares, 64)
assert.deepInclude(squares, { x: 8, y: 72, w: 48, h: 48, color: '#312e81' })
assert.deepInclude(squares, { x: 56, y: 72, w: 48, h: 48, color: '#3730a3' })
assert.deepInclude(squares, { x: 344, y: 408, w: 48, h: 48, color: '#312e81' }, 'the last cell, row 7 and column 7')
```

# --solution--

```js
// Match three, step by step.
// The page already has <canvas id="game" width="400" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const N = 8 // 8 by 8 gems
const SIZE = 48
const LEFT = (canvas.width - N * SIZE) / 2
const TOP = 72 // room for the score and the moves left

ctx.fillStyle = '#1e1b4b'
ctx.fillRect(0, 0, canvas.width, canvas.height)

for (let r = 0; r < N; r++) {
  for (let c = 0; c < N; c++) {
    const x = LEFT + c * SIZE
    const y = TOP + r * SIZE
    ctx.fillStyle = (r + c) % 2 === 0 ? '#312e81' : '#3730a3'
    ctx.fillRect(x, y, SIZE, SIZE)
  }
}
```

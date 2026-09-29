---
title: Color and kind
title_tr: Renk ve tür
skills: [prog.arrays, prog.types]
---

# --goal--

A single letter hides the color in its case. We turn each letter into two: the color (`'w'` or `'b'`) and the kind in
capitals, like `'wN'` or `'bQ'`. An empty square becomes `''`.

# --goal-tr--

`'n'` ile `'N'` arasındaki fark (siyah at, beyaz at) harfin büyük-küçük olmasında gizli. Bu, kodda sürekli sorulacak
bir soru: "bu taş kimin?" Soruyu kolaylaştırmak için her taşı **iki harfle** tutacağız: önce **renk**, sonra **tür**.

- `'wN'` → beyaz at (white kNight), `'bQ'` → siyah vezir (black Queen).
- Boş kare → `''` (boş metin).

Böylece `piece[0]` rengi, `piece[1]` türü verecek.

# --code--

```js
  board = START.map((line) => [...line].map((ch) => (ch === '.' ? '' : (ch === ch.toUpperCase() ? 'w' : 'b') + ch.toUpperCase())))
```

# --meaning--

- The inner `map` runs on each letter `ch` of a row.
- A dot becomes `''`. Otherwise: if `ch` equals its capital form it is white (`'w'`), else black (`'b'`); then `+`
  adds the kind in capitals.
- `'n'` → `'b' + 'N'` → `'bN'`.

# --meaning-tr--

Bu uzun satırı **içten dışa** oku:

- `[...line].map((ch) => ...)` → sıranın harflerinden yeni bir dizi yapar; her harfin adı `ch` (character).
- `ch === '.' ? '' : ...` → harf nokta ise boş kare `''`. `===` "tam olarak eşit mi?" diye sorar.
- `ch.toUpperCase()` → harfin **büyüğünü** verir: `'n'` → `'N'`.
- `ch === ch.toUpperCase() ? 'w' : 'b'` → harf büyüğüne eşitse zaten büyüktür, yani **beyazdır**; değilse siyah.
- `+ ch.toUpperCase()` → metinlerde `+` **yan yana ekler**: `'b' + 'N'` → `'bN'`.

Örnek: `'n'` → nokta değil → büyüğüne eşit değil → `'b'` → `'b' + 'N'` = `'bN'`.

Bir taşın parçalarına sonra böyle ulaşacağız: metinlerde de sayma **0'dan** başlar, `'bN'[0]` → `'b'`, `'bN'[1]` →
`'N'`.

# --task--

Replace the line inside `reset` with the new one.

# --task-tr--

1. `reset` fonksiyonunun içindeki `board = START.map((line) => [...line])` satırını bu uzun satırla değiştir.
   (Aslında `[...line]`'dan sonra `.map(...)` kısmını eklemek yeterli.) Parantezleri sayarak yaz.
2. **Çalıştır**: ekran yine aynı; kontroller yeşil olmalı.

# --hint--

Count the parentheses: the line ends with four `)`.

# --hint-tr--

Parantezleri say: satır dört tane `)` ile biter. `toUpperCase` içinde büyük `U` ve `C` var ve sonunda `()`
unutulmamalı.

# --tests--

The board should start in the starting position.
tr: Tahta başlangıç dizilişinde başlamalı.

```js
assert.deepEqual(board[7], ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR'])
assert.deepEqual(board[0], ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'])
assert.deepEqual(board[6], Array(8).fill('wP'))
assert.deepEqual(board[1], Array(8).fill('bP'))
assert.deepEqual(board[3], Array(8).fill(''))
```

# --solution--

```js
// Chess, step by step.
// The page already has <canvas id="game" width="480" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SQ = 56 // one square
const LEFT = 16
const TOP = 56 // room for the messages
// Row 0 is black's back rank at the top, row 7 white's at the bottom. Capitals are white.
const START = ['rnbqkbnr', 'pppppppp', '........', '........', '........', '........', 'PPPPPPPP', 'RNBQKBNR']

let board // board[row][col]: '' or a color and a kind, like 'wN' or 'bQ'

function reset() {
  board = START.map((line) => [...line].map((ch) => (ch === '.' ? '' : (ch === ch.toUpperCase() ? 'w' : 'b') + ch.toUpperCase())))
}

function draw() {
  ctx.fillStyle = '#1c1917'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const x = LEFT + c * SQ
      const y = TOP + r * SQ
      ctx.fillStyle = (r + c) % 2 === 0 ? '#e7d8b8' : '#b58863'
      ctx.fillRect(x, y, SQ, SQ)
    }
  }
}

reset()
draw()
```

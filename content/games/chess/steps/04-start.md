---
title: The starting position as text
title_tr: Metin olarak başlangıç dizilişi
skills: [prog.arrays]
---

# --goal--

The board needs data: what stands on each square. We write the starting position the way chess players do, one text
per row, and turn it into `board`: an array of 8 rows, each an array of 8 letters.

# --goal-tr--

Tahta çizildi ama üstünde ne olduğunu henüz bilmiyoruz. Oyunun **durumu** (hangi karede hangi taş var) çizimden ayrı,
bir **veride** tutulmalı.

Başlangıç dizilişini satranççıların yazdığı gibi yazacağız: her sıra 8 harflik bir metin. **Büyük harf beyaz, küçük
harf siyah, nokta boş kare.** Harfler İngilizce adların baş harfleri: `k` şah (king), `q` vezir (queen), `r` kale
(rook), `b` fil (bishop), `n` at (knight), `p` piyon (pawn).

Sonra bu metinleri **harf harf** ayırıp `board` (tahta) adında bir diziye koyacağız. Bu adımda ekran değişmez;
tahtanın verisini hazırlıyoruz.

# --code--

```js
// Row 0 is black's back rank at the top, row 7 white's at the bottom. Capitals are white.
const START = ['rnbqkbnr', 'pppppppp', '........', '........', '........', '........', 'PPPPPPPP', 'RNBQKBNR']

let board // board[row][col]: '' or a color and a kind, like 'wN' or 'bQ'

function reset() {
  board = START.map((line) => [...line])
}

reset()
draw()
```

# --meaning--

- `START` is an array of 8 texts, row 0 (black's pieces) first.
- `let board` is a variable that will hold the position; `reset()` fills it.
- `map` makes a new array by running a function on each item. `(line) => [...line]` is a short function that splits
  a text into its letters: `[...'rn.']` is `['r', 'n', '.']`.
- So `board[0][4]` is `'k'`: row 0, column 4, the black king.

# --meaning-tr--

- `const START = [ ... ]` → köşeli parantez bir **dizi** (sıralı liste) açar. İçinde 8 metin var; ilki (sıra 0)
  en üstteki siyah taşlar, sonuncusu (sıra 7) en alttaki beyazlar.
- `let board` → değeri **sonradan değişecek** bir değişken. Taşlar oynadıkça tahta değişeceği için `let`. Şimdilik
  boş; `reset` dolduracak.
- `function reset() {` → tahtayı **başlangıca döndüren** fonksiyon. Yeni oyunda da onu çağıracağız.
- `START.map(...)` → `map` dizinin **her elemanı için** verilen fonksiyonu çalıştırır ve cevaplardan **yeni bir
  dizi** yapar. 8 metin girer, 8 sonuç çıkar.
- `(line) => [...line]` → **ok fonksiyonu**: adsız, kısa bir fonksiyon. `line` o anki metin; `=>` sonrası cevabı.
  `[...line]` metni **harflerine ayırır**: `[...'rn.']` → `['r', 'n', '.']`.
- Sonuç: `board` 8 sıralık bir dizi, her sıra da 8 harflik bir dizi. `board[0][4]` → sıra 0, sütun 4: `'k'`.
- En alttaki `reset()` → oyun başlarken tahtayı kurar; `draw()`'dan **önce** gelmeli.

# --task--

1. Under the `TOP` line write `START`, `board` and `reset` (with the empty lines).
2. Above the `draw()` call at the bottom write `reset()`.

# --task-tr--

1. `const TOP = 56 ...` satırının **altına** yorum satırını ve `START` dizisini yaz; bir boş satırdan sonra `let board`
   satırını, bir boş satırdan sonra `reset` fonksiyonunu yaz. `START` satırını dikkatle yaz: her metin tam 8 karakter.
2. En alttaki `draw()` satırının **üstüne** `reset()` yaz.
3. **Çalıştır**: ekran aynı kalır, kontroller yeşil olmalı.

# --hint--

Each text in `START` must be exactly 8 characters; count the dots in the empty rows.

# --hint-tr--

`START` içindeki her metin tam 8 karakter olmalı; boş sıralardaki noktaları say. Bir de `reset()`'in `draw()`'dan
önce çağrıldığından emin ol.

# --tests--

`board` should hold the starting position, one letter per square.
tr: `board` başlangıç dizilişini, kare başına bir harfle tutmalı.

```js
assert.lengthOf(board, 8)
assert.deepEqual(board[0], ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'])
assert.deepEqual(board[6], Array(8).fill('P'))
assert.deepEqual(board[3], Array(8).fill('.'))
```

`reset()` should rebuild the board from `START`.
tr: `reset()` tahtayı `START`'tan yeniden kurmalı.

```js
board[7][0] = 'x'
reset()
assert.strictEqual(board[7][0], 'R')
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
  board = START.map((line) => [...line])
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

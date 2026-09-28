---
title: The board and the pieces
title_tr: Tahta ve taşlar
skills: [prog.arrays, game.canvas]
---

# --explanation--

A chess board is an 8 by 8 grid, and each square is empty or holds one piece. Store each piece as a short string: its
**color** and its **kind**, like `'wN'` (white knight) or `'bQ'` (black queen). An empty square is `''`. Then
`piece[0]` is the color and `piece[1]` the kind, and comparing pieces is just comparing strings.

The starting position is easiest to write the way chess players do: one string per row, capitals for white, small letters
for black, dots for empty squares.

```js
'rnbqkbnr'   // row 0: black's back rank, at the top
'PPPPPPPP'   // row 6: white's pawns
```

The pieces are drawn with chess symbols from Unicode (`♚ ♛ ♜ ♝ ♞ ♟`). The same filled symbols are used for both sides,
colored white or black. White pieces also get a dark outline so they stand out on light squares: the outline is drawn
**first** and the white fill on top, otherwise the outline would cover the thin parts of the symbol.

# --explanation-tr--

**Bu adımda:** satranç tahtasını ve taşları başlangıç dizilişinde çizeceğiz. Sağda açık ve koyu karelerden oluşan
8×8 bir tahta, üstte siyah, altta beyaz taşlar göreceksin.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya, satır satır** okur. `//` ile başlayan kısımlar **yorumdur**:
bilgisayar atlar, sadece insanlar için not.

**Canvas ve fırça.** Sayfada 480×520 piksellik boş bir resim alanı (`canvas`, kimliği `game`) var. Önce onu buluruz,
sonra çizim aracını (context) alırız:

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')
```

`const` bir şeye kalıcı bir ad (**sabit**) verir: kutuya etiket yapıştırmak gibi. Nokta (`.`) "bunun içindeki şu
komut" demektir, tırnak içi (`'game'`) bir **yazıdır** (metin). `ctx.fillStyle = renk` fırçaya renk sürer,
`ctx.fillRect(x, y, en, boy)` dikdörtgen boyar. Canvas'ın **sol üst köşesi** `(0, 0)`'dır; `x` sağa, `y` **aşağı**
doğru büyür.

**Taşı kısa bir yazıyla tutmak.** Her taş iki harflik bir yazıdır: önce **rengi**, sonra **türü**. `'wN'` beyaz at
(white kNight), `'bQ'` siyah vezir (black Queen). Boş kare `''` (boş yazı). Yazının harflerine sırayla ulaşılır ve
sayma **0'dan** başlar: `piece[0]` renk (`'w'` ya da `'b'`), `piece[1]` tür (`K` şah, `Q` vezir, `R` kale, `B` fil,
`N` at, `P` piyon).

**Tahta = dizilerden bir dizi.** Köşeli parantez `[ ]` bir **dizidir** (array): sıralı bir liste. `board` 8 satırlık
bir liste, her satır da 8 karelik bir liste. `board[7][3]` 8. satırın 4. karesi (beyaz vezirin yeri). Satır 0 en
üstte (siyahın arka sırası), satır 7 en altta.

**Başlangıç dizilişi** satranççıların yazdığı gibi, satır başına bir yazıyla verilir: büyük harf beyaz, küçük harf
siyah, nokta boş kare.

```js
'rnbqkbnr'   // satır 0: siyahın arka sırası, en üstte
'PPPPPPPP'   // satır 6: beyazın piyonları
```

**Yeni parçalar:**

- **Değişken:** `let board` içi sonradan değişebilen bir kutu. **Nesne** (object) `{ K: '♚', ... }` ise `ad: değer`
  çiftlerinden oluşur; `GLYPHS['K']` ya da `GLYPHS.K` → `'♚'`.
- **Fonksiyon:** `function reset() { ... }` bir talimat grubuna ad verir (tanımlar), `reset()` onu çalıştırır
  (çağırır).
- **`dizi.map((x) => ...)`**: her eleman için yeni bir değer üretir ve yeni bir dizi yapar. `=>` ile yazılan şey
  kısa, adsız bir fonksiyondur. `[...line]` bir yazıyı harflerine ayırır: `[...'rn.']` → `['r', 'n', '.']`.
- **`koşul ? a : b`**: "doğruysa `a`, değilse `b`". `===` "eşit mi?" demektir. `ch.toUpperCase()` harfin büyüğünü
  verir; harf büyüğüne eşitse zaten büyüktür, yani beyazdır. `+` iki yazıyı yan yana ekler: `'w' + 'N'` → `'wN'`.
- **İç içe döngü:** `for (let r = 0; r < 8; r++)` `r`'yi 0'dan 7'ye kadar sayar (`r++` 1 artırır). İçinde bir de `c`
  döngüsü olduğu için 8 × 8 = 64 kareyi tek tek geziriz.
- **`%` (kalan):** `(r + c) % 2` toplam çiftse 0, tekse 1 verir; kareler böylece açık-koyu sırayla değişir.
- **`if (piece) { ... }`**: `piece` boş yazı değilse (karede taş varsa) içeriyi yap.
- **Yazı çizmek:** taşlar Unicode satranç sembolleriyle (`♚ ♛ ♜ ♝ ♞ ♟`) yazılır. `ctx.font` yazı tipi,
  `textAlign = 'center'` ve `textBaseline = 'middle'` yazıyı verilen noktanın tam ortasına koyar.
  `ctx.fillText(yazı, x, y)` dolu yazar, `ctx.strokeText(...)` sadece dış çizgisini çizer.

İki taraf da aynı dolu sembolleri kullanır, sadece rengi farklıdır. Beyaz taşlar açık karelerde kaybolmasın diye
koyu bir dış çizgi alır. Dış çizgi **önce**, beyaz dolgu **üstüne** çizilir; yoksa çizgi sembolün ince yerlerini
örterdi.

**Oyun döngüsü:** `requestAnimationFrame(loop)` tarayıcıya "sonraki ekran yenilemesinde `loop`'u çağır" der; `loop`
çizer ve kendini tekrar ister (saniyede yaklaşık 60 kez).

# --task--

1. Add `SQ = 56`, `LEFT = 16`, `TOP = 56`, `GLYPHS = { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' }` and the `START`
   rows (row 0 is black's back rank at the top, capitals are white):

   ```js
   const START = ['rnbqkbnr', 'pppppppp', '........', '........', '........', '........', 'PPPPPPPP', 'RNBQKBNR']
   ```

2. `reset()` builds `board` from `START`: `''` for a dot, otherwise `'w'` or `'b'` (capital or not) followed by the letter in
   capitals.
3. Draw every frame: a `'#1c1917'` background and the 64 squares from `(LEFT, TOP)`, `'#e7d8b8'` when `row + col` is even and
   `'#b58863'` otherwise. Draw each piece's glyph centered in its square (`'44px serif'`, at `y + SQ / 2 + 3` with a
   `'middle'` baseline): white pieces first get a `'#0f172a'` outline (`strokeText`, `lineWidth` 3), then every piece is filled,
   `'#f8fafc'` for white and `'#0f172a'` for black.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** canvas'ı ve fırçayı alan iki satırı yaz:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir satır boşluk bırakıp ölçüleri, sembolleri ve başlangıç dizilişini ekle:

   ```js
   const SQ = 56 // one square
   const LEFT = 16
   const TOP = 56 // room for the messages
   const GLYPHS = { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' }
   // Row 0 is black's back rank at the top, row 7 white's at the bottom. Capitals are white.
   const START = ['rnbqkbnr', 'pppppppp', '........', '........', '........', '........', 'PPPPPPPP', 'RNBQKBNR']
   ```

   Sembolleri buradan kopyalayıp yapıştırabilirsin. `SQ` bir karenin eni, `LEFT` ve `TOP` tahtanın sol ve üst
   boşluğu.

3. Altına tahtayı ve onu başlangıç dizilişinden kuran `reset()` fonksiyonunu yaz:

   ```js
   let board // board[row][col]: '' or a color and a kind, like 'wN' or 'bQ'

   function reset() {
     board = START.map((line) => [...line].map((ch) => (ch === '.' ? '' : (ch === ch.toUpperCase() ? 'w' : 'b') + ch.toUpperCase())))
   }
   ```

   Bu uzun satırı içten dışa oku: her harf `ch` için nokta ise `''`, değilse renk (`'w'`/`'b'`) + büyük harfli tür.
   Bunu her satırın her harfi için yapar.

4. Altına `draw()` fonksiyonunu yaz. Arka planı boyar, 64 kareyi gezer, her kareyi boyar ve içinde taş varsa onu
   çizer:

   ```js
   function draw() {
     ctx.fillStyle = '#1c1917'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     for (let r = 0; r < 8; r++) {
       for (let c = 0; c < 8; c++) {
         const x = LEFT + c * SQ
         const y = TOP + r * SQ
         ctx.fillStyle = (r + c) % 2 === 0 ? '#e7d8b8' : '#b58863'
         ctx.fillRect(x, y, SQ, SQ)
         const piece = board[r][c]
         if (piece) {
           ctx.font = '44px serif'
           ctx.textAlign = 'center'
           ctx.textBaseline = 'middle'
           // White pieces get a dark outline, drawn first so the white fill goes on top of it.
           if (piece[0] === 'w') {
             ctx.strokeStyle = '#0f172a'
             ctx.lineWidth = 3
             ctx.strokeText(GLYPHS[piece[1]], x + SQ / 2, y + SQ / 2 + 3)
           }
           ctx.fillStyle = piece[0] === 'w' ? '#f8fafc' : '#0f172a'
           ctx.fillText(GLYPHS[piece[1]], x + SQ / 2, y + SQ / 2 + 3)
         }
       }
     }
   }
   ```

   `x + SQ / 2` karenin ortası; `+ 3` sembolü gözle ortalamak için biraz aşağı iter.

5. En alta döngüyü ve başlatma satırlarını ekle:

   ```js
   function loop() {
     draw()
     requestAnimationFrame(loop)
   }

   reset()
   requestAnimationFrame(loop)
   ```

6. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sol üst köşesi açık renkli bir tahta ve başlangıç dizilişindeki taşlar
   görünmeli; alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa her `(`, `[` ve `{` işaretinin kapandığını
   ve `START` yazılarının 8'er harf olduğunu kontrol et.

# --tests--

The board should start in the starting position.
tr: Tahta başlangıç konumunda başlamalı.

```js
assert.deepEqual(board[7], ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR'])
assert.deepEqual(board[0], ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'])
assert.deepEqual(board[6], Array(8).fill('wP'))
assert.deepEqual(board[3], Array(8).fill(''))
```

The squares should alternate, with a light square in the top left corner.
tr: Kareler sırayla değişmeli, sol üst köşede açık bir kare olmalı.

```js
$.tick(1)
const light = $.rects('#e7d8b8')
assert.lengthOf(light, 32)
assert.lengthOf($.rects('#b58863'), 32)
assert.deepEqual([light[0].x, light[0].y, light[0].w], [16, 56, 56])
```

Each piece should be drawn with its glyph in its square.
tr: Her taş karesinde simgesiyle çizilmeli.

```js
$.tick(1)
const glyphs = $.screen().filter((c) => c.op === 'fillText')
assert.lengthOf(glyphs, 32)
assert.strictEqual(glyphs.filter((c) => c.args[0] === '♚').length, 2)
const queen = glyphs.find((c) => c.args[0] === '♛' && c.args[2] === 479)
assert.strictEqual(queen.args[1], 212, 'the white queen on d1')
assert.strictEqual(queen.fill, '#f8fafc')
const outlines = $.screen().filter((c) => c.op === 'strokeText')
assert.lengthOf(outlines, 16, 'only the white pieces get an outline')
const calls = $.screen()
const first = calls.findIndex((c) => c.op === 'strokeText')
assert.strictEqual(calls.slice(first).find((c) => c.op === 'fillText').args[1], outlines[0].args[1], 'outline first, then the fill')
```

# --seed--

```js
// Chess, step by step.
// The page already has <canvas id="game" width="480" height="520"></canvas>.
// Write your code below.
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
const GLYPHS = { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' }
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
      const piece = board[r][c]
      if (piece) {
        ctx.font = '44px serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        // White pieces get a dark outline, drawn first so the white fill goes on top of it.
        if (piece[0] === 'w') {
          ctx.strokeStyle = '#0f172a'
          ctx.lineWidth = 3
          ctx.strokeText(GLYPHS[piece[1]], x + SQ / 2, y + SQ / 2 + 3)
        }
        ctx.fillStyle = piece[0] === 'w' ? '#f8fafc' : '#0f172a'
        ctx.fillText(GLYPHS[piece[1]], x + SQ / 2, y + SQ / 2 + 3)
      }
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```

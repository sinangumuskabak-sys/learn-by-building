---
title: Click to play
title_tr: Tıklayarak oyna
skills: [game.input]
---

# --explanation--

A click event tells you where the mouse was, but in **page** coordinates (`event.clientX`, `event.clientY`), not
canvas coordinates. Two things can differ:

1. **Position**: the canvas does not start at the page's top-left corner. Subtract where it starts.
2. **Scale**: the canvas is 300 pixels wide inside, but it may be *displayed* bigger or smaller (here it is stretched
   to fit the game panel). Multiply by `canvas.width / displayedWidth`.

`canvas.getBoundingClientRect()` gives you both, where the canvas is on screen and how big it is displayed:

```js
const rect = canvas.getBoundingClientRect()
const x = (event.clientX - rect.left) * (canvas.width / rect.width)
const y = (event.clientY - rect.top) * (canvas.height / rect.height)
```

Skipping the scale step is a very common bug: clicks work perfectly on your screen and land in the wrong cell on a
phone. From the canvas point, the cell is `Math.floor(x / CELL)` and `Math.floor(y / CELL)`, then the index formula
from the previous step.

This game has no animation, so it needs **no game loop**. Nothing changes between clicks, so just call `draw()`
after every change. Turn-based games (chess, cards, puzzles) are usually built this way.

# --explanation-tr--

**Bu adımda:** tahtaya tıklayarak oynayacağız. Çalıştırıp bir kutuya tıklayınca orada X belirecek, sonraki
tıklamada O; sıra her seferinde değişecek. Dolu bir kutuya tıklamak hiçbir şey yapmayacak.

**Sıra kimde?** Bu da bir durum bilgisi: `let player = 'X'`. X oynayınca `'O'` olur, O oynayınca `'X'`.

**Değer döndüren fonksiyon.** Bir fonksiyon işini bitirince çağırana bir cevap verebilir. Buna **dönüş değeri**
denir ve `return` ile verilir:

```js
function play(index) {
  if (board[index] !== '') return false
  board[index] = player
  player = player === 'X' ? 'O' : 'X'
  return true
}
```

Bunu parça parça okuyalım:

- `play(index)` → fonksiyon bir kutu numarası alır (parametre, 2. adımdaki gibi).
- `!==` → "eşit **değil** mi?" (`===`'in tersi). "Kutu boş değilse..."
- `return false` → "...hamle olmadı" cevabını ver ve çık. `true` (doğru) ve `false` (yanlış) evet/hayır
  cevaplarıdır; tırnaksız yazılır.
- `board[index] = player` → kutuya sırası gelen oyuncunun işaretini koy. Tek `=` değiştirir.
- `player = player === 'X' ? 'O' : 'X'` → "X ise O yap, değilse X yap": sırayı değiştir.
- `return true` → "hamle oldu" cevabı.

**Olay (event).** Tarayıcı, sayfada bir şey olunca (tıklama, tuşa basma) bunu duyurur. Sen de "şu olunca şunu
yap" diye kayıt olursun. Kapı zili gibi: zil çalınca kapıya gidersin.

```js
canvas.addEventListener('click', (event) => {
  // canvas'a her tıklandığında burası çalışır
})
```

`'click'` olayın adı, `(event) => { ... }` olunca çalışacak fonksiyon. `event` tıklama hakkında bilgi taşır.

**Tıklama nereye denk geldi?** `event.clientX` ve `event.clientY` farenin yerini verir ama **sayfaya göre**,
canvas'a göre değil. İki şey farklı olabilir:

1. **Konum:** canvas sayfanın sol üst köşesinde başlamıyor. Başladığı yeri çıkarmak gerekir.
2. **Ölçek:** canvas içeride 300 piksel ama ekranda daha büyük ya da küçük **gösterilebilir** (burada oyun paneline
   sığacak şekilde büyütülüyor). `canvas.width / gösterilenGenişlik` ile çarpmak gerekir.

`canvas.getBoundingClientRect()` ikisini de verir: canvas ekranda nerede (`left`, `top`) ve ne kadar büyük
gösteriliyor (`width`, `height`):

```js
const rect = canvas.getBoundingClientRect()
const x = (event.clientX - rect.left) * (canvas.width / rect.width)
const y = (event.clientY - rect.top) * (canvas.height / rect.height)
```

Parantezler matematikteki gibi önce hesaplanır. Ölçek adımını atlamak çok yaygın bir hatadır: senin ekranında
tıklamalar doğru çalışır, telefonda yanlış kutuya düşer.

Canvas üstündeki noktadan kutuya geçmek kolay: sütun `Math.floor(x / CELL)`, satır `Math.floor(y / CELL)`, sonra
2. adımdaki formül: `satır * 3 + sütun`.

**Oyun döngüsü yok.** Bu oyunda hareket eden bir şey yok; iki tıklama arasında hiçbir şey değişmez. O yüzden her
değişiklikten sonra `draw()`'u çağırmak yeter. Satranç, kart ve bulmaca oyunları genelde böyle yazılır.

# --task--

1. Add `let player = 'X'` (whose turn it is).
2. Write `function play(index)`: if `board[index]` is not empty, return `false`. Otherwise put `player` there, switch
   `player` to the other mark, and return `true`.
3. Listen for `click` on the canvas: convert the click to canvas coordinates with `getBoundingClientRect()` (position
   **and** scale), work out the cell index, call `play(index)`, then `draw()`.

# --task-tr--

1. `let board = [...]` satırının hemen altına şunu ekle:

   ```js
   let player = 'X'
   ```

2. Bir satır boşluk bırak ve hamle fonksiyonunu yaz (`function draw()` satırından önce):

   ```js
   function play(index) {
     if (board[index] !== '') return false
     board[index] = player
     player = player === 'X' ? 'O' : 'X'
     return true
   }
   ```

3. Bir satır boşluk bırak ve tıklamayı dinleyen kodu yaz (yine `function draw()`'dan önce):

   ```js
   canvas.addEventListener('click', (event) => {
     // The canvas may be displayed at a different size than its 300×300 pixels, so scale the click.
     const rect = canvas.getBoundingClientRect()
     const x = (event.clientX - rect.left) * (canvas.width / rect.width)
     const y = (event.clientY - rect.top) * (canvas.height / rect.height)
     const index = Math.floor(y / CELL) * 3 + Math.floor(x / CELL)
     play(index)
     draw()
   })
   ```

   `//` ile başlayan satır yorumdur, yazmasan da olur. `draw` aşağıda tanımlı olsa da sorun değil: tıklama
   olduğunda bütün dosya çoktan okunmuş olur.

4. **Çalıştır**'a bas. Oynamak için tahtadaki kutulara tıkla: sırayla pembe X ve mavi O belirmeli, dolu kutuya
   tıklamak bir şey değiştirmemeli. Alttaki kontrollerin hepsi yeşil olmalı. "Tıklamalar ölçeklenmeli" kontrolü
   kırmızıysa `x` ve `y` satırlarındaki `* (canvas.width / rect.width)` kısımlarını kontrol et.

# --tests--

`play()` should place the current mark, switch turns and refuse taken cells.
tr: `play()` o anki işareti koymalı, sırayı değiştirmeli ve dolu hücreleri reddetmeli.

```js
assert.strictEqual(player, 'X')
assert.isTrue(play(4))
assert.strictEqual(board[4], 'X')
assert.strictEqual(player, 'O')
assert.isFalse(play(4))
assert.strictEqual(board[4], 'X')
assert.strictEqual(player, 'O')
```

Clicking a cell should play there and redraw.
tr: Bir hücreye tıklamak oraya oynamalı ve yeniden çizmeli.

```js
$.click(150, 150)
$.click(50, 250)
assert.strictEqual(board[4], 'X')
assert.strictEqual(board[6], 'O')
assert.includeMembers($.texts(), ['X', 'O'])
```

Clicks should be scaled when the canvas is displayed at a different size.
tr: Canvas farklı boyutta gösterildiğinde tıklamalar ölçeklenmeli.

```js
// Pretend the canvas is shown twice as big, starting 10px from the left of the page.
$.canvas.getBoundingClientRect = () => ({ left: 10, top: 0, x: 10, y: 0, width: 600, height: 600, right: 610, bottom: 600 })
$.click(10 + 590, 10)
assert.strictEqual(board[2], 'X', 'a click near the right edge of the big canvas is the top-right cell')
```

# --solution--

```js
// Tic-tac-toe, step by step.
// The page already has <canvas id="game" width="300" height="300"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 100

let board = ['', '', '', '', '', '', '', '', '']
let player = 'X'

function play(index) {
  if (board[index] !== '') return false
  board[index] = player
  player = player === 'X' ? 'O' : 'X'
  return true
}

canvas.addEventListener('click', (event) => {
  // The canvas may be displayed at a different size than its 300×300 pixels, so scale the click.
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  const y = (event.clientY - rect.top) * (canvas.height / rect.height)
  const index = Math.floor(y / CELL) * 3 + Math.floor(x / CELL)
  play(index)
  draw()
})

function draw() {
  ctx.fillStyle = '#1e1e2e'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#585b70'
  for (let i = 1; i < 3; i++) {
    ctx.fillRect(i * CELL - 2, 0, 4, canvas.height)
    ctx.fillRect(0, i * CELL - 2, canvas.width, 4)
  }

  ctx.font = 'bold 64px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  board.forEach((mark, index) => {
    if (mark === '') return
    ctx.fillStyle = mark === 'X' ? '#f38ba8' : '#89b4fa'
    const x = (index % 3) * CELL + CELL / 2
    const y = Math.floor(index / 3) * CELL + CELL / 2
    ctx.fillText(mark, x, y)
  })
}

draw()
```

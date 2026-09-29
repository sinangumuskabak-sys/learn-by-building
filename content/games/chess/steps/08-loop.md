---
title: Draw again and again
title_tr: Tekrar tekrar çiz
skills: [game.loop]
---

# --goal--

Soon the pieces will move, and the picture must follow the data. A game loop redraws the board before every screen
refresh, about 60 times a second, with `requestAnimationFrame`.

# --goal-tr--

Birazdan taşlar oynayacak; yani `board` değişecek. Ama resim yalnız bir kez, başta çizildi. Resmin veriyi hep takip
etmesi için bir **oyun döngüsü** kuracağız: tarayıcı ekranı her yenilemeden önce (saniyede yaklaşık **60 kez**) tahtayı
baştan çizecek.

Ekranda fark göremeyeceksin; ama artık `board`'da ne değişirse bir sonraki karede ekrana yansıyacak.

# --code--

```js
function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```

# --meaning--

- `requestAnimationFrame(loop)` asks the browser to run `loop` before the next screen refresh.
- `loop` draws and asks for itself again, so it never stops.
- The last line starts it, replacing the single `draw()` call.

# --meaning-tr--

- `function loop() {` → döngünün **bir turu**: çiz, sonra bir sonrakini iste.
- `requestAnimationFrame(loop)` → tarayıcıya "ekranı bir sonraki yenilemeden önce **loop'u yine** çalıştır" der.
  Fonksiyon kendi devamını istediği için döngü hiç durmaz.
- En alttaki `requestAnimationFrame(loop)` → döngüyü **başlatır**. Eski tek seferlik `draw()` çağrısının yerini
  alır.

# --task--

Replace the `draw()` call at the bottom with `loop` and `requestAnimationFrame(loop)`; keep `reset()` above it.

# --task-tr--

1. En alttaki `draw()` satırını sil.
2. `reset()` satırının **üstüne** `loop` fonksiyonunu yaz (altında bir boş satır kalsın).
3. `reset()` satırının **altına** `requestAnimationFrame(loop)` yaz.
4. **Çalıştır**: tahta aynı görünür, kontroller yeşil olmalı.

# --predict--

What changes on the screen after this step?
- [ ] The pieces start moving
- [x] Nothing you can see
  The same picture is drawn 60 times a second; it only matters once `board` changes.
- [ ] The board flickers

# --predict-tr--

Bu adımdan sonra ekranda ne değişir?
- [ ] Taşlar hareket etmeye başlar
- [x] Gözle görülür bir şey değişmez
  Aynı resim saniyede 60 kez çiziliyor; bunun faydası `board` değişince görülecek.
- [ ] Tahta titrer

# --tests--

The loop should keep running by requesting the next frame.
tr: Döngü bir sonraki kareyi isteyerek sürmeli.

```js
$.tick(3)
assert.strictEqual($.pendingFrames, 1)
```

A change in `board` should show up in the next frame.
tr: `board`'daki bir değişiklik bir sonraki karede görünmeli.

```js
$.tick(1)
board[4][4] = 'bQ'
$.tick(1)
const queen = $.screen().find((c) => c.op === 'fillText' && c.args[1] === 268 && c.args[2] === 311)
assert.strictEqual(queen && queen.args[0], '♛')
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

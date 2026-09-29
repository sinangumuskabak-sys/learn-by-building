---
title: Listen for clicks
title_tr: Tıklamayı dinle
skills: [game.input]
---

# --goal--

The player plays with the mouse. We ask the canvas to tell us about every click. As a first try, any click plays the
middle cell and redraws.

# --goal-tr--

Oyuncu fareyle oynayacak. Tarayıcıya "canvas'a **tıklanınca** bana haber ver" deriz. Buna **olay dinlemek** (event
listener) denir: kapı zili gibi; zil çalınca ne yapacağını önceden söylersin.

Önce basit bir deneme: nereye tıklanırsa tıklansın **orta kutuya** oynayalım ve tahtayı yeniden çizelim.

# --code--

```js
canvas.addEventListener('click', (event) => {
  play(4)
  draw()
})
```

# --meaning--

- `canvas.addEventListener('click', ...)` runs the function each time the canvas is clicked.
- `event` carries information about the click (we use it in the next step).
- `play(4)` makes a move in cell 4, `draw()` shows the new board.

# --meaning-tr--

- `canvas.addEventListener('click', (event) => { ... })` → "canvas'a her **tıklandığında** (click) süslü parantezin
  içini çalıştır". `(event) => { }` 10. adımda gördüğün kısa fonksiyon yazımı.
- `event` → tıklamanın bilgilerini taşır (farenin yeri gibi). Bir sonraki adımda kullanacağız.
- `play(4)` → 4 numaralı kutuya (orta) oyna.
- `draw()` → tahtayı yeniden çiz. Tahta değişince ekranı biz güncelleriz; kendiliğinden olmaz.
- Bu oyunda hareket eden bir şey yok, o yüzden sürekli çalışan bir **oyun döngüsüne** gerek yok. Tıklamadan sonra
  bir kez çizmek yeter. Satranç, kart ve bulmaca oyunları genelde böyle yazılır.

# --task--

Write the listener above `function draw() {`, under `play`, with empty lines around it. Run and click the board twice.

# --task-tr--

1. `play` fonksiyonunun altına, `function draw() {` satırının **üstüne** dinleyiciyi yaz; araya boş satırlar bırak.
2. `draw` fonksiyonu aşağıda tanımlı olsa da sorun değil: tıklama olduğunda bütün dosya çoktan okunmuş olur.
3. **Çalıştır** ve tahtaya iki kez tıkla.

# --predict--

You click the board twice. What happens?
- [ ] X in the middle, then O in the middle
- [x] X in the middle; the second click changes nothing
  The second click also calls `play(4)`, and `play` refuses the taken cell.
- [ ] Nothing: we never called `draw()`

# --predict-tr--

Tahtaya iki kez tıklıyorsun. Ne olur?
- [ ] Ortada X, sonra ortada O
- [x] Ortada X belirir; ikinci tıklama bir şey değiştirmez
  İkinci tıklama da `play(4)`'ü çağırır, `play` de dolu kutuyu reddeder.
- [ ] Hiçbir şey: `draw()`'u hiç çağırmadık

# --hint--

The event name is `'click'` in quotes, and the listener must be added to `canvas`.

# --hint-tr--

Olayın adı tırnak içinde `'click'`; dinleyici `canvas`'a eklenmeli: `canvas.addEventListener(...)`.

# --tests--

A click should play the middle cell and draw the X.
tr: Bir tıklama orta kutuya oynamalı ve X'i çizmeli.

```js
$.click(20, 20)
assert.strictEqual(board[4], 'X')
assert.include($.texts(), 'X')
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
  play(4)
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

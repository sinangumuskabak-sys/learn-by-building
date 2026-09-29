---
title: A color for each mark
title_tr: Her işarete bir renk
skills: [game.canvas]
---

# --goal--

X is pink and O is blue. The color now depends on the mark, so it moves inside the loop and is picked with a short
question: `condition ? yes : no`.

# --goal-tr--

X'ler pembe, O'lar **mavi** olsun. Renk artık işarete bağlı; bu yüzden renk seçimi döngünün **içine** giriyor ve her
kutu için yeniden soruluyor: "Bu X mi? Evetse pembe, değilse mavi."

Bunun için JavaScript'in kısa soru yazımını kullanacağız: `soru ? evet : hayır`.

# --code--

```js
board.forEach((mark, index) => {
  if (mark === '') return
  ctx.fillStyle = mark === 'X' ? '#f38ba8' : '#89b4fa'
```

# --meaning--

- `mark === 'X' ? '#f38ba8' : '#89b4fa'` means: if `mark` is X, pink, otherwise blue.
- The old `ctx.fillStyle = '#f38ba8'` above the loop is deleted: every mark now picks its own color.

# --meaning-tr--

- `mark === 'X' ? '#f38ba8' : '#89b4fa'` → soru işaretinden önce **soru**, iki noktanın iki yanında iki **cevap**.
  "`mark` X mi? Evetse `'#f38ba8'` (pembe), değilse `'#89b4fa'` (mavi)."
- `ctx.fillStyle = ...` → seçilen rengi kaleme verir. Her kutu için ayrı ayrı.
- Döngünün üstündeki eski `ctx.fillStyle = '#f38ba8'` satırı gidiyor: yoksa herkes pembe başlardı, gereksiz olurdu.

# --task--

1. Delete `ctx.fillStyle = '#f38ba8'` above `board.forEach`.
2. Inside the loop, under `if (mark === '') return`, write the new `fillStyle` line. Press **Run**.

# --task-tr--

1. `board.forEach(...)` satırının hemen üstündeki `ctx.fillStyle = '#f38ba8'` satırını sil.
2. Döngünün içinde, `if (mark === '') return` satırının **altına** yeni `fillStyle` satırını yaz.
3. **Çalıştır**: tahta boş olduğu için bir şey görünmez; kontroller X ile O'nun rengine bakacak.

# --try--

Put `'O'` in a few cells of `board` and run to see the blue marks. Put `''` back.

# --try-tr--

`board` dizisinde birkaç kutuya `'O'` ve `'X'` koyup çalıştır, renkleri gör. Sonra hepsini `''`'ye geri al.

# --tests--

X should be pink and O blue.
tr: X pembe, O mavi olmalı.

```js
board = ['X', 'O', '', '', '', '', '', '', '']
draw()
const colors = Object.fromEntries($.screen().filter((c) => c.op === 'fillText').map((c) => [c.args[0], c.fill]))
assert.deepEqual(colors, { X: '#f38ba8', O: '#89b4fa' })
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

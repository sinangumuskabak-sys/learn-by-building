---
title: A body made of a list
title_tr: Listeden bir gövde
skills: [prog.arrays]
---

# --goal--

A snake is more than a head: it is a list of cells. We keep them in an array and draw every one with a loop.

# --goal-tr--

Yılan tek bir kare değil, **arka arkaya dizilmiş karelerden** oluşur. Birden çok şeyi sırayla tutmak için
**dizi** (array) kullanırız: bir alışveriş listesi gibi.

Bu adımda yılanın üç parçasını bir diziye yazıp **hepsini çizeceğiz**. Hareketi bir sonraki adımda bağlayacağız.

# --code--

```js
let snake = [
  { x: 5, y: 5 },
  { x: 4, y: 5 },
  { x: 3, y: 5 },
]

  ctx.fillStyle = 'lime'
  for (const part of snake) {
    ctx.fillRect(part.x * CELL, part.y * CELL, CELL, CELL)
  }
```

# --meaning--

- `[ ... ]` is an array: a list in order. The first item (index 0) is the head.
- `for (const part of snake)` repeats its body once for each item, calling the current one `part`.

# --meaning-tr--

- `let snake = [ ... ]` → köşeli parantez bir **dizi** açar. İçinde virgülle ayrılmış üç nesne var: üç hücre.
  İlki (sıra numarası **0**) baş, sonuncusu kuyruk. Baş 5. sütunda, gövde 4 ve 3'te: yılan sağa bakıyor.
- `for (const part of snake) {` → **döngü**: "snake'teki her parça için, sırayla, bir kez yap". Her turda o anki
  parçanın adı `part` olur.
- `ctx.fillRect(part.x * CELL, ...)` → o parçayı çiz. Üç parça = üç tur = üç kare.

# --task--

1. Under `let head = ...` write the `snake` array.
2. In `draw`, replace the lime `fillRect` line with the `for` loop.

# --task-tr--

1. `let head = ...` satırının altına `snake` dizisini yaz.
2. `draw` içinde `ctx.fillStyle = 'lime'` satırının altındaki `ctx.fillRect(head.x ...)` satırını sil; yerine
   `for` döngüsünü (üç satır) yaz.
3. **Çalıştır**.

# --predict--

Will the snake move after this step?
- [ ] Yes, like before
- [x] No: `update` still moves `head`, but only `snake` is drawn now
- [ ] Only its head moves

# --predict-tr--

Bu adımdan sonra yılan hareket edecek mi?
- [ ] Evet, eskisi gibi
- [x] Hayır: `update` hâlâ `head`'i taşıyor ama artık yalnız `snake` çiziliyor
- [ ] Yalnız başı hareket eder

# --tests--

`snake` should start with three cells, head first, pointing right.
tr: `snake` üç hücreyle başlamalı, önce baş, sağa bakarak.

```js
assert.deepEqual(snake, [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }])
```

Every part of the snake should be drawn.
tr: Yılanın her parçası çizilmeli.

```js
$.tick()
const drawn = $.rects('lime').map((r) => ({ x: r.x / 20, y: r.y / 20 }))
assert.sameDeepMembers(drawn, snake)
```

# --solution--

```js
// Snake, step by step.
// The page already has <canvas id="game" width="400" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 20
const SPEED = 150 // milliseconds between moves
let head = { x: 5, y: 5 }
let snake = [
  { x: 5, y: 5 },
  { x: 4, y: 5 },
  { x: 3, y: 5 },
]
let dir = { x: 1, y: 0 }
let last = 0

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') dir = { x: 0, y: -1 }
  if (event.key === 'ArrowDown') dir = { x: 0, y: 1 }
  if (event.key === 'ArrowLeft') dir = { x: -1, y: 0 }
  if (event.key === 'ArrowRight') dir = { x: 1, y: 0 }
})

function update() {
  head.x += dir.x
  head.y += dir.y
}

function draw() {
  ctx.fillStyle = '#111'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'lime'
  for (const part of snake) {
    ctx.fillRect(part.x * CELL, part.y * CELL, CELL, CELL)
  }
}

function loop(time) {
  if (time - last >= SPEED) {
    last = time
    update()
  }
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```

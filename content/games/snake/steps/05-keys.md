---
title: Steer with the arrow keys
title_tr: Ok tuşlarıyla yönlendir
skills: [game.input]
---

# --explanation--

Right now the head can only go right. Instead of hard-coding the direction, store it as **state** too: how much `x`
and `y` change on each move.

```js
let dir = { x: 1, y: 0 }   // right
// up: { x: 0, y: -1 }   down: { x: 0, y: 1 }   left: { x: -1, y: 0 }
```

Remember that `y` grows downwards, so "up" is `y: -1`.

The player changes `dir` with the keyboard. The browser fires a `keydown` **event** every time a key is pressed; you
subscribe with `addEventListener` and read `event.key`:

```js
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') dir = { x: 0, y: -1 }
})
```

Notice the pattern: the event handler **only changes state**. It does not move or draw anything. The loop picks up
the new direction on its next update. Input, update and drawing stay separate.

# --explanation-tr--

Şu an baş yalnızca sağa gidebiliyor. Yönü koda gömmek yerine onu da **durum** olarak tut: her harekette `x` ve `y`
ne kadar değişecek.

```js
let dir = { x: 1, y: 0 }   // sağ
// yukarı: { x: 0, y: -1 }   aşağı: { x: 0, y: 1 }   sol: { x: -1, y: 0 }
```

`y`'nin aşağı doğru büyüdüğünü unutma; "yukarı" `y: -1` demektir.

Oyuncu `dir`'i klavyeyle değiştirir. Bir tuşa her basıldığında tarayıcı bir `keydown` **olayı** (event) üretir;
`addEventListener` ile abone olur ve `event.key` değerini okursun:

```js
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') dir = { x: 0, y: -1 }
})
```

Kalıba dikkat et: olay işleyici **yalnızca durumu değiştirir**. Hiçbir şeyi hareket ettirmez ya da çizmez. Döngü yeni
yönü bir sonraki güncellemede kullanır. Girdi, güncelleme ve çizim ayrı kalır.

# --task--

1. Add `let dir = { x: 1, y: 0 }` next to `head`.
2. Change `update()` so the head moves by `dir`: add `dir.x` to `head.x` and `dir.y` to `head.y`.
3. Listen for `keydown` on `document` and set `dir` for `ArrowUp`, `ArrowDown`, `ArrowLeft` and `ArrowRight`.

Run it and click the game so it receives your key presses.

# --task-tr--

1. `head`'in yanına `let dir = { x: 1, y: 0 }` ekle.
2. `update()` fonksiyonunu baş `dir` kadar hareket edecek şekilde değiştir: `head.x`'e `dir.x`, `head.y`'ye `dir.y`
   ekle.
3. `document` üzerinde `keydown` olayını dinle ve `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight` için `dir`'i
   ayarla.

Çalıştır ve tuşlarını alması için oyuna tıkla.

# --tests--

`dir` should start as `{ x: 1, y: 0 }` (moving right).
tr: `dir` başlangıçta `{ x: 1, y: 0 }` (sağa gidiş) olmalı.

```js
assert.deepEqual(dir, { x: 1, y: 0 })
```

`update()` should move the head by `dir`.
tr: `update()` başı `dir` kadar taşımalı.

```js
head = { x: 5, y: 5 }
dir = { x: 0, y: -1 }
update()
assert.deepEqual(head, { x: 5, y: 4 })
```

Each arrow key should set the matching direction.
tr: Her ok tuşu karşılık gelen yönü ayarlamalı.

```js
const expected = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
}
for (const [key, direction] of Object.entries(expected)) {
  $.press(key)
  assert.deepEqual(dir, direction, key)
}
```

Pressing ArrowDown should make the snake move down.
tr: ArrowDown'a basınca yılan aşağı gitmeli.

```js
$.press('ArrowDown')
$.run(1)
assert.strictEqual(head.x, 5)
assert.isAtLeast(head.y, 9)
```

Other keys should not change the direction.
tr: Diğer tuşlar yönü değiştirmemeli.

```js
$.press('a')
$.press(' ')
assert.deepEqual(dir, { x: 1, y: 0 })
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
  ctx.fillRect(head.x * CELL, head.y * CELL, CELL, CELL)
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

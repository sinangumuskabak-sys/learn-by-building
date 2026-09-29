---
title: A direction to move in
title_tr: Gidilecek yön
skills: [game.state]
---

# --goal--

The head always moves right because `update` adds 1 to `x`. We keep the direction in a variable `dir` instead,
so it can change.

# --goal-tr--

Baş hep sağa gidiyor, çünkü `update` her seferinde `x`'e 1 ekliyor. Yılanı döndürebilmek için **yönü** de bir
değişkende tutacağız: `dir` (direction, yön).

Yön de bir nesne: `x` yatay adım, `y` dikey adım. Sağa = `{ x: 1, y: 0 }`, yukarı = `{ x: 0, y: -1 }`.
(Hatırla: canvas'ta y aşağı doğru büyür, yani yukarı gitmek y'yi **azaltır**.)

# --code--

```js
let dir = { x: 1, y: 0 }

function update() {
  head.x += dir.x
  head.y += dir.y
}
```

# --meaning--

- `dir` holds how many cells to move each turn: `x: 1, y: 0` is one to the right.
- `update` adds `dir` to the head, so changing `dir` changes where the snake goes.

# --meaning-tr--

- `let dir = { x: 1, y: 0 }` → yön: her turda x'e 1, y'ye 0 ekle = **sağa**.
- `head.x += dir.x` → sütuna yönün x'ini ekle.
- `head.y += dir.y` → satıra yönün y'sini ekle.
- Artık `update` yönü bilmiyor; ne söylenirse onu yapıyor. `dir`'i değiştirmek yılanı döndürmek demek.

| Yön | dir |
|---|---|
| Sağ | `{ x: 1, y: 0 }` |
| Sol | `{ x: -1, y: 0 }` |
| Aşağı | `{ x: 0, y: 1 }` |
| Yukarı | `{ x: 0, y: -1 }` |

# --task--

1. Under `let head = ...` write `let dir = { x: 1, y: 0 }`.
2. In `update`, replace `head.x += 1` with the two lines using `dir`.

# --task-tr--

1. `let head = ...` satırının altına `let dir = { x: 1, y: 0 }` yaz.
2. `update` içindeki `head.x += 1` satırını sil; yerine `dir` kullanan iki satırı yaz.
3. **Çalıştır**: kare yine sağa gitmeli (yön sağ).

# --try--

Start with `dir = { x: 0, y: 1 }`: the square walks down. Put it back to the right.

# --try-tr--

`dir`'i `{ x: 0, y: 1 }` ile başlat: kare aşağı yürür. Sonra sağa geri al.

# --tests--

`dir` should start as `{ x: 1, y: 0 }` (moving right).
tr: `dir` başlangıçta `{ x: 1, y: 0 }` olmalı (sağa).

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

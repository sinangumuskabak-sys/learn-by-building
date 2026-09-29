---
title: Steer with the arrow keys
title_tr: Ok tuşlarıyla yönlendir
skills: [game.input]
---

# --goal--

Now the player takes control: when an arrow key is pressed, we change `dir`.

# --goal-tr--

Şimdi kontrol oyuncuda: bir **ok tuşuna** basılınca `dir`'i değiştireceğiz.

Tarayıcıya "bir tuşa basılınca bana haber ver" deriz. Buna **olay dinlemek** (event listener) denir: kapı
zili gibi, çalınca ne yapılacağını önceden söylersin.

# --code--

```js
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') dir = { x: 0, y: -1 }
  if (event.key === 'ArrowDown') dir = { x: 0, y: 1 }
  if (event.key === 'ArrowLeft') dir = { x: -1, y: 0 }
  if (event.key === 'ArrowRight') dir = { x: 1, y: 0 }
})
```

# --meaning--

- `addEventListener('keydown', ...)` runs the function each time a key goes down.
- `event.key` is the key's name, such as `'ArrowUp'`.
- Each `if` checks one arrow and sets the matching direction. `===` means "is exactly equal to".

# --meaning-tr--

- `document.addEventListener('keydown', (event) => { ... })` → "sayfada bir tuşa **basıldığında** (keydown)
  süslü parantez içini çalıştır". `(event) => { }` adı olmayan kısa bir fonksiyon; `event` basılan tuşun
  bilgilerini taşır.
- `event.key` → basılan tuşun adı: `'ArrowUp'` (yukarı ok), `'ArrowDown'`, `'ArrowLeft'`, `'ArrowRight'`.
- `if (event.key === 'ArrowUp') dir = { x: 0, y: -1 }` → **eğer** basılan tuş yukarı oksa, yönü yukarı yap.
  `===` "tam olarak eşit mi?" diye sorar (tek `=` ise "değer ver" demek, karıştırma).
- Dört satır dört yön için.

# --task--

Write the listener under `let last = 0`, after an empty line. Run, click the game and use the arrow keys.

# --task-tr--

1. `let last = 0` satırının altında bir boş satır bırak ve dinleyiciyi yaz.
2. **Çalıştır**, sonra oyuna bir kez tıkla (klavye oyuna gitsin) ve ok tuşlarıyla kareyi yönlendir.

# --hint--

Key names are case-sensitive: `'ArrowUp'` with a capital `A` and `U`.

# --hint-tr--

Tuş adlarında büyük/küçük harf önemli: `'ArrowUp'` büyük `A` ve büyük `U` ile.

# --tests--

Each arrow key should set the matching direction.
tr: Her ok tuşu kendi yönünü seçmeli.

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

Pressing ArrowDown should make the square move down.
tr: Aşağı ok basılınca kare aşağı gitmeli.

```js
$.press('ArrowDown')
$.run(1)
assert.strictEqual(head.x, 5)
assert.isAtLeast(head.y, 9)
```

Other keys should not change the direction.
tr: Başka tuşlar yönü değiştirmemeli.

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

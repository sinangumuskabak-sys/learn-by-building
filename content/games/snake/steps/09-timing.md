---
title: Slow it down
title_tr: Yavaşlat
skills: [game.loop]
---

# --goal--

The square is far too fast. We still draw every frame, but move only every 150 milliseconds.

# --goal-tr--

Kare çok hızlıydı, çünkü **her karede** hareket ediyordu. Çözüm: çizmeye her karede devam, ama **hareket etmeyi
yalnız 150 milisaniyede bir** yap (saniyede ~6-7 adım).

Bunun için saati kullanacağız: tarayıcı `loop`'a her seferinde **şu anki zamanı** verir. Son hareketten bu yana
150 ms geçtiyse hareket ederiz.

# --code--

```js
const SPEED = 150 // milliseconds between moves
let last = 0

function loop(time) {
  if (time - last >= SPEED) {
    last = time
    update()
  }
  draw()
  requestAnimationFrame(loop)
}
```

# --meaning--

- `SPEED` is the wait between moves; `last` remembers when we last moved.
- `loop(time)` receives the current time in milliseconds from the browser.
- `if (time - last >= SPEED)` is true only when enough time passed; then we note the time and move.

# --meaning-tr--

- `const SPEED = 150` → iki hareket arası bekleme: 150 milisaniye (1 saniye = 1000 ms). `//` sonrası bir
  **yorum**: bilgisayar okumaz, insan için not.
- `let last = 0` → **en son ne zaman hareket ettik**, onu hatırlar.
- `function loop(time)` → parantez içindeki `time`, tarayıcının verdiği **şu anki zaman** (ms).
- `if (time - last >= SPEED) {` → **eğer** son hareketten beri en az 150 ms geçtiyse, süslü parantez içini yap:
  - `last = time` → "şimdi hareket ettim" diye not al.
  - `update()` → hareket et.
- `draw()` if'in **dışında**: çizim yine her karede yapılır.

# --task--

1. Under `const CELL = 20` write the `SPEED` line; under `let head = ...` write `let last = 0`.
2. Change `loop` as shown: `time` in the parentheses and `update()` inside the `if`.

# --task-tr--

1. `const CELL = 20` satırının altına `SPEED` satırını yaz.
2. `let head = ...` satırının altına `let last = 0` yaz.
3. `loop` fonksiyonunu kodda görüldüğü gibi değiştir: parantez içine `time`, `update()` çağrısı `if`'in içine.
4. **Çalıştır**: kare artık sakin sakin sağa yürümeli (sonunda tahtadan çıkar; onu ileride düzelteceğiz).

# --try--

Set `SPEED` to `50`, then to `500`, and watch the difference. Put 150 back.

# --try-tr--

`SPEED`'i önce `50`, sonra `500` yap ve farkı izle. Sonra 150'ye geri al.

# --tests--

The head should not move every frame, only every `SPEED` milliseconds.
tr: Baş her karede değil, `SPEED` milisaniyede bir hareket etmeli.

```js
$.tick(5)
assert.strictEqual(head.x, 5)
```

After one second the head should have moved about 6 cells.
tr: Bir saniye sonra baş yaklaşık 6 hücre ilerlemiş olmalı.

```js
$.run(1)
assert.isAtLeast(head.x, 10)
assert.isAtMost(head.x, 12)
assert.strictEqual(head.y, 5)
```

The square on screen should follow the head.
tr: Ekrandaki kare başı izlemeli.

```js
$.run(1)
assert.deepEqual($.rects('lime'), [{ x: head.x * 20, y: 100, w: 20, h: 20, color: 'lime' }])
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
let last = 0

function update() {
  head.x += 1
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

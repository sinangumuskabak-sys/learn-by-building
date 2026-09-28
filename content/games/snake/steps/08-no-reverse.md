---
title: No U-turns
title_tr: Geri dönüş yok
skills: [game.input, game.state]
---

# --explanation--

Try it: while moving right, press Left. The head turns straight back into its own neck. In real Snake that move is
simply ignored. The obvious fix is "ignore a key that points opposite to `dir`":

```js
if (turn.x === -dir.x && turn.y === -dir.y) return
```

But there is a sneaky bug hiding here. The snake only moves every 150 ms, and a fast player can press **two** keys
inside one of those gaps. Moving right, press Up and then Left quickly:

1. Up is not opposite to right → `dir` becomes up.
2. Left is not opposite to *up* → `dir` becomes left.
3. The next move goes left: straight into the neck again!

The snake never actually moved up. The check compared against a direction that was only *planned*. The fix is to
keep two variables:

- `dir`: the direction of the **last real move**.
- `nextDir`: the direction the player asked for. Keys set this, checked against `dir`.

`update()` copies `nextDir` into `dir` right before moving. This "remember the request, apply it on the next tick"
pattern shows up everywhere in games (and in UI code too).

# --explanation-tr--

**Bu adımda:** yılanın kendi boynuna geri dönmesini engelleyeceğiz. Çalıştırıp sağa giderken sol oka basarsan
artık hiçbir şey olmayacak; yılan yoluna devam edecek.

**Sorun.** Dene: yılan sağa giderken sol oka bas. Baş dönüp doğrudan kendi boynuna girer. Gerçek Yılan oyununda
bu hamle yok sayılır. İlk akla gelen çözüm: "şu anki yönün **tam tersi** olan tuşu yok say."

```js
if (turn.x === -dir.x && turn.y === -dir.y) return
```

- `-dir.x` → `dir.x`'in işaret değiştirmiş hâli. Sağ `{ x: 1, y: 0 }` ise tersi `{ x: -1, y: 0 }`, yani sol.
- `return` → "bu fonksiyondan **hemen çık**, aşağıdaki satırları yapma".

**Gizli bir hata.** Yılan sadece 150 milisaniyede bir hareket ediyor. Hızlı bir oyuncu bu arada **iki** tuşa
basabilir. Sağa giderken hızlıca önce yukarı, sonra sol oka bas:

1. Yukarı, sağın tersi değil → yön yukarı olur.
2. Sol, *yukarının* tersi değil → yön sol olur.
3. Bir sonraki adım sola gider: yine boyna!

Yılan aslında hiç yukarı gitmedi. Kontrol, sadece *planlanmış* bir yönle karşılaştırma yaptı. Çözüm iki değişken
tutmak:

- `dir`: **son gerçek hareketin** yönü.
- `nextDir`: oyuncunun **istediği** yön. Tuşlar bunu değiştirir; kontrol `dir`'e göre yapılır.

`update()` hareket etmeden hemen önce `nextDir`'i `dir`'e kopyalar. "İsteği not et, bir sonraki adımda uygula"
yöntemi oyunlarda çok sık kullanılır. Garsonun siparişi deftere yazıp mutfağa sırası gelince iletmesi gibi.

**Tuş → yön tablosu.** Dört ayrı `if` yerine bir **arama nesnesi** kullanırız: anahtarı tuş adı, değeri yön.

```js
const turns = { ArrowUp: { x: 0, y: -1 }, ... }
const turn = turns[event.key]
```

`turns[event.key]` → köşeli parantezle, adı bir değişkende duran alanı okuruz. `event.key` `'ArrowUp'` ise
`turns.ArrowUp` gelir. Tabloda olmayan bir tuşsa (`'a'` gibi) sonuç **boştur** (`undefined`).

```js
if (!turn) return
```

`!` "**değil**" demektir. `!turn` → "turn boşsa". Yani ok tuşu değilse fonksiyondan çık, hiçbir şey yapma.

# --task--

1. Add `let nextDir = dir`.
2. Rewrite the key handler: turn the key into a direction (`turn`), ignore it if it is opposite to `dir`
   (`turn.x === -dir.x && turn.y === -dir.y`), otherwise set `nextDir = turn`. Keys should no longer change `dir`
   directly.
3. At the start of `update()`, set `dir = nextDir`.

Tip: a lookup object keeps the handler short:

```js
const turns = { ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ... }
const turn = turns[event.key]
if (!turn) return
```

# --task-tr--

1. `let dir = { x: 1, y: 0 }` satırının hemen altına istenen yönü tutan değişkeni ekle:

   ```js
   let nextDir = dir
   ```

2. Şimdi tuşları dinleyen kodun tamamını (`document.addEventListener('keydown', ...` ile başlayıp `})` ile biten,
   içinde dört `if` olan blok) sil. Yerine şunu yaz:

   ```js
   const turns = {
     ArrowUp: { x: 0, y: -1 },
     ArrowDown: { x: 0, y: 1 },
     ArrowLeft: { x: -1, y: 0 },
     ArrowRight: { x: 1, y: 0 },
   }

   document.addEventListener('keydown', (event) => {
     const turn = turns[event.key]
     if (!turn) return
     // Ignore a turn straight back into the snake's own neck.
     if (turn.x === -dir.x && turn.y === -dir.y) return
     nextDir = turn
   })
   ```

   Dikkat: tuşlar artık `dir`'i değil, `nextDir`'i değiştiriyor.

3. `update()` fonksiyonunun **ilk satırı** olarak istenen yönü uygula:

   ```js
   function update() {
     dir = nextDir // ← yeni
     const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y }
     // ... geri kalanı aynı
   ```

4. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Sağa giderken sol oka bas: yılan dönmemeli. Normal dönüşler
   (yukarı, aşağı) çalışmaya devam etmeli. Alttaki kontrollerin hepsi yeşil olmalı. "`dir` yalnızca yılan hareket
   edince değişmeli" kontrolü kırmızıysa, tuş kodunda hâlâ `dir = ...` yazan bir satır kalmıştır.

# --tests--

Pressing Left while moving right should be ignored.
tr: Sağa giderken Sol'a basmak görmezden gelinmeli.

```js
$.press('ArrowLeft')
$.run(0.5)
assert.isAbove(snake[0].x, 5)
assert.strictEqual(snake[0].y, 5)
```

Keys should set `nextDir`, and `dir` should change only when the snake moves.
tr: Tuşlar `nextDir`'i ayarlamalı; `dir` yalnızca yılan hareket edince değişmeli.

```js
$.press('ArrowUp')
assert.deepEqual(nextDir, { x: 0, y: -1 })
assert.deepEqual(dir, { x: 1, y: 0 })
update()
assert.deepEqual(dir, { x: 0, y: -1 })
```

Quickly pressing Up then Left while moving right should move the snake up, not into its neck.
tr: Sağa giderken hızlıca Yukarı sonra Sol'a basmak yılanı boynuna değil yukarı götürmeli.

```js
food = { x: 0, y: 19 }
$.press('ArrowUp')
$.press('ArrowLeft')
update()
assert.deepEqual(snake[0], { x: 5, y: 4 })
assert.deepEqual(snake[1], { x: 5, y: 5 })
```

Normal turns should still work.
tr: Normal dönüşler hâlâ çalışmalı.

```js
$.press('ArrowDown')
$.run(0.5)
assert.isAbove(snake[0].y, 5)
$.press('ArrowLeft')
$.run(0.5)
assert.isBelow(snake[0].x, 5)
```

# --solution--

```js
// Snake, step by step.
// The page already has <canvas id="game" width="400" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 20
const COLS = canvas.width / CELL
const ROWS = canvas.height / CELL
const SPEED = 150 // milliseconds between moves
let snake = [
  { x: 5, y: 5 },
  { x: 4, y: 5 },
  { x: 3, y: 5 },
]
let dir = { x: 1, y: 0 }
let nextDir = dir
let food
let score = 0
let last = 0

function placeFood() {
  do {
    food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }
  } while (snake.some((part) => part.x === food.x && part.y === food.y))
}

placeFood()

const turns = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
}

document.addEventListener('keydown', (event) => {
  const turn = turns[event.key]
  if (!turn) return
  // Ignore a turn straight back into the snake's own neck.
  if (turn.x === -dir.x && turn.y === -dir.y) return
  nextDir = turn
})

function update() {
  dir = nextDir
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y }
  snake.unshift(head)
  if (head.x === food.x && head.y === food.y) {
    score += 1
    placeFood()
  } else {
    snake.pop()
  }
}

function draw() {
  ctx.fillStyle = '#111'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'red'
  ctx.fillRect(food.x * CELL, food.y * CELL, CELL, CELL)

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

---
title: Food, growing and score
title_tr: Yem, büyüme ve skor
skills: [game.collision, prog.arrays]
---

# --explanation--

Now the snake needs a goal. Food is one more cell on the grid, placed at random:

```js
Math.random()                    // a number from 0 up to (not including) 1
Math.random() * COLS             // 0 up to 20
Math.floor(Math.random() * COLS) // a whole number: 0, 1, ... 19
```

Food must never appear **inside** the snake, so keep picking until you find a free cell. A `do ... while` loop runs
its body at least once, then repeats while the condition is true:

```js
do {
  food = { x: ..., y: ... }
} while (snake.some((part) => part.x === food.x && part.y === food.y))
```

`array.some(test)` answers "is there at least one item for which `test` is true?".

**Collision** on a grid is simple: two things touch when they are in the same cell, meaning their `x` and `y` are
equal. When the new head lands on the food, the snake should grow. Remember the move trick from the last step? To
grow, just **skip the `pop()`**: the new head is added and the tail stays.

# --explanation-tr--

**Bu adımda:** yılana bir amaç veriyoruz. Tahtada rastgele bir yerde kırmızı bir yem belirecek. Yılanın başı yemin
üstüne gelince yılan bir hücre uzayacak, skor bir artacak ve yem başka bir yere geçecek.

**Kaç sütun, kaç satır?** `/` işareti **bölme** demektir. `canvas.width / CELL` = `400 / 20` = `20` sütun.
Bunu `COLS` (sütunlar), satır sayısını da `ROWS` (satırlar) diye saklarız.

**Rastgele sayı.** Yem her seferinde başka bir yerde çıksın istiyoruz:

```js
Math.random()                    // 0 ile 1 arasında rastgele bir sayı (1 hariç), ör. 0.537...
Math.random() * COLS             // 0 ile 20 arasında (20 hariç), ör. 10.74...
Math.floor(Math.random() * COLS) // küsuratı atar: 0, 1, ... 19 tam sayılarından biri
```

`Math`, JavaScript'in hazır matematik araç kutusudur. `Math.floor(sayı)` sayıyı **aşağı yuvarlar**: `10.74`
→ `10`. Hücre numaraları tam sayı olmalı, o yüzden gerekli.

**Değersiz değişken.** `let food` yazıp `=` koymazsak değişken oluşur ama henüz içi boştur. Değerini birazdan
`placeFood()` verecek.

**Yem yılanın içinde çıkmasın.** Rastgele bir hücre seçeriz; yılanın üstüne denk geldiyse yeniden seçeriz.
Bunu `do ... while` döngüsü yapar:

```js
do {
  food = { x: ..., y: ... }
} while (koşul)
```

"Önce süslü parantezin içini **bir kez** yap; sonra `while` parantezindeki koşul doğru olduğu sürece tekrarla."
Zar atıp istemediğin sayı gelirse yeniden atmak gibi.

Koşulumuz: "yılanın parçalarından herhangi biri yemle aynı hücrede mi?"

```js
snake.some((part) => part.x === food.x && part.y === food.y)
```

- `dizi.some(test)` → "dizide bu testi geçen **en az bir** eleman var mı?" diye sorar; cevabı doğru (`true`) ya
  da yanlış (`false`) olur.
- `(part) => ...` → 5. adımda gördüğün ok fonksiyonu. Her parça için bir kez çalışır; parçanın adı `part`.
- `&&` → "**ve**". İki taraf da doğruysa doğrudur: sütunlar eşit **ve** satırlar eşit.

**Çarpışma (collision).** Izgarada iki şeyin değmesi kolaydır: aynı hücredeyseler, yani `x`'leri ve `y`'leri
eşitse değmişlerdir.

**Büyümek.** 6. adımdaki hareket numarasını hatırla: başa bir hücre ekle, sondan bir hücre çıkar. Büyümek için
sadece **çıkarmayı atla**: yeni baş eklenir, kuyruk yerinde kalır, yılan bir uzar. Bunun için `else` kullanırız:

```js
if (koşul) {
  // koşul doğruysa bu
} else {
  // değilse bu
}
```

# --task--

1. Add `const COLS = canvas.width / CELL` and `const ROWS = canvas.height / CELL`.
2. Add `let food` and `let score = 0`, and a function `placeFood()` that sets `food` to a random `{ x, y }` cell
   (whole numbers inside the grid) that is not part of the snake. Call `placeFood()` once after `snake` is created.
3. In `update()`, after adding the new head: if it is on the food, add 1 to `score` and call `placeFood()`;
   otherwise `pop()` the tail as before.
4. In `draw()`, paint the food as a `'red'` cell (before the snake).

# --task-tr--

1. `const CELL = 20` satırının hemen altına sütun ve satır sayılarını ekle:

   ```js
   const COLS = canvas.width / CELL
   const ROWS = canvas.height / CELL
   ```

2. `let dir = { x: 1, y: 0 }` satırının hemen altına yem ve skor değişkenlerini ekle:

   ```js
   let food
   let score = 0
   ```

3. `let last = 0` satırının altına bir boş satır bırak ve yemi yerleştiren fonksiyonu yaz, hemen altında da onu
   bir kez çağır:

   ```js
   function placeFood() {
     do {
       food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }
     } while (snake.some((part) => part.x === food.x && part.y === food.y))
   }

   placeFood()
   ```

   Parantezleri say: her `(` bir `)` ile kapanmalı.

4. `update()` fonksiyonunda `snake.pop()` satırını yemek kontrolünün içine al. Fonksiyon şöyle olsun:

   ```js
   function update() {
     const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y }
     snake.unshift(head)
     if (head.x === food.x && head.y === food.y) { // ← yeni
       score += 1 // ← yeni
       placeFood() // ← yeni
     } else { // ← yeni
       snake.pop()
     } // ← yeni
   }
   ```

5. `draw()` fonksiyonunda, arka planı boyayan `ctx.fillRect(0, 0, canvas.width, canvas.height)` satırının
   altına (yılandan **önce**) yemi çizen iki satırı ekle:

   ```js
   function draw() {
     ctx.fillStyle = '#111'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     ctx.fillStyle = 'red' // ← yeni
     ctx.fillRect(food.x * CELL, food.y * CELL, CELL, CELL) // ← yeni

     ctx.fillStyle = 'lime'
     for (const part of snake) {
       ctx.fillRect(part.x * CELL, part.y * CELL, CELL, CELL)
     }
   }
   ```

6. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Tahtada kırmızı bir kare görmelisin; yılanı onun üstüne
   sürünce yılan uzamalı ve yem başka yere geçmeli. Alttaki kontrollerin hepsi yeşil olmalı. Yem hiç görünmüyorsa
   `placeFood()` çağrısını unutmuş olabilirsin.

# --tests--

`COLS` and `ROWS` should both be 20.
tr: `COLS` ve `ROWS` ikisi de 20 olmalı.

```js
assert.strictEqual(COLS, 20)
assert.strictEqual(ROWS, 20)
```

`placeFood()` should always pick a whole-numbered cell inside the grid that is not on the snake.
tr: `placeFood()` her zaman ızgara içinde, tam sayılı ve yılanın üstünde olmayan bir hücre seçmeli.

```js
snake = []
for (let x = 0; x < 20; x++) for (let y = 0; y < 20; y++) if (x > 1 || y > 1) snake.push({ x, y })
for (let i = 0; i < 30; i++) {
  placeFood()
  assert.isTrue(food.x >= 0 && food.x <= 1 && food.y >= 0 && food.y <= 1, `food landed on ${JSON.stringify(food)}`)
  assert.isTrue(Number.isInteger(food.x) && Number.isInteger(food.y))
}
```

Eating food should grow the snake by one and add a point.
tr: Yem yemek yılanı bir büyütmeli ve bir puan eklemeli.

```js
food = { x: 6, y: 5 }
update()
assert.lengthOf(snake, 4)
assert.strictEqual(score, 1)
assert.notDeepEqual(food, { x: 6, y: 5 }, 'new food should be placed')
```

Moving without eating should keep the length the same.
tr: Yemeden ilerlemek boyu değiştirmemeli.

```js
food = { x: 0, y: 19 }
update()
update()
assert.lengthOf(snake, 3)
assert.strictEqual(score, 0)
```

The food should be drawn as a red cell.
tr: Yem kırmızı bir hücre olarak çizilmeli.

```js
$.tick()
assert.deepEqual($.rects('red'), [{ x: food.x * 20, y: food.y * 20, w: 20, h: 20, color: 'red' }])
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
let food
let score = 0
let last = 0

function placeFood() {
  do {
    food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }
  } while (snake.some((part) => part.x === food.x && part.y === food.y))
}

placeFood()

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') dir = { x: 0, y: -1 }
  if (event.key === 'ArrowDown') dir = { x: 0, y: 1 }
  if (event.key === 'ArrowLeft') dir = { x: -1, y: 0 }
  if (event.key === 'ArrowRight') dir = { x: 1, y: 0 }
})

function update() {
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

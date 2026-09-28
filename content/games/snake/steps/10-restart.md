---
title: Score, best score and restart
title_tr: Skor, en iyi skor ve yeniden başlama
skills: [game.state, prog.functions]
---

# --explanation--

Two things make a game feel finished: the player can see how well they are doing, and they can play again without
reloading the page.

**Restarting** means putting every piece of state back to how it was at the start. If those starting values are
scattered around the file, it is easy to forget one (a leftover `gameOver = true` and the new game is dead on
arrival). So collect them in one function:

```js
function reset() {
  snake = [...]
  dir = { x: 1, y: 0 }
  // ...every other piece of state...
}
reset()   // the first game starts the same way as every later one
```

Now the top of the file only *declares* the variables (`let snake`), and `reset()` gives them values. One source of
truth for "a fresh game".

The **best score** should survive a page reload. `localStorage` is a tiny key–value store the browser keeps for each
site. It only stores strings, so convert when reading:

```js
localStorage.setItem('snake-best', best)                 // saved as "12"
Number(localStorage.getItem('snake-best')) || 0           // 12, or 0 if nothing was saved yet
```

# --explanation-tr--

**Bu adımda:** oyunu tamamlanmış hissettiren iki şey ekleyeceğiz. Sol üst köşede `Score:` (skor) ve `Best:` (en
iyi skor) yazıları görünecek. Oyun bitince Boşluk (Space) ya da Enter tuşuna basarak sayfayı yenilemeden yeniden
oynayabileceksin.

**Yeniden başlamak** demek, her durum bilgisini oyunun başındaki hâline geri koymak demek. Bu başlangıç değerleri
dosyanın her yerine dağılmışsa birini unutmak kolaydır (unutulan tek bir `gameOver = true` yeni oyunu daha
başlamadan bitirir). Bu yüzden hepsini **tek bir fonksiyonda** toplarız:

```js
function reset() {
  snake = [...]
  dir = { x: 1, y: 0 }
  // ...diğer her durum bilgisi...
}
reset()   // ilk oyun da sonraki her oyunla aynı yoldan başlar
```

Artık dosyanın başında değişkenler sadece **tanıtılır** (`let snake`, değersiz), değerlerini `reset()` verir.
"Yeni bir oyun neye benzer?" sorusunun cevabı tek bir yerde durur.

**Yazıyla sayıyı birleştirmek.** `'Score: ' + score` → yazıya `+` ile bir şey eklersen yan yana yapıştırılır.
`score` 3 ise sonuç `'Score: 3'` olur.

**Sayfa yenilense de kalan en iyi skor.** Değişkenler sayfa kapanınca silinir. Tarayıcının her site için tuttuğu
küçük bir defter vardır: `localStorage`. İçine bir **ad** ile bir değer yazarsın, sonra aynı adla okursun.

```js
localStorage.setItem('snake-best', best)          // "snake-best" adıyla kaydet, "12" olarak saklanır
Number(localStorage.getItem('snake-best')) || 0   // 12; hiç kayıt yoksa 0
```

Bunu parça parça okuyalım:

- `setItem(ad, değer)` → deftere yaz. Defter her şeyi **yazı** olarak saklar.
- `getItem(ad)` → defterden oku. Hiç kayıt yoksa boş (`null`) gelir.
- `Number(...)` → yazıyı sayıya çevirir: `'12'` → `12`.
- `|| 0` → "soldaki boşsa ya da sıfırsa, 0 kullan". `||` burada "yoksa şu" anlamında bir yedek değer verir.

Oyun bittiğinde `score > best` (skor en iyiden **büyükse**) en iyiyi günceller ve deftere yazarız.

**Tuşla yeniden başlama.** Boşluk tuşunun adı `' '` (tırnak içinde bir boşluk), Enter'ınki `'Enter'`. Yalnızca
oyun bittiyse çalışsın diye `gameOver &&` ile başlarız. Parantezler hangi parçanın birlikte değerlendirileceğini
belirler, matematikteki gibi: "oyun bitti **ve** (Boşluk **veya** Enter)".

# --task--

1. Write `function reset()` that sets `snake` (the starting three cells), `dir`, `nextDir`, `score = 0` and
   `gameOver = false`, then calls `placeFood()`. Keep the `let` declarations at the top but without values, and
   replace the old `placeFood()` call with `reset()`.
2. Add `let best = Number(localStorage.getItem('snake-best')) || 0`. When the game ends and `score > best`, update
   `best` and save it with `localStorage.setItem('snake-best', best)`.
3. In `draw()`, show `Score: 3` and `Best: 5` (with the real numbers) in the top-left corner, in white 16px text,
   left-aligned.
4. When the game is over, pressing Space (`' '`) or Enter should call `reset()`.

# --task-tr--

1. Dosyanın başındaki değişkenleri değersiz hâle getir ve en iyi skoru ekle. `const SPEED = 150` satırının
   altından `let last = 0` satırına kadar olan kısım tam olarak şöyle olmalı:

   ```js
   let snake
   let dir
   let nextDir
   let food
   let score
   let gameOver
   let best = Number(localStorage.getItem('snake-best')) || 0
   let last = 0
   ```

   Yani üç hücreli yılan dizisi, `{ x: 1, y: 0 }`, `= dir`, `= 0` ve `= false` kısımları buradan siliniyor (bir
   sonraki maddede `reset()`'e taşınacaklar).

2. `let last = 0` satırının altına bir boş satır bırak ve `reset` fonksiyonunu yaz (`function placeFood()`'dan
   önce):

   ```js
   function reset() {
     snake = [
       { x: 5, y: 5 },
       { x: 4, y: 5 },
       { x: 3, y: 5 },
     ]
     dir = { x: 1, y: 0 }
     nextDir = dir
     score = 0
     gameOver = false
     placeFood()
   }
   ```

3. `placeFood` fonksiyonunun hemen altında tek başına duran `placeFood()` çağrısını sil (artık onu `reset()`
   yapıyor).

4. Tuş dinleyicisinin içinde, en başa yeniden başlatma kontrolünü ekle:

   ```js
   document.addEventListener('keydown', (event) => {
     if (gameOver && (event.key === ' ' || event.key === 'Enter')) { // ← yeni
       reset() // ← yeni
       return // ← yeni
     } // ← yeni
     const turn = turns[event.key]
     // ... geri kalanı aynı
   ```

5. `update()` fonksiyonunda, çarpma olduğunda en iyi skoru kaydet:

   ```js
     if (hitWall || hitSelf) {
       gameOver = true
       if (score > best) { // ← yeni
         best = score // ← yeni
         localStorage.setItem('snake-best', best) // ← yeni
       } // ← yeni
       return
     }
   ```

6. `draw()` fonksiyonunda, yılanı çizen `for` döngüsünden sonraki kısmı şöyle yap (skor yazıları eklendi,
   `gameOver` bölümü değişti):

   ```js
     ctx.fillStyle = 'white' // ← yeni
     ctx.font = '16px sans-serif' // ← yeni
     ctx.textAlign = 'left' // ← yeni
     ctx.fillText('Score: ' + score, 8, 20) // ← yeni
     ctx.fillText('Best: ' + best, 8, 40) // ← yeni

     if (gameOver) {
       ctx.font = '32px sans-serif'
       ctx.textAlign = 'center'
       ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
       ctx.font = '16px sans-serif' // ← yeni
       ctx.fillText('Press Space to play again', canvas.width / 2, canvas.height / 2 + 32) // ← yeni
     }
   }
   ```

   `if (gameOver)` içindeki `ctx.fillStyle = 'white'` satırı silindi, çünkü renk hemen yukarıda zaten beyaz
   yapıldı.

7. Dosyanın en altındaki `requestAnimationFrame(loop)` satırının **üstüne** ilk oyunu başlatan çağrıyı ekle:

   ```js
   reset()
   requestAnimationFrame(loop)
   ```

8. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Sol üstte `Score: 0` ve `Best: 0` görünmeli. Yem yiyince
   skor artmalı. Duvara çarpınca Boşluk tuşuna bas: yeni oyun başlamalı ve `Best:` rekorunu göstermeli. Alttaki
   kontrollerin hepsi yeşil olmalı. Ekran boş kalıyorsa en alttaki `reset()` çağrısını unutmuş olabilirsin.

# --tests--

`reset()` should bring back a fresh game.
tr: `reset()` yepyeni bir oyun getirmeli.

```js
snake = [{ x: 1, y: 1 }]
score = 9
gameOver = true
dir = nextDir = { x: 0, y: 1 }
reset()
assert.deepEqual(snake, [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }])
assert.deepEqual(dir, { x: 1, y: 0 })
assert.deepEqual(nextDir, { x: 1, y: 0 })
assert.strictEqual(score, 0)
assert.isFalse(gameOver)
assert.isObject(food)
```

The score and best score should be drawn.
tr: Skor ve en iyi skor çizilmeli.

```js
food = { x: 6, y: 5 }
$.run(0.2)
assert.include($.texts(), 'Score: 1')
assert.include($.texts(), 'Best: 0')
```

A new best score should be saved when the game ends.
tr: Oyun bittiğinde yeni en iyi skor kaydedilmeli.

```js
food = { x: 6, y: 5 }
update()
food = { x: 0, y: 19 }
$.run(4)
assert.isTrue(gameOver)
assert.strictEqual(best, 1)
assert.strictEqual(localStorage.getItem('snake-best'), '1')
assert.include($.texts(), 'Best: 1')
```

Space should start a new game after game over, and only then.
tr: Boşluk tuşu oyun bitince yeni oyun başlatmalı, yalnızca o zaman.

```js
food = { x: 0, y: 19 }
$.run(0.5)
$.tap(' ')
assert.isAbove(snake[0].x, 5, 'Space during a game should do nothing')
$.run(4)
assert.isTrue(gameOver)
$.tap(' ')
assert.isFalse(gameOver)
assert.strictEqual(score, 0)
assert.deepEqual(snake[0], { x: 5, y: 5 })
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
let snake
let dir
let nextDir
let food
let score
let gameOver
let best = Number(localStorage.getItem('snake-best')) || 0
let last = 0

function reset() {
  snake = [
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 },
  ]
  dir = { x: 1, y: 0 }
  nextDir = dir
  score = 0
  gameOver = false
  placeFood()
}

function placeFood() {
  do {
    food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }
  } while (snake.some((part) => part.x === food.x && part.y === food.y))
}

const turns = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
}

document.addEventListener('keydown', (event) => {
  if (gameOver && (event.key === ' ' || event.key === 'Enter')) {
    reset()
    return
  }
  const turn = turns[event.key]
  if (!turn) return
  // Ignore a turn straight back into the snake's own neck.
  if (turn.x === -dir.x && turn.y === -dir.y) return
  nextDir = turn
})

function update() {
  dir = nextDir
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y }
  const hitWall = head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS
  const hitSelf = snake.some((part) => part.x === head.x && part.y === head.y)
  if (hitWall || hitSelf) {
    gameOver = true
    if (score > best) {
      best = score
      localStorage.setItem('snake-best', best)
    }
    return
  }
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

  ctx.fillStyle = 'white'
  ctx.font = '16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score: ' + score, 8, 20)
  ctx.fillText('Best: ' + best, 8, 40)

  if (gameOver) {
    ctx.font = '32px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
    ctx.font = '16px sans-serif'
    ctx.fillText('Press Space to play again', canvas.width / 2, canvas.height / 2 + 32)
  }
}

function loop(time) {
  if (!gameOver && time - last >= SPEED) {
    last = time
    update()
  }
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```

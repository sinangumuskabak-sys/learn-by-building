---
title: A body made of an array
title_tr: Diziden bir gövde
skills: [prog.arrays]
---

# --explanation--

A snake is a **list of cells**, head first. An array is the natural fit:

```js
let snake = [
  { x: 5, y: 5 },  // head (index 0)
  { x: 4, y: 5 },
  { x: 3, y: 5 },  // tail (last index)
]
```

How does a whole snake move one step? You do not need to move every segment. Look at the picture before and after:
the middle stays exactly where it was. Only two things change:

1. A **new head** appears one cell ahead of the old head → `snake.unshift(newHead)` adds it at the front.
2. The **tail** disappears → `snake.pop()` removes the last item.

```
before:  T B H .        after:  . T B H
```

This trick is cheap no matter how long the snake gets: two array operations per move. It will also make growing
trivial in the next step.

Drawing becomes a loop over the array: `for (const part of snake) { ... }`.

# --explanation-tr--

**Bu adımda:** tek kare, üç hücrelik bir yılana dönüşecek. Çalıştırınca yan yana üç yeşil kare göreceksin; ok
tuşlarıyla döndüğünde gövde başı izleyecek.

**Dizi (array) nedir?** Yılan bir **hücre listesidir**: önce baş, sonra gövde, en sonda kuyruk. Sıralı bir
listeyi tutmanın yolu **dizidir**. Alışveriş listesi gibi düşün: maddeler sırayla yazılır.

```js
let snake = [
  { x: 5, y: 5 },  // baş (sıra numarası 0)
  { x: 4, y: 5 },
  { x: 3, y: 5 },  // kuyruk (son sıra)
]
```

- Köşeli parantez `[ ]` bir dizi açar ve kapatır. İçindeki elemanlar virgülle ayrılır.
- Burada her eleman, 3. adımda gördüğün gibi bir `{ x, y }` nesnesi: bir hücre.
- Elemanlara **sıra numarasıyla (index)** ulaşılır ve sayma **0'dan başlar**: `snake[0]` baştır, `snake[1]`
  ikinci parça. `snake[0].x` "başın sütunu" demektir.
- `snake.length` dizide kaç eleman olduğunu söyler (burada 3).

**Bütün yılan nasıl bir adım ilerler?** Her parçayı tek tek kaydırmana gerek yok. Önceki ve sonraki resme bak:
ortadaki parçalar yerinden hiç oynamıyor. Yalnızca iki şey değişiyor:

1. Eski başın bir hücre önünde **yeni bir baş** belirir → `snake.unshift(yeniBaş)` onu listenin **başına**
   ekler.
2. **Kuyruk** kaybolur → `snake.pop()` listenin **son** elemanını çıkarır.

```
önce:  K G B .        sonra:  . K G B      (K kuyruk, G gövde, B baş)
```

Yılan ne kadar uzarsa uzasın, bu hep iki işlemdir. Bir sonraki adımda büyümeyi de çok kolaylaştıracak.

**Yeni baş nerede?** Eski başın konumuna yönü ekleriz:

```js
const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y }
```

Bu `head`, `update()`'in **içinde** `const` ile yazıldığı için sadece o fonksiyonun içinde geçerli, geçici bir
addır. Eski `let head` değişkenine artık gerek yok; yerini `snake` alıyor.

**Döngüyle çizmek.** Her parça için aynı kareyi çizmek istiyoruz. Bunu bir **döngüyle** (loop) yaparız:

```js
for (const part of snake) {
  ctx.fillRect(part.x * CELL, part.y * CELL, CELL, CELL)
}
```

"`snake` dizisindeki her eleman için: ona sırayla `part` de ve süslü parantezin içini yap." Üç parça varsa içerisi
üç kez çalışır; her seferinde `part` bir sonraki hücredir.

# --task--

1. Replace `head` with `let snake` holding the three cells above, head first.
2. In `update()`, build `const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y }`, add it to the front with
   `unshift`, and remove the tail with `pop`.
3. In `draw()`, paint one lime cell for every part of `snake`.

# --task-tr--

1. `let head = { x: 5, y: 5 }` satırını sil ve yerine yılan dizisini yaz:

   ```js
   let snake = [
     { x: 5, y: 5 },
     { x: 4, y: 5 },
     { x: 3, y: 5 },
   ]
   ```

2. `update()` fonksiyonunun içindeki iki satırı (`head.x += dir.x` ve `head.y += dir.y`) sil. Fonksiyon şöyle
   olsun:

   ```js
   function update() {
     const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y } // ← yeni
     snake.unshift(head) // ← yeni
     snake.pop() // ← yeni
   }
   ```

3. `draw()` fonksiyonunun son satırı olan `ctx.fillRect(head.x * CELL, head.y * CELL, CELL, CELL)` satırını sil
   ve yerine her parçayı çizen döngüyü yaz. Fonksiyon şöyle olsun:

   ```js
   function draw() {
     ctx.fillStyle = '#111'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     ctx.fillStyle = 'lime'
     for (const part of snake) { // ← yeni
       ctx.fillRect(part.x * CELL, part.y * CELL, CELL, CELL) // ← yeni
     } // ← yeni
   }
   ```

4. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Üç karelik yeşil yılan sağa ilerlemeli; ok tuşlarına basınca
   gövde başı izlemeli. Alttaki kontrollerin hepsi yeşil olmalı. Ekran boşsa ve hata görüyorsan, kodda hâlâ eski
   `head.x` kullanan bir satır kalmış olabilir.

# --tests--

`snake` should start with three cells, head first, pointing right.
tr: `snake` üç hücreyle, baş önde ve sağa bakarak başlamalı.

```js
assert.deepEqual(snake, [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }])
```

`update()` should add a new head in front and drop the tail.
tr: `update()` öne yeni bir baş eklemeli ve kuyruğu atmalı.

```js
update()
assert.deepEqual(snake, [{ x: 6, y: 5 }, { x: 5, y: 5 }, { x: 4, y: 5 }])
```

The snake should keep its length and stay connected while turning.
tr: Yılan dönerken boyunu korumalı ve parçaları birbirine bitişik kalmalı.

```js
$.run(0.5)
$.press('ArrowDown')
$.run(0.5)
$.press('ArrowLeft')
$.run(0.3)
assert.lengthOf(snake, 3)
for (let i = 1; i < snake.length; i++) {
  const gap = Math.abs(snake[i].x - snake[i - 1].x) + Math.abs(snake[i].y - snake[i - 1].y)
  assert.strictEqual(gap, 1, 'each part should touch the one before it')
}
```

Every part of the snake should be drawn.
tr: Yılanın her parçası çizilmeli.

```js
$.run(0.5)
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
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y }
  snake.unshift(head)
  snake.pop()
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

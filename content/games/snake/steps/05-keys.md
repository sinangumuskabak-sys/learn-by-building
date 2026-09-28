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

**Bu adımda:** kareyi klavyenin ok tuşlarıyla yönlendireceğiz. Çalıştırıp oyuna tıkladıktan sonra ok tuşlarına
basınca yeşil kare yukarı, aşağı, sola ya da sağa dönecek.

**Yön de bir durumdur.** Şu an `update()` hep `head.x += 1` yapıyor, yani kare hep sağa gidiyor. Yönü koda
gömmek yerine onu da bir değişkende tutarız: her adımda sütun (`x`) ne kadar, satır (`y`) ne kadar değişecek?

```js
let dir = { x: 1, y: 0 }   // sağ: sütun 1 artar, satır aynı kalır
// yukarı: { x: 0, y: -1 }   aşağı: { x: 0, y: 1 }   sol: { x: -1, y: 0 }
```

`-1` eksi bir demektir; bir sayıya `-1` eklemek onu bir azaltır. Unutma, `y` **aşağı** indikçe büyür, bu yüzden
"yukarı" `y: -1`'dir.

Hareket de artık yöne göre olur:

```js
head.x += dir.x
head.y += dir.y
```

**Olay (event) nedir?** Tarayıcı, sayfada bir şey olduğunda (bir tuşa basıldığında, fareyle tıklandığında) bunu
duyurur. Buna **olay** denir. Sen de "şu olay olunca bana haber ver, şunu yapayım" diye kayıt olursun. Kapı zili
gibi: zil çalınca kapıya gidersin, bütün gün kapıda beklemezsin.

```js
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') dir = { x: 0, y: -1 }
})
```

Bunu parça parça okuyalım:

- `document.addEventListener(...)` → sayfaya "bir olayı dinle" diyoruz.
- `'keydown'` → dinlenecek olayın adı: "bir tuşa basıldı".
- `(event) => { ... }` → olay olunca çalışacak küçük bir fonksiyon. `=>` işareti (ok) fonksiyon yazmanın kısa
  yoludur: solunda parametreler, sağında gövde. `event`, tarayıcının bize verdiği olay bilgisidir.
- `event.key` → basılan tuşun adı. Ok tuşlarının adları `'ArrowUp'` (yukarı), `'ArrowDown'` (aşağı),
  `'ArrowLeft'` (sol), `'ArrowRight'` (sağ).
- `===` → "eşit mi?" diye **sorar**. Tek `=` bir şeyi değiştirir, üç `===` ise sadece karşılaştırır.
- `if (...) dir = ...` → `if`'in yapacağı iş tek satırsa süslü parantez olmadan aynı satıra yazılabilir.

Dikkat: bu fonksiyon **sadece yönü değiştirir**. Kareyi kendisi hareket ettirmez, çizmez. Döngü bir sonraki
güncellemede yeni yönü görür ve ona göre hareket eder. Girdi, güncelleme ve çizim birbirinden ayrı kalır.

# --task--

1. Add `let dir = { x: 1, y: 0 }` next to `head`.
2. Change `update()` so the head moves by `dir`: add `dir.x` to `head.x` and `dir.y` to `head.y`.
3. Listen for `keydown` on `document` and set `dir` for `ArrowUp`, `ArrowDown`, `ArrowLeft` and `ArrowRight`.

Run it and click the game so it receives your key presses.

# --task-tr--

1. `let head = { x: 5, y: 5 }` satırının hemen altına yön değişkenini ekle:

   ```js
   let dir = { x: 1, y: 0 }
   ```

2. `update()` fonksiyonunu bul ve içindeki `head.x += 1` satırını yöne göre hareket eden iki satırla değiştir:

   ```js
   function update() {
     head.x += dir.x // ← değişti
     head.y += dir.y // ← yeni
   }
   ```

3. `let last = 0` satırının altına bir satır boşluk bırak ve tuşları dinleyen kodu yaz (dört ok tuşunun hepsi):

   ```js
   document.addEventListener('keydown', (event) => {
     if (event.key === 'ArrowUp') dir = { x: 0, y: -1 }
     if (event.key === 'ArrowDown') dir = { x: 0, y: 1 }
     if (event.key === 'ArrowLeft') dir = { x: -1, y: 0 }
     if (event.key === 'ArrowRight') dir = { x: 1, y: 0 }
   })
   ```

   Sondaki `})` önemli: `}` fonksiyonu, `)` ise `addEventListener(` parantezini kapatır.

4. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla, sonra ok tuşlarına bas: kare bastığın yöne dönmeli. Alttaki
   kontrollerin hepsi yeşil olmalı. Bir tuş çalışmıyorsa tuş adını kontrol et: `ArrowUp` gibi, büyük harfle ve
   boşluksuz.

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

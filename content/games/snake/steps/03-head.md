---
title: Keep the game in variables, draw from them
title_tr: Oyunu değişkenlerde tut, onlardan çiz
skills: [game.state, prog.functions]
---

# --explanation--

The square is painted at a fixed spot. To make it move, its position has to live in **data** that can change, and
the drawing code has to read that data every time it paints.

This split is the most important idea in game programming:

- **State**: what is true about the game right now (where the snake is, the score...). Plain variables and objects.
- **Drawing**: a function that looks at the state and paints it. It never decides anything; it only shows.

An object groups the two numbers that describe one position:

```js
let head = { x: 5, y: 5 }   // column and row
head.x                      // 5
```

We use `let` because the head will be replaced or changed later. A `draw()` function repaints the **whole** picture
each time: background first, then everything on top.

# --explanation-tr--

**Bu adımda:** ekranda değişen bir şey görmeyeceksin; kare yine aynı yerde duracak. Ama kodu, karenin
**hareket edebileceği** bir düzene sokacağız. Bu, oyun yazmanın en önemli fikri.

**Durum ve çizim.** Şu an karenin yeri koda sabit yazılı: `5 * CELL`. Onu hareket ettirmek için yerini
**değişebilen bir bilgide** tutmalı, çizerken de her seferinde o bilgiye bakmalıyız. Böylece iki ayrı parça olur:

- **Durum (state):** oyunda şu an ne doğru? Yılan nerede, skor kaç... Bunları değişkenlerde tutarız.
- **Çizim:** duruma bakıp ekrana boyayan kod. Hiçbir şeye karar vermez, sadece gösterir.

Bir tiyatro gibi düşün: durum senaryodur, çizim ise sahne. Senaryo değişince sahne ona göre yeniden kurulur.

**Değişken: `let`.** `const` ile verdiğin ad hep aynı şeyi gösterir. `let` ile verdiğin adın değeri ise sonradan
değiştirilebilir. Buna **değişken** denir. Yılanın başı hareket edeceği için `let` kullanırız.

**Nesne (object).** Başın yeri iki sayıdan oluşur: sütun ve satır. İkisini tek pakette tutmak için **nesne**
kullanırız:

```js
let head = { x: 5, y: 5 }
head.x   // 5
head.y   // 5
```

- Süslü parantez `{ }` bir nesne açar ve kapatır.
- İçinde `ad: değer` çiftleri vardır, virgülle ayrılır. Her çifte **alan** denir. Burada `x` sütunu, `y` satırı
  tutuyor.
- Bir alanı okumak için nokta kullanırsın: `head.x` "head'in x'i" demektir.

**Fonksiyon (function).** Birlikte çalışan birkaç satıra bir ad verip onları tek komutla çalıştırmanın yolu. Bir
yemek tarifi gibi: tarifi bir kez yazarsın, istediğin kadar pişirirsin.

```js
function draw() {
  // buraya yazılan satırlar draw'ın içindedir
}

draw()
```

- `function draw() { ... }` → fonksiyonu **tanımlar**: "draw deyince şunları yap". Bu satır tek başına hiçbir
  şey çizmez, sadece tarifi yazar.
- `{` ile `}` arasındaki satırlar fonksiyonun **gövdesidir**. Okunaklı olsun diye iki boşlukla içeri yazılır.
- `draw()` → fonksiyonu **çağırır**: tarifi şimdi uygula. Sondaki `()` "çalıştır" demektir.

`draw()` her çağrıldığında resmin **tamamını** yeniden boyar: önce arka plan (eski kareyi siler), sonra kare.
Kare artık sabit `5` yerine `head.x` ve `head.y`'nin gösterdiği yere çizilir.

# --task--

1. Add `let head = { x: 5, y: 5 }` after `CELL`.
2. Move the two painting parts (background and lime square) into a function named `draw`. The square must use
   `head.x` and `head.y` instead of the fixed `5`.
3. Call `draw()` once at the end.

# --task-tr--

1. `const CELL = 20` satırının hemen altına şunu yaz:

   ```js
   let head = { x: 5, y: 5 }
   ```

2. Şimdi alttaki iki boyama kısmını (arka plan ve yeşil kare) bir fonksiyonun içine alacağız. Aşağıdaki dört
   satırı siliyorsun:

   ```js
   ctx.fillStyle = '#111'
   ctx.fillRect(0, 0, canvas.width, canvas.height)

   ctx.fillStyle = 'lime'
   ctx.fillRect(5 * CELL, 5 * CELL, CELL, CELL)
   ```

   ve yerlerine şunu yazıyorsun:

   ```js
   function draw() {
     ctx.fillStyle = '#111'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     ctx.fillStyle = 'lime'
     ctx.fillRect(head.x * CELL, head.y * CELL, CELL, CELL) // ← değişti
   }
   ```

   Dikkat: son satırda `5` yerine artık `head.x` ve `head.y` var.

3. Fonksiyonun kapanan `}` işaretinin altına bir satır boşluk bırak ve fonksiyonu çağır:

   ```js
   draw()
   ```

   `const CELL = 20` satırından sonrası artık tam olarak şöyle olmalı:

   ```js
   const CELL = 20
   let head = { x: 5, y: 5 }

   function draw() {
     ctx.fillStyle = '#111'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     ctx.fillStyle = 'lime'
     ctx.fillRect(head.x * CELL, head.y * CELL, CELL, CELL)
   }

   draw()
   ```

4. **Çalıştır**'a bas. Ekran bir öncekiyle aynı görünmeli (yeşil kare yerinde) ve alttaki kontrollerin hepsi
   yeşil olmalı. Ekran boş kalırsa büyük ihtimalle en alttaki `draw()` çağrısını unuttun.

# --tests--

`head` should start as `{ x: 5, y: 5 }`.
tr: `head` başlangıçta `{ x: 5, y: 5 }` olmalı.

```js
assert.deepEqual(head, { x: 5, y: 5 })
```

`draw` should be a function.
tr: `draw` bir fonksiyon olmalı.

```js
assert.isFunction(draw)
```

`draw()` should paint the square wherever `head` is.
tr: `draw()` kareyi `head` neredeyse oraya boyamalı.

```js
head = { x: 2, y: 7 }
draw()
assert.deepEqual($.rects('lime'), [{ x: 40, y: 140, w: 20, h: 20, color: 'lime' }])
```

`draw()` should repaint the background first, so old squares disappear.
tr: `draw()` önce arka planı yeniden boyamalı ki eski kareler silinsin.

```js
head = { x: 9, y: 9 }
draw()
assert.lengthOf($.rects('lime'), 1)
```

# --solution--

```js
// Snake, step by step.
// The page already has <canvas id="game" width="400" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 20
let head = { x: 5, y: 5 }

function draw() {
  ctx.fillStyle = '#111'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'lime'
  ctx.fillRect(head.x * CELL, head.y * CELL, CELL, CELL)
}

draw()
```

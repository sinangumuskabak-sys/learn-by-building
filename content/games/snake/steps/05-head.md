---
title: Keep the position in a variable
title_tr: Yeri bir değişkende tut
skills: [game.state]
---

# --goal--

To move the square later, its position must be data that can change. An object `head` holds its column and row,
and the drawing reads from it.

# --goal-tr--

Kare şu an koda **sabit** yazılı: `5 * CELL`. Onu ileride hareket ettirebilmek için yerini **değişebilen bir
bilgide** tutmalıyız. Çizim de her seferinde o bilgiye bakmalı.

Ekranda bir şey değişmeyecek; kare yine aynı yerde. Ama artık yerini bir **değişken** söylüyor. Bu, oyun
yazmanın en önemli fikri: **durum** (oyunda şu an ne var) ayrı, **çizim** (onu göstermek) ayrı.

# --code--

```js
let head = { x: 5, y: 5 }

ctx.fillRect(head.x * CELL, head.y * CELL, CELL, CELL)
```

# --meaning--

- `let` makes a variable: a name whose value can change later (`const` cannot).
- `{ x: 5, y: 5 }` is an object: two named values in one package. `x` is the column, `y` the row.
- `head.x` reads the `x` inside `head`. The square is now drawn wherever `head` says.

# --meaning-tr--

- `let head =` → **değişken** tanımlar. `const`'tan farkı: `let` ile verilen adın değeri **sonradan
  değiştirilebilir**. Yılanın başı hareket edeceği için `let`.
- `{ x: 5, y: 5 }` → bir **nesne** (object): iki bilgiyi tek pakette tutar. `x` sütun, `y` satır.
  Süslü parantez paketi açıp kapatır; içinde `ad: değer` çiftleri virgülle ayrılır.
- `head.x` → "head'in x'i" (5). Nokta, paketin içinden bir bilgiyi okur.
- Son satır aynı kareyi çiziyor ama `5` yerine artık `head.x` ve `head.y`'ye bakıyor.

# --task--

1. Under `const CELL = 20` write `let head = { x: 5, y: 5 }`.
2. In the last line, replace each `5` with `head.x` and `head.y`. Press **Run**.

# --task-tr--

1. `const CELL = 20` satırının hemen altına `let head = { x: 5, y: 5 }` yaz.
2. En alttaki `ctx.fillRect(5 * CELL, 5 * CELL, CELL, CELL)` satırında ilk `5`'i `head.x`, ikinci `5`'i `head.y`
   yap. Satırın geri kalanı aynı kalır.
3. **Çalıştır**: kare yerinde durmalı, kontroller yeşil olmalı.

# --predict--

After this change, where will the square be?
- [x] In the same place
  `head.x` and `head.y` are 5, so the numbers are the same as before.
- [ ] In the top-left corner
- [ ] It disappears

# --predict-tr--

Bu değişiklikten sonra kare nerede olacak?
- [x] Aynı yerde
  `head.x` ve `head.y` 5; yani sayılar öncekiyle aynı.
- [ ] Sol üst köşede
- [ ] Kaybolur

# --try--

Change `head` to `{ x: 10, y: 2 }` and run: the square moves. That is the whole trick of animation. Put it back to 5, 5.

# --try-tr--

`head`'i `{ x: 10, y: 2 }` yap ve çalıştır: kare yer değiştirir. Animasyonun bütün sırrı bu. Sonra 5, 5'e geri al.

# --tests--

`head` should start as `{ x: 5, y: 5 }`.
tr: `head` başlangıçta `{ x: 5, y: 5 }` olmalı.

```js
assert.deepEqual(head, { x: 5, y: 5 })
```

The square should still be drawn at (100, 100).
tr: Kare yine (100, 100)'de çizilmeli.

```js
assert.deepEqual($.rects('lime'), [{ x: 100, y: 100, w: 20, h: 20, color: 'lime' }])
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

ctx.fillStyle = '#111'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.fillStyle = 'lime'
ctx.fillRect(head.x * CELL, head.y * CELL, CELL, CELL)
```

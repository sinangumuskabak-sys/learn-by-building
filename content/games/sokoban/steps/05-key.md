---
title: A name for every tile
title_tr: Her kareye bir ad
skills: [prog.functions]
---

# --goal--

We will keep walls and goals in a `Set`, which compares simple values like text but not `{x, y}` objects. So each tile
gets a text name: `key(3, 2)` is `'3,2'`.

# --goal-tr--

Duvarlar ve hedefler hiç yer değiştirmez; onlara soracağımız tek soru "**şu karede var mı?**" olacak. Bunun için
birazdan `Set` (küme) kullanacağız.

Ama bir sorun var: küme `{ x: 3, y: 2 }` gibi iki nesneyi karşılaştıramaz; aynı sayılar olsa da onları farklı sayar.
Yazıları ise karşılaştırabilir. Bu yüzden her kareye bir **yazı adı** vereceğiz: 3. sütun, 2. satır → `'3,2'`. Bir
sinema koltuğunun "C-7" numarası gibi.

# --code--

```js
const key = (x, y) => x + ',' + y // one string per tile, so tiles can go in a Set
```

# --meaning--

- `(x, y) => ...` is a short function (an arrow function) with two parameters; it gives back what is after the arrow.
- `x + ',' + y` glues the numbers and a comma into one text: `key(3, 2)` is `'3,2'`.

# --meaning-tr--

- `(x, y) => ...` → **ok fonksiyonu** (arrow function): fonksiyonun kısa yazılışı. `x` ve `y` iki **parametre**:
  fonksiyona verilen değerler. Oktan (`=>`) sonrası fonksiyonun **sonucu**; `key(3, 2)` diye çağırınca o sonucu geri
  verir.
- `x + ',' + y` → `+` bir yazıyla kullanılınca **yan yana ekler**: `3` + `','` + `2` = `'3,2'`.
- `const key =` → fonksiyona `key` (anahtar) adını verir.
- Satır sonundaki yorum neden gerektiğini söylüyor.

# --task--

Under the list's closing `]`, leave an empty line and write the `key` line. Press **Run**.

# --task-tr--

Bölüm listesini kapatan `]` satırının altına bir boş satır bırakıp `key` satırını yaz (`function draw()`'dan önce).
**Çalıştır**. Ekran değişmez; kontroller fonksiyonu deniyor.

# --predict--

What does `key(12, 3)` give?
- [ ] `15`
- [x] `'12,3'`
  With a text in the middle, `+` glues instead of adding.
- [ ] `'123'`

# --predict-tr--

`key(12, 3)` ne verir?
- [ ] `15`
- [x] `'12,3'`
  Ortada bir yazı (`','`) olduğu için `+` toplamaz, yan yana ekler.
- [ ] `'123'`

# --tests--

`key(x, y)` should give the tile's name as text.
tr: `key(x, y)` karenin adını yazı olarak vermeli.

```js
assert.strictEqual(key(3, 2), '3,2')
assert.strictEqual(key(0, 10), '0,10')
```

# --solution--

```js
// Sokoban, step by step.
// The page already has <canvas id="game" width="480" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

// The classic Sokoban text format: # wall, . goal, $ box, * box on a goal, @ player, + player on a goal.
const LEVELS = [
  [
    '#####',
    '#@$.#',
    '#####',
  ],
]

const key = (x, y) => x + ',' + y // one string per tile, so tiles can go in a Set

function draw() {
  ctx.fillStyle = '#1c1917'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

draw()
```

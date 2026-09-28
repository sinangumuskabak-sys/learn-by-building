---
title: Two paddles
title_tr: İki raket
skills: [game.state]
---

# --explanation--

Each paddle is a small piece of state: where it is. Both paddles have the same size, so the size goes in constants and
each paddle object only holds its position:

```js
const PADDLE_W = 10
const PADDLE_H = 80
let left = { x: 20, y: 160 }
```

The right paddle should sit 20 pixels from the right edge. Its `x` is its **left** side, so it is not
`canvas.width - 20` but `canvas.width - 20 - PADDLE_W`. Getting this right once, in one place, saves you from
off-by-ten bugs later.

Now that there are several things to draw, move all drawing into one `draw()` function that repaints the whole scene
from the state, back to front: court first, paddles on top.

# --explanation-tr--

**Bu adımda:** sahaya iki beyaz raket koyacağız. Sağda, sol ve sağ kenarın yakınında dik duran iki beyaz
dikdörtgen göreceksin.

**Durum (state) nedir?** Oyunun şu anki hâlini anlatan bilgilere **durum** denir: raket nerede, top nerede, skor
kaç. Bir raket için bilmemiz gereken tek şey konumudur.

**Büyük harfli sabitler.** İki raketin boyutu aynıdır ve hiç değişmez. Böyle sabit ayarları, herkes "bu bir ayar"
diye anlasın diye BÜYÜK HARFLE adlandırırız:

```js
const PADDLE_W = 10   // raketin eni (W = width, genişlik)
const PADDLE_H = 80   // raketin boyu (H = height, yükseklik)
```

**Nesne (object) nedir?** Birbirine ait birkaç bilgiyi tek pakette tutmanın yolu. Süslü parantez açılır, içine
`ad: değer` çiftleri virgülle yazılır:

```js
let left = { x: 20, y: 160 }
```

Bu, "sol raketin `x`'i 20, `y`'si 160" demek. İçindeki bir değeri nokta ile okursun: `left.x` → 20. Raketler
ileride hareket edeceği için `const` değil `let` kullanıyoruz (1. adımda gördüğün gibi `let` değişebilir).

**Sağ raket nerede?** Sağ kenardan 20 piksel içeride durmalı. Ama raketin `x`'i onun **sol** kenarıdır. Sağ kenarı
600 − 20 = 580'de olsun istiyorsak sol kenarı bir raket eni daha soldadır:

```js
let right = { x: canvas.width - 20 - PADDLE_W, y: 160 }   // 600 - 20 - 10 = 570
```

Bu hesabı tek yerde bir kez doğru yapmak, ileride "on piksel kaydı" türü hatalardan korur.

**Fonksiyon (function) nedir?** Bir iş listesine ad verip saklamaktır; bir yemek tarifi gibi. **Tanımlamak** tarifi
deftere yazmaktır, henüz yemek pişmez. **Çağırmak** tarifi uygulamaktır:

```js
function draw() {       // "draw" adlı tarifi tanımla; { } içi tarifin adımları
  // ...
}

draw()                  // tarifi şimdi uygula (çağır)
```

Çağırırken adın sonuna `()` yazılır. Çizilecek şeyler çoğaldığı için bütün çizimi tek bir `draw()` fonksiyonuna
topluyoruz. Sıra önemli: önce saha (arka), sonra raketler (ön), yoksa saha raketlerin üstünü boyar.

# --task--

1. Add `const PADDLE_W = 10` and `const PADDLE_H = 80`.
2. Add `let left = { x: 20, y: 160 }` and `let right = { x: canvas.width - 20 - PADDLE_W, y: 160 }`.
3. Move the court drawing into `function draw()`, and after it draw both paddles as `'white'` rectangles
   `PADDLE_W` × `PADDLE_H` at their positions. Call `draw()` once.

# --task-tr--

1. `const ctx = canvas.getContext('2d')` satırının altına bir boş satır bırak ve iki boyut sabitini yaz:

   ```js
   const PADDLE_W = 10
   const PADDLE_H = 80
   ```

2. Bir boş satır daha bırak ve iki raketin konumunu ekle:

   ```js
   let left = { x: 20, y: 160 }
   let right = { x: canvas.width - 20 - PADDLE_W, y: 160 }
   ```

3. Altta zaten duran saha çizimini (siyah boyama ve `for` döngüsü) bir `draw()` fonksiyonunun içine al. Sonra iki
   raketi çizen satırları ekle ve en alta `draw()` çağrısını yaz. Kodunun `let right = ...` satırından sonrası
   tamamen şöyle olmalı:

   ```js
   function draw() {                                          // ← yeni
     ctx.fillStyle = 'black'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     ctx.fillStyle = 'white'
     for (let y = 0; y < canvas.height; y += 30) {
       ctx.fillRect(canvas.width / 2 - 2, y, 4, 15)
     }

     ctx.fillRect(left.x, left.y, PADDLE_W, PADDLE_H)        // ← yeni
     ctx.fillRect(right.x, right.y, PADDLE_W, PADDLE_H)      // ← yeni
   }                                                          // ← yeni

   draw()                                                     // ← yeni
   ```

   Raketler için ayrıca renk seçmedik: fırça zaten beyazda kaldı.

4. **Çalıştır**'a bas. Sahanın iki yanında birer beyaz raket görmelisin; alttaki kontrollerin hepsi yeşil olmalı.
   Kırmızı kalırsa `function draw() {` ile açtığın süslü parantezin raket satırlarından **sonra** kapandığını
   kontrol et.

# --tests--

The paddles should start at the given positions.
tr: Raketler verilen konumlarda başlamalı.

```js
assert.deepEqual([PADDLE_W, PADDLE_H], [10, 80])
assert.deepEqual(left, { x: 20, y: 160 })
assert.deepEqual(right, { x: 570, y: 160 })
```

Both paddles should be drawn as white 10×80 rectangles.
tr: İki raket de beyaz 10×80 dikdörtgen olarak çizilmeli.

```js
const paddles = $.rects('white').filter((r) => r.w === 10 && r.h === 80)
assert.sameDeepMembers(paddles, [
  { x: 20, y: 160, w: 10, h: 80, color: 'white' },
  { x: 570, y: 160, w: 10, h: 80, color: 'white' },
])
```

`draw()` should draw the paddles wherever they are, over the court.
tr: `draw()` raketleri nerede olurlarsa orada, sahanın üstüne çizmeli.

```js
left.y = 0
right.y = 320
draw()
const paddles = $.rects('white').filter((r) => r.w === 10 && r.h === 80)
assert.sameDeepMembers(paddles.map((p) => p.y), [0, 320])
assert.lengthOf($.rects('white').filter((r) => r.w === 4), 14, 'the center line is still drawn')
```

# --solution--

```js
// Pong, step by step.
// The page already has <canvas id="game" width="600" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const PADDLE_W = 10
const PADDLE_H = 80

let left = { x: 20, y: 160 }
let right = { x: canvas.width - 20 - PADDLE_W, y: 160 }

function draw() {
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'white'
  for (let y = 0; y < canvas.height; y += 30) {
    ctx.fillRect(canvas.width / 2 - 2, y, 4, 15)
  }

  ctx.fillRect(left.x, left.y, PADDLE_W, PADDLE_H)
  ctx.fillRect(right.x, right.y, PADDLE_W, PADDLE_H)
}

draw()
```

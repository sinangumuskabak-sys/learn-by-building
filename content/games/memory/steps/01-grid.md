---
title: Get the canvas and the pen
title_tr: Canvas'ı ve kalemi al
skills: [game.canvas]
---

# --goal--

Memory is drawn on a `<canvas>` 400 pixels wide and 440 high, with the id `game`. We find it from JavaScript and ask it
for its 2D context, the object that holds every drawing command.

# --goal-tr--

Bir **hafıza kartları** oyunu yazacağız: 16 kart kapalı durur, ikişer ikişer açıp aynı meyveleri eşleştirirsin.

Oyundaki her şey sayfadaki bir **canvas** (tuval) üzerine çizilir: 400 piksel eninde, 440 piksel boyunda boş bir
dikdörtgen. Resim yapmadan önce iki şey lazım: **kâğıt** ve **kalem**. Bu adımda ikisini de alıyoruz; ekranda henüz bir
şey değişmeyecek.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')
```

# --meaning--

- `document` is the page; `getElementById('game')` finds the element whose id is `game`.
- `const canvas =` gives what was found a name, so later lines can use it.
- `canvas.getContext('2d')` asks the canvas for its 2D drawing tools; we call them `ctx` (short for context).

# --meaning-tr--

- `document` → **sayfanın kendisi.** Sayfadaki her şeye buradan ulaşırız.
- `.getElementById('game')` → "kimliği (id) `game` olan öğeyi bul". Nokta (`.`) "bunun içindeki şu komut" demek;
  parantez `( )` komuta bilgi verir. Tırnak içindeki `'game'` bir **yazıdır** (metin).
- `const canvas =` → bulunan şeye **canvas** adını verir. Kutuya etiket yapıştırmak gibi: bundan sonra hep bu adla
  çağırırız. `const` "bu ad hep aynı şeyi gösterecek" demek; `=` "sağdakini soldaki ada ver".
- `canvas.getContext('2d')` → canvas'tan **2 boyutlu çizim kalemini** ister.
- `const ctx =` → kaleme `ctx` adını verir (context, yani bağlam kelimesinin kısaltması). Bütün çizim satırları
  `ctx.` ile başlayacak: "kalemle şunu yap".

# --task--

Write the two lines under the three comment lines, then press **Run**.

# --task-tr--

Kodu, editördeki üç yorum satırının (`//` ile başlayanlar; bilgisayar onları okumaz, insanlar için not) **altına**
yaz. Kopyalama; kendin yaz, harf harf. Sonra **Çalıştır**'a bas (ya da `Ctrl + Enter`). Ekran değişmez, ama alttaki
kontroller yeşil olmalı.

# --hint--

Check the spelling: `getElementById` has a capital `E`, `B` and `I`; `getContext` has a capital `C`.

# --hint-tr--

Yazımı kontrol et: `getElementById` içinde büyük `E`, `B` ve `I` var; `getContext` içinde büyük `C` var. Büyük/küçük harf önemli.

# --tests--

`canvas` should be the `#game` canvas element.
tr: `canvas`, sayfadaki `#game` canvas'ı olmalı.

```js
assert.strictEqual(canvas, $.canvas)
```

`ctx` should be the canvas's 2D context.
tr: `ctx`, canvas'ın 2D çizim bağlamı olmalı.

```js
assert.strictEqual(ctx, $.canvas.getContext('2d'))
```

# --seed--

```js
// Memory, step by step.
// The page already has <canvas id="game" width="400" height="440"></canvas>.
// Write your code below.
```

# --solution--

```js
// Memory, step by step.
// The page already has <canvas id="game" width="400" height="440"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')
```

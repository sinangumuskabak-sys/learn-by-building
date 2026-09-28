---
title: The runner and the ground
title_tr: Koşucu ve zemin
skills: [game.canvas, game.state]
---

# --explanation--

The whole game happens along one line: the ground. Everything stands on it, so store its height once, as `GROUND`,
and place things relative to it.

A runner 44 pixels tall standing on the ground has its **top** at `GROUND - 44`, because rectangles are positioned by
their top-left corner and `y` grows downwards. You will write "`GROUND - height`" a lot in this game. Whenever you want
something to *stand on* a line, subtract its height from the line.

For now the runner is just a rectangle. Simple shapes let you get the game working and fun first; art can come later
and never changes the rules.

# --explanation-tr--

**Bu adımda:** koşu oyununun sahnesini kuracağız. Sağda açık renkli bir alan, üstünde yatay koyu bir zemin çizgisi
ve çizginin üstünde duran koyu gri bir dikdörtgen (koşucumuz) göreceksin.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya, satır satır** okur ve yapar. `//` ile başlayan kısımlar
**yorumdur**: bilgisayar onları atlar, sadece insanlar için not.

**Canvas (tuval) nedir?** Sayfada 600 piksel eninde, 220 piksel boyunda boş bir resim alanı var. Adı `canvas`,
kimliği (id) `game`. Oyundaki her şeyi bu alanın üstüne **boyayarak** göstereceğiz. Önce kâğıdı bulur, sonra
fırçayı alırız:

```js
const canvas = document.getElementById('game')  // kâğıt: kimliği 'game' olan canvas
const ctx = canvas.getContext('2d')             // fırça: canvas'ın 2D çizim aracı (context)
```

- `const canvas =` → "Bundan sonra şuna `canvas` diyeceğim." `const` ile ad verilen şeye **sabit** denir: bir
  kutuya etiket yapıştırmak gibi, sonra hep o etiketle çağırırsın ve içi değişmez.
- `document` sayfanın kendisidir. Nokta (`.`) "bunun içindeki şu komut" demektir. Tırnak içindeki `'game'` bir
  **yazıdır** (metin).

**Renk ve dikdörtgen.** Fırçayla iki şey yaparsın: renk seçmek ve dikdörtgen boyamak.

```js
ctx.fillStyle = '#334155'      // fırçaya bu rengi sür
ctx.fillRect(10, 20, 50, 30)   // dikdörtgen boya: x, y, genişlik, yükseklik
```

`'#334155'` gibi `#` ile başlayan yazılar renk kodudur. Canvas'ın **sol üst köşesi** `(0, 0)`'dır: `x` sağa
gittikçe, `y` ise **aşağı** indikçe büyür. Dikdörtgen, verdiğin `x, y` noktasından yani **sol üst köşesinden**
başlayarak sağa ve aşağı boyanır.

**Zemin için bir sabit.** Oyunun her şeyi tek bir çizginin, zeminin üstünde olur. Zeminin yüksekliğini bir kez
yazıp ad veririz: `const GROUND = 180`. Artık her yerde `180` yerine `GROUND` yazarız; sayı değişirse tek yerden
düzeltiriz. Büyük harfli adlar "bu hiç değişmeyen bir ayar" demenin alışılmış yoludur.

**Bir şeyi çizginin üstünde durdurmak.** 44 piksel boyundaki koşucunun **ayakları** `y = 180`'de olmalı. Ama
dikdörtgeni sol üst köşesinden veriyoruz, o yüzden **tepesi** `180 - 44 = 136`'da olmalı. Kural: bir şeyi bir
çizginin üstüne koymak istiyorsan, çizgiden **kendi boyunu çıkar**: `GROUND - 44`.

**Nesne (object).** Koşucunun konumu ve boyu birbirine ait dört bilgidir. Bunları süslü parantez `{ }` içinde tek
bir paket hâlinde tutarız:

```js
let runner = { x: 50, y: GROUND - 44, w: 40, h: 44 }
```

- Her `ad: değer` çiftine **alan** denir; virgülle ayrılır. `w` genişlik (width), `h` yükseklik (height).
- Bir alanı okumak için nokta kullanırız: `runner.x` → `50`, `runner.h` → `44`.
- `let` de `const` gibi ad verir, ama `let` ile verilenin içi **sonradan değişebilir**. Koşucu hareket edeceği için
  `let` kullanıyoruz.

**Fonksiyon (function).** Birkaç komutu bir ad altında toplayıp sonra tek kelimeyle yaptırmaya yarar. Yemek tarifi
gibi: önce tarifi yazarsın (**tanımlamak**), sonra "şu tarifi yap" dersin (**çağırmak**).

```js
function draw() {
  // buradaki komutlar draw() çağrılınca çalışır
}

draw()   // şimdi çalıştır
```

`function draw()` tarifin adını verir, `{` ile `}` arası tarifin içidir. Tanımlamak tek başına hiçbir şey çizmez;
en alttaki `draw()` satırı onu çalıştırır. Şekiller şimdilik basit dikdörtgenler: önce oyunu çalışır ve eğlenceli
yaparız, güzel çizimler sonra gelebilir ve kuralları değiştirmez.

# --task--

1. Store the canvas and context in `canvas` and `ctx`, and add `const GROUND = 180`.
2. Add `let runner = { x: 50, y: GROUND - 44, w: 40, h: 44 }`.
3. Write `draw()`: fill the canvas with `'#f8fafc'`, draw the ground as a `'#475569'` line 2 pixels tall across the
   canvas at `y = GROUND`, and the runner as a `'#334155'` rectangle. Call `draw()`.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** tıkla ve kâğıdı ve fırçayı alan iki
   satırı yaz:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir satır boşluk bırak ve zeminin yüksekliğini yaz:

   ```js
   const GROUND = 180 // y of the ground line
   ```

3. Bir satır boşluk bırak ve koşucuyu tanımla:

   ```js
   let runner = { x: 50, y: GROUND - 44, w: 40, h: 44 }
   ```

4. Bir satır boşluk bırak ve çizim fonksiyonunu yaz. İçinde üç çizim var: önce bütün alanı açık renge boya (eski
   resmi siler), sonra zemin çizgisi, sonra koşucu:

   ```js
   function draw() {
     ctx.fillStyle = '#f8fafc'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     ctx.fillStyle = '#475569'
     ctx.fillRect(0, GROUND, canvas.width, 2)

     ctx.fillStyle = '#334155'
     ctx.fillRect(runner.x, runner.y, runner.w, runner.h)
   }
   ```

   Zemin çizgisi aslında çok ince bir dikdörtgendir: `x = 0`'dan başlar, `y = GROUND`'dadır, canvas'ın eni
   (`canvas.width`, 600) kadar uzundur ve 2 piksel kalınlığındadır. Koşucunun dikdörtgeni ise değerlerini
   `runner` nesnesinin alanlarından alır.

5. `draw()` fonksiyonunun kapanan `}`'sinden sonra bir satır boşluk bırak ve fonksiyonu çağır:

   ```js
   draw()
   ```

6. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sağda açık renkli alanın altında bir zemin çizgisi ve onun üstünde
   duran koyu gri bir dikdörtgen görmelisin. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa renk
   kodlarını ve `GROUND - 44` yazımını harf harf karşılaştır.

# --tests--

The runner should stand on the ground.
tr: Koşucu zeminde durmalı.

```js
assert.strictEqual(GROUND, 180)
assert.deepEqual(runner, { x: 50, y: 136, w: 40, h: 44 })
assert.strictEqual(runner.y + runner.h, GROUND)
```

The ground line and the runner should be drawn.
tr: Zemin çizgisi ve koşucu çizilmeli.

```js
assert.deepEqual($.rects('#475569'), [{ x: 0, y: 180, w: 600, h: 2, color: '#475569' }])
assert.deepEqual($.rects('#334155'), [{ x: 50, y: 136, w: 40, h: 44, color: '#334155' }])
```

# --seed--

```js
// Endless runner, step by step.
// The page already has <canvas id="game" width="600" height="220"></canvas>.
// Write your code below.
```

# --solution--

```js
// Endless runner, step by step.
// The page already has <canvas id="game" width="600" height="220"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 180 // y of the ground line

let runner = { x: 50, y: GROUND - 44, w: 40, h: 44 }

function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#475569'
  ctx.fillRect(0, GROUND, canvas.width, 2)

  ctx.fillStyle = '#334155'
  ctx.fillRect(runner.x, runner.y, runner.w, runner.h)
}

draw()
```

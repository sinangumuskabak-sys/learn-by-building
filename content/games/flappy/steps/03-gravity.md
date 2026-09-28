---
title: Gravity
title_tr: Yerçekimi
skills: [game.physics, game.loop]
---

# --explanation--

Things in games move with two numbers:

- **position**: where it is (`bird.y`)
- **velocity**: how much the position changes every frame (`bird.vy`, "velocity along y")

Gravity does not move the bird directly. It changes the **velocity**, a little every frame. That is what
*acceleration* means:

```js
bird.vy += GRAVITY   // falling gets faster and faster
bird.y += bird.vy    // then move by the current speed
```

With `GRAVITY = 0.5` the bird moves 0.5 px in the first frame, 1 px in the second, 1.5 px in the third... It starts
slowly and speeds up, which is exactly what a real fall looks like. Two lines, and it already feels physical.

This runs inside a game loop: `update()` changes the state, `draw()` shows it, `requestAnimationFrame` repeats about 60
times a second. (In this game we update once per frame. The last step makes that robust on fast screens.)

# --explanation-tr--

**Bu adımda:** kuşa yerçekimi ekleyeceğiz. Çalıştırınca sarı kuş önce yavaşça, sonra gittikçe hızlanarak aşağı
düşecek ve ekrandan çıkıp kaybolacak. (Henüz zıplayamıyor, o bir sonraki adımda.)

**Hareket = çok hızlı değişen resimler.** Çizgi filmler gibi: ekranı saniyede yaklaşık 60 kez yeniden çizeriz ve
her seferinde kuşu biraz farklı bir yere koyarız. Her bir resme **kare** (frame) denir.

**Hareket iki sayıyla anlatılır:**

- **konum**: kuş nerede? (`bird.y`)
- **hız**: her karede konum ne kadar değişiyor? (`bird.vy`, "y yönündeki hız"; İngilizce *velocity*)

Yerçekimi kuşu doğrudan itmez; **hızını** her karede biraz artırır. Buna **ivme** denir:

```js
bird.vy += GRAVITY   // düşüş hızı biraz artsın
bird.y += bird.vy    // kuş o anki hızı kadar aşağı insin
```

`+=` işareti "üstüne ekle" demektir: `bird.vy += GRAVITY`, "`bird.vy`'nin şimdiki değerine `GRAVITY` ekle ve sonucu
yine `bird.vy`'ye yaz" anlamına gelir. `y` aşağı doğru büyüdüğü için `y`'yi artırmak kuşu **aşağı** indirir.

`GRAVITY = 0.5` ile kuş ilk karede 0,5 piksel, ikincide 1, üçüncüde 1,5 piksel iner... Yavaş başlar ve hızlanır;
gerçek bir düşüş de tam böyle görünür.

**Büyük harfli ad neden?** `GRAVITY` (yerçekimi) oyun boyunca hiç değişmeyecek bir ayar. Böyle ayarları büyük
harfle yazmak bir alışkanlıktır: okuyan kişi "bu bir ayar" diye hemen anlar. Satır sonundaki `// ...` açıklama bir
yorumdur, bilgisayar atlar.

**Oyun döngüsü (game loop).** Her oyunun kalbinde tekrar tekrar dönen üç iş vardır:

1. `update()` → durumu değiştir (kuşu hareket ettir),
2. `draw()` → yeni durumu ekrana çiz,
3. bir sonraki karede yine aynısını yap.

```js
function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}
```

`requestAnimationFrame(loop)` tarayıcıya "ekranı bir sonraki yenileyişinde `loop`'u çalıştır" der. `loop` da en
sonunda kendini tekrar sıraya koyar; böylece saniyede yaklaşık 60 kez dönen bir döngü oluşur. Dikkat: burada
`loop` **parantezsiz** yazılır. `loop()` yazsaydık "şimdi çalıştır" demiş olurduk; `loop` ise "bu tarifi al, sırası
gelince sen çalıştır" demektir.

(Bu oyunda her karede bir güncelleme yapıyoruz. Son adımda bunu çok hızlı ekranlarda da doğru çalışır hâle
getireceğiz.)

# --task--

1. Add `const GRAVITY = 0.5` and give the bird a velocity: `vy: 0` in the `bird` object.
2. Write `function update()` that adds `GRAVITY` to `bird.vy`, then adds `bird.vy` to `bird.y`.
3. Write `function loop()` that calls `update()`, then `draw()`, then `requestAnimationFrame(loop)`.
4. Start it with `requestAnimationFrame(loop)` instead of calling `draw()` once.

Run it and watch the bird fall off the screen.

# --task-tr--

1. `const ctx = canvas.getContext('2d')` satırının altına, `let bird` satırından **önce**, yerçekimi ayarını ekle:

   ```js
   const GRAVITY = 0.5 // added to the bird's speed every frame
   ```

2. Kuşa bir hız alanı ver. `let bird` satırını şöyle değiştir:

   ```js
   let bird = { x: 100, y: 300, vy: 0, r: 14 }
   ```

   `vy: 0` kuşun başta hareketsiz olduğunu söyler.

3. `let bird` satırının altına, `function draw()`'dan **önce**, kuşu hareket ettiren fonksiyonu yaz:

   ```js
   function update() {
     bird.vy += GRAVITY
     bird.y += bird.vy
   }
   ```

4. `draw()` fonksiyonunun kapanış `}`'inden sonra döngü fonksiyonunu ekle:

   ```js
   function loop() {
     update()
     draw()
     requestAnimationFrame(loop)
   }
   ```

5. En alttaki `draw()` satırını sil ve yerine döngüyü başlatan satırı yaz:

   ```js
   requestAnimationFrame(loop)
   ```

6. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sarı kuş hızlanarak aşağı düşüp ekrandan çıkmalı ve alttaki
   kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa: `update()` içinde önce `bird.vy`'nin, sonra `bird.y`'nin
   değiştiğinden emin ol; sıra önemli.

# --tests--

`GRAVITY` should be 0.5 and the bird should start still.
tr: `GRAVITY` 0.5 olmalı ve kuş hareketsiz başlamalı.

```js
assert.strictEqual(GRAVITY, 0.5)
assert.strictEqual(bird.vy, 0)
```

`update()` should speed the fall up, then move the bird.
tr: `update()` önce düşüşü hızlandırmalı, sonra kuşu hareket ettirmeli.

```js
update()
assert.strictEqual(bird.vy, 0.5)
assert.strictEqual(bird.y, 300.5)
update()
assert.strictEqual(bird.vy, 1)
assert.strictEqual(bird.y, 301.5)
```

The loop should update and redraw every frame.
tr: Döngü her karede güncellemeli ve yeniden çizmeli.

```js
$.tick(10)
assert.closeTo(bird.vy, 5, 0.001)
assert.closeTo(bird.y, 327.5, 0.001)
assert.closeTo($.arcs()[0].y, bird.y, 0.001)
assert.strictEqual($.pendingFrames, 1)
```

# --solution--

```js
// Flappy, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GRAVITY = 0.5 // added to the bird's speed every frame

let bird = { x: 100, y: 300, vy: 0, r: 14 }

function update() {
  bird.vy += GRAVITY
  bird.y += bird.vy
}

function draw() {
  ctx.fillStyle = '#70c5ce'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'gold'
  ctx.beginPath()
  ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2)
  ctx.fill()
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```

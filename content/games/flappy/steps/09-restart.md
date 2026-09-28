---
title: Try again, beat your best
title_tr: Tekrar dene, rekorunu kır
skills: [game.state, prog.functions]
---

# --explanation--

A game you cannot restart without reloading the page is a game people stop playing. Time to close the state machine's
loop: from `'over'`, a flap goes back to `'ready'` with a fresh world.

"A fresh world" means every piece of state back to its starting value. Collect those in **one** `reset()` function and
call it both at startup and on restart. If the first game and the tenth start from different code, sooner or later
they will start differently, and that bug is very hard to spot.

The best score goes in `localStorage`, which survives reloads. Update it at the one place a game ends. Giving that
place a name, `endGame()`, means there is exactly one spot where "the game just ended" logic lives. When you later add
a sound or a medal, you add it there.

# --explanation-tr--

**Bu adımda:** oyunu yeniden başlatılabilir yapacağız ve en iyi skoru (rekoru) saklayacağız. `Game Over`'dan sonra
Boşluk'a basınca kuş başa dönecek; skorun altında `Best: 3` gibi rekorun yazacak ve sayfayı yenilesen bile
kaybolmayacak.

**Neden?** Sayfayı yenilemeden yeniden başlatılamayan bir oyunu insanlar bırakır. Durum makinesinin döngüsünü
kapatma zamanı: `'over'` durumundayken bir çırpış, tertemiz bir dünyayla `'ready'`'ye döner.

**Tek bir `reset()` fonksiyonu.** "Tertemiz dünya", her durum bilgisinin başlangıç değerine dönmesi demek. Bunları
**tek** bir `reset()` (sıfırla) fonksiyonunda toplarız ve onu hem oyun ilk açılırken hem yeniden başlarken çağırırız.
İlk oyunla onuncu oyun farklı kodlardan başlarsa, er ya da geç farklı başlarlar ve bu hatayı fark etmek çok zordur.

**Değersiz `let`.** Değişkenleri yine en üstte tanımlarız ama değer vermeyiz:

```js
let bird
let pipes
```

Böyle bir değişken şimdilik boştur (JavaScript buna `undefined`, "tanımsız" der). Değerini hemen sonra `reset()`
verecek. Değişkenler en üstte tanımlı olmalı ki bütün fonksiyonlar onları görebilsin.

**Tarayıcının hafızası: `localStorage`.** Normal değişkenler sayfa yenilenince sıfırlanır. `localStorage` ise
tarayıcının küçük bir defteri gibidir; yazdığın şey yenilemeden sonra da kalır:

```js
localStorage.setItem('flappy-best', 3)   // 'flappy-best' başlığı altına 3 yaz
localStorage.getItem('flappy-best')      // o başlıkta ne yazıyor? → '3' (yazı olarak)
```

Defter her şeyi **yazı** olarak saklar ve daha önce hiç yazılmamışsa "hiçbir şey" (`null`) verir. Bu yüzden:

```js
let best = Number(localStorage.getItem('flappy-best')) || 0
```

- `Number(...)` yazıyı sayıya çevirir: `'3'` → `3`.
- `|| 0` → "soldaki işe yarar bir değer değilse (boş ya da sıfırsa) `0` kullan". Rekor yoksa `best` 0 olur.

**Oyunun bittiği tek yer: `endGame()`.** Rekoru, oyunun bittiği yerde güncelleriz. O yere bir ad vermek
(`endGame`, "oyunu bitir") şu demek: "oyun az önce bitti" ile ilgili her şey tek bir yerde durur. İleride bir ses ya
da madalya eklemek istersen oraya eklersin.

**Yazıları birleştirmek.** `'Best: ' + best` yazı ile sayıyı yan yana ekler: `best` 3 ise sonuç `'Best: 3'` olur.
Yazılarda `+` "toplamak" değil "ucuna eklemek" demektir.

# --task--

1. Keep `let bird`, `let pipes`, `let frame`, `let score` and `let state` at the top without values, and write
   `function reset()` that sets them to their starting values (bird at `{ x: 100, y: 300, vy: 0, r: 14 }`, no pipes,
   `frame` and `score` `0`, state `'ready'`). Call `reset()` before starting the loop.
2. Add `let best = Number(localStorage.getItem('flappy-best')) || 0`.
3. Write `function endGame()` that sets the state to `'over'` and, when `score > best`, updates `best` and saves it
   with `localStorage.setItem('flappy-best', best)`. Use it in `update()` instead of setting the state directly.
4. In `flap()`, when the state is `'over'`, call `reset()` instead of doing nothing.
5. Draw `Best: 3` (with the real number) under the score, in 16px text.

# --task-tr--

1. En üstteki şu beş satırı:

   ```js
   let bird = { x: 100, y: 300, vy: 0, r: 14 }
   let state = 'ready' // 'ready', 'playing' or 'over'
   let pipes = []
   let frame = 0
   let score = 0
   ```

   silip yerine şunu yaz (değişkenler değersiz, sıralama da değişti; değerleri artık `reset()` veriyor):

   ```js
   let bird
   let pipes
   let frame
   let score
   let state // 'ready', 'playing' or 'over'
   let best = Number(localStorage.getItem('flappy-best')) || 0

   function reset() {
     bird = { x: 100, y: 300, vy: 0, r: 14 }
     pipes = []
     frame = 0
     score = 0
     state = 'ready'
   }
   ```

2. `flap()` fonksiyonunu, oyun bittiyse baştan başlatacak şekilde değiştir:

   ```js
   function flap() {
     if (state === 'over') {   // ← değişti
       reset()                 // ← yeni
       return                  // ← yeni
     }                         // ← yeni
     state = 'playing'
     bird.vy = FLAP
   }
   ```

   `reset()` durumu `'ready'` yapar; `return` sayesinde bu çırpış kuşu hemen uçurmaz. Bir sonraki çırpış oyunu
   başlatır.

3. `hitsPipe()` fonksiyonunun kapanış `}`'inden sonra, `function update()`'ten **önce**, oyunu bitiren fonksiyonu
   yaz:

   ```js
   function endGame() {
     state = 'over'
     if (score > best) {
       best = score
       localStorage.setItem('flappy-best', best)
     }
   }
   ```

4. `update()` fonksiyonunun son satırını, durumu doğrudan değiştirmek yerine `endGame()`'i çağıracak şekilde
   değiştir:

   ```js
     if (hitGround || hitSky || pipes.some(hitsPipe)) endGame()   // ← değişti
   ```

5. `draw()` fonksiyonunda, skoru yazan `ctx.fillText(String(score), canvas.width / 2, 70)` satırının hemen altına
   rekoru ekle:

   ```js
     ctx.font = '16px sans-serif'
     ctx.fillText('Best: ' + best, canvas.width / 2, 95)
   ```

6. Yine `draw()` içinde, `if (state === 'over') {` bloğunda `Game Over` satırının altına bir ipucu ekle:

   ```js
     if (state === 'over') {
       ctx.font = 'bold 36px sans-serif'
       ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
       ctx.font = '18px sans-serif'                                                          // ← yeni
       ctx.fillText('Press Space to try again', canvas.width / 2, canvas.height / 2 + 34)   // ← yeni
     }
   ```

7. En alttaki `requestAnimationFrame(loop)` satırının **üstüne** oyunu ilk kez hazırlayan çağrıyı ekle:

   ```js
   reset()
   requestAnimationFrame(loop)
   ```

   Bunu unutursan `bird` boş kalır ve oyun hiç çizilmez.

8. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Oynamak için önce oyuna tıkla. Bir kez oyna ve kaybet: skorun
   altında `Best:` ile rekorun görünmeli; Boşluk'a basınca kuş başa dönmeli. Alttaki kontrollerin hepsi yeşil
   olmalı. Kırmızı kalırsa `'flappy-best'` yazısının iki yerde de birebir aynı olduğunu kontrol et.

# --tests--

`reset()` should restore a fresh game.
tr: `reset()` yepyeni bir oyun getirmeli.

```js
bird = { x: 1, y: 2, vy: 3, r: 4 }
pipes = [{ x: 10, gapY: 100, passed: true }]
frame = 55
score = 9
state = 'over'
reset()
assert.deepEqual(bird, { x: 100, y: 300, vy: 0, r: 14 })
assert.deepEqual(pipes, [])
assert.strictEqual(frame, 0)
assert.strictEqual(score, 0)
assert.strictEqual(state, 'ready')
```

A new best score should be saved when the game ends.
tr: Oyun bittiğinde yeni en iyi skor kaydedilmeli.

```js
state = 'playing'
score = 3
bird.y = 590
update()
assert.strictEqual(state, 'over')
assert.strictEqual(best, 3)
assert.strictEqual(localStorage.getItem('flappy-best'), '3')
draw()
assert.include($.texts(), 'Best: 3')
```

A lower score should not replace the best.
tr: Daha düşük bir skor en iyi skorun yerini almamalı.

```js
best = 10
score = 4
endGame()
assert.strictEqual(best, 10)
assert.strictEqual(state, 'over')
```

Flapping after game over should start over.
tr: Oyun bittikten sonra kanat çırpmak baştan başlatmalı.

```js
flap()
$.run(3)
assert.strictEqual(state, 'over')
$.press(' ')
assert.strictEqual(state, 'ready')
assert.strictEqual(bird.y, 300)
$.press(' ')
assert.strictEqual(state, 'playing')
```

# --solution--

```js
// Flappy, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GRAVITY = 0.5 // added to the bird's speed every frame
const FLAP = -8 // the bird's speed right after a flap (negative = up)
const PIPE_WIDTH = 60
const GAP = 160
const PIPE_SPEED = 2
const PIPE_EVERY = 90 // frames between new pipes

let bird
let pipes
let frame
let score
let state // 'ready', 'playing' or 'over'
let best = Number(localStorage.getItem('flappy-best')) || 0

function reset() {
  bird = { x: 100, y: 300, vy: 0, r: 14 }
  pipes = []
  frame = 0
  score = 0
  state = 'ready'
}

function flap() {
  if (state === 'over') {
    reset()
    return
  }
  state = 'playing'
  bird.vy = FLAP
}

document.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key === 'ArrowUp') flap()
})
canvas.addEventListener('pointerdown', flap)

function addPipe() {
  const gapY = 60 + Math.random() * (canvas.height - GAP - 120)
  pipes.push({ x: canvas.width, gapY, passed: false })
}

function hitsPipe(pipe) {
  const overlapsX = bird.x + bird.r > pipe.x && bird.x - bird.r < pipe.x + PIPE_WIDTH
  const insideGap = bird.y - bird.r > pipe.gapY && bird.y + bird.r < pipe.gapY + GAP
  return overlapsX && !insideGap
}

function endGame() {
  state = 'over'
  if (score > best) {
    best = score
    localStorage.setItem('flappy-best', best)
  }
}

function update() {
  if (state !== 'playing') return
  bird.vy += GRAVITY
  bird.y += bird.vy

  frame += 1
  if (frame % PIPE_EVERY === 0) addPipe()
  for (const pipe of pipes) {
    pipe.x -= PIPE_SPEED
    if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.x - bird.r) {
      pipe.passed = true
      score += 1
    }
  }
  pipes = pipes.filter((pipe) => pipe.x + PIPE_WIDTH > 0)

  const hitGround = bird.y + bird.r >= canvas.height
  const hitSky = bird.y - bird.r <= 0
  if (hitGround || hitSky || pipes.some(hitsPipe)) endGame()
}

function draw() {
  ctx.fillStyle = '#70c5ce'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'green'
  for (const pipe of pipes) {
    ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY)
    ctx.fillRect(pipe.x, pipe.gapY + GAP, PIPE_WIDTH, canvas.height - pipe.gapY - GAP)
  }

  ctx.fillStyle = 'gold'
  ctx.beginPath()
  ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'white'
  ctx.textAlign = 'center'
  ctx.font = 'bold 40px sans-serif'
  ctx.fillText(String(score), canvas.width / 2, 70)
  ctx.font = '16px sans-serif'
  ctx.fillText('Best: ' + best, canvas.width / 2, 95)
  if (state === 'ready') {
    ctx.font = '22px sans-serif'
    ctx.fillText('Press Space to start', canvas.width / 2, canvas.height / 2 + 80)
  }
  if (state === 'over') {
    ctx.font = 'bold 36px sans-serif'
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
    ctx.font = '18px sans-serif'
    ctx.fillText('Press Space to try again', canvas.width / 2, canvas.height / 2 + 34)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```

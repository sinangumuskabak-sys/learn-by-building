---
title: Typing letters
title_tr: Harf yazmak
skills: [game.input]
---

# --explanation--

Typing is a string that grows and shrinks. A letter key adds to the end (while there is room for it), Backspace removes
the last letter:

```js
current += key                 // 'cr' + 'a' -> 'cra'
current = current.slice(0, -1) // 'cra' -> 'cr'
```

`slice(0, -1)` means "from the start up to, but not including, the last character". Negative positions count from the
end, which is handy for strings and arrays alike.

The keyboard sends all kinds of keys, so be strict about what counts as a letter: exactly one character from `a` to
`z`, tested with a **regular expression**, `/^[a-z]$/`. `^` and `$` mean "the whole string", so `'Shift'` or `'F5'` do
not sneak in. Pressing `A` with Shift or Caps Lock gives `'A'`, so single characters are turned into lower case first.
Shortcuts like Ctrl+R should still work, so keys held with Ctrl, Cmd or Alt are left alone.

The letters are drawn big and upper case in the first row, and tiles that have a letter get a brighter outline.

# --explanation-tr--

**Bu adımda:** klavyeden harf yazabileceksin. Yazdığın harfler ilk satırda büyük harflerle görünecek, `Backspace` son
harfi silecek. Beş harften fazlası sığmayacak.

**Yazılan kelime bir yazıdır.** Yazılanları `current` adlı bir **değişkende** (`let`) tutarız. Boş yazı `''` (iki
tırnak arası hiçbir şey). Harf eklemek ve silmek:

```js
current += key                 // 'cr' + 'a' -> 'cra'   (+= "sonuna ekle")
current = current.slice(0, -1) // 'cra' -> 'cr'
```

`slice(0, -1)` "baştan başla, son karaktere kadar al (sonuncu hariç)" demektir. Eksi sayılar sondan sayar.
`current.length` yazının kaç harf olduğunu verir. `current[0]` ilk harfi verir (sayma 0'dan başlar); o konumda harf
yoksa sonuç `undefined`, yani "yok" olur.

**`if` ve `else if`.** `if (koşul) komut` → koşul doğruysa komutu çalıştır. `else if (başka koşul) komut` → ilki
yanlışsa bunu dene. `===` "**eşit mi?**", `<` "küçük mü?", `&&` "**ve**", `||` "**veya**" demektir.

**Sadece harfleri kabul et.** Klavye her türlü tuş gönderir (`'Shift'`, `'F5'`, `'1'`...). Harf olup olmadığını bir
**düzenli ifade** (regular expression) ile sınarız: `/^[a-z]$/`. İki eğik çizgi arasındaki kalıp şu demek: `[a-z]`
"a'dan z'ye bir harf", `^` ve `$` "yazının tamamı". Yani yazı **tam olarak tek bir küçük harf** olmalı.
`/^[a-z]$/.test(key)` bunu sınar ve `true`/`false` verir.

**Klavye olayı.** Bir tuşa basılınca tarayıcı `keydown` **olayını** (event) gönderir. Onu dinleriz:

```js
document.addEventListener('keydown', (event) => {
  // her tuşa basılınca burası çalışır; basılan tuş: event.key
})
```

`(event) => { ... }` kısa yazılmış bir fonksiyondur (**ok fonksiyonu**). Bu dinleyicide:

- `event.ctrlKey || event.metaKey || event.altKey` → Ctrl, Cmd ya da Alt basılıysa `return` ile çık; böylece Ctrl+R
  gibi kısayollar bozulmaz.
- Shift ya da Caps Lock ile `A` basınca `'A'` gelir. `event.key.length === 1 ? event.key.toLowerCase() : event.key`
  → "tek karakterse küçük harfe çevir, değilse (örneğin `'Backspace'`) olduğu gibi bırak". `? :` kısa bir `if`'tir.
- `event.preventDefault()` → tarayıcının o tuşla kendi yapacağı şeyi (örneğin sayfayı kaydırmak) engeller.

**Harfleri çizmek.** Şimdilik bütün harfler ilk satıra gider: `const letters = row === 0 ? current : ''`. Kutuda
harf varsa (`letters[i]`) çerçeve daha açık renk olur ve harf `toUpperCase()` ile büyütülerek kutunun ortasına
yazılır. `ctx.textAlign = 'center'` ve `ctx.textBaseline = 'middle'` yazıyı verilen noktaya göre ortalar;
`ctx.fillText(yazı, x, y)` yazıyı çizer.

**`reset()`** oyunun başlangıç durumunu kuran fonksiyon. Şimdilik sadece `current`'ı boşaltıyor; ileride büyüyecek.

# --task--

1. Add `current` (`''` in `reset()`) and write `type(key)`: `'Backspace'` removes the last letter; a single letter `a`–`z`
   is added if fewer than 5 are typed.
2. On `keydown`, ignore keys held with Ctrl, Cmd (`metaKey`) or Alt. Turn one-character keys into lower case. For
   `Backspace` or a letter, `preventDefault()` and `type()` it.
3. Draw the typed letters in the first row: white, `'bold 28px sans-serif'`, upper case, centered in their tile
   (`textAlign` `'center'`, `textBaseline` `'middle'`, at `y + SIZE / 2 + 1`). Tiles with a letter get a `'#a1a1aa'` outline.

# --task-tr--

1. `const TOP = 12` satırının altına bir satır boşluk bırak ve şunları ekle:

   ```js
   let current // the letters typed so far

   function reset() {
     current = ''
   }

   function type(key) {
     if (key === 'Backspace') current = current.slice(0, -1)
     else if (/^[a-z]$/.test(key) && current.length < 5) current += key
   }

   document.addEventListener('keydown', (event) => {
     if (event.ctrlKey || event.metaKey || event.altKey) return
     const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
     if (key === 'Backspace' || /^[a-z]$/.test(key)) {
       event.preventDefault()
       type(key)
     }
   })
   ```

2. `draw()` fonksiyonunu şöyle değiştir:

   ```js
   function draw() {
     ctx.fillStyle = '#18181b'
     ctx.fillRect(0, 0, canvas.width, canvas.height)
     ctx.textAlign = 'center'     // ← yeni
     ctx.textBaseline = 'middle'  // ← yeni

     for (let row = 0; row < TRIES; row++) {
       // For now every letter goes in the first row.
       const letters = row === 0 ? current : ''  // ← yeni
       for (let i = 0; i < 5; i++) {
         const x = LEFT + i * (SIZE + GAP)
         const y = TOP + row * (SIZE + GAP)
         ctx.strokeStyle = letters[i] ? '#a1a1aa' : '#3f3f46'  // ← değişti
         ctx.lineWidth = 2
         ctx.strokeRect(x + 1, y + 1, SIZE - 2, SIZE - 2)
         if (letters[i]) {                                       // ← yeni
           ctx.fillStyle = 'white'                               // ← yeni
           ctx.font = 'bold 28px sans-serif'                     // ← yeni
           ctx.fillText(letters[i].toUpperCase(), x + SIZE / 2, y + SIZE / 2 + 1)  // ← yeni
         }                                                       // ← yeni
       }
     }
   }
   ```

3. En alttaki `requestAnimationFrame(loop)` satırının **üstüne** `reset()` ekle. Dosyanın sonu şöyle olmalı:

   ```js
   reset()
   requestAnimationFrame(loop)
   ```

4. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla, sonra birkaç harf yaz: harfler ilk satırda büyük harfle
   görünmeli, `Backspace` silmeli, beşten fazlası eklenmemeli. Alttaki kontrollerin hepsi yeşil olmalı. Hiçbir harf
   çıkmıyorsa `reset()` satırını unutmuş olabilirsin.

# --tests--

Letter keys should type and Backspace should delete.
tr: Harf tuşları yazmalı, Backspace silmeli.

```js
$.press('c')
$.press('R')
$.press('a')
assert.strictEqual(current, 'cra')
$.press('Backspace')
assert.strictEqual(current, 'cr')
```

Only five letters should fit, and other keys should be ignored.
tr: Yalnızca beş harf sığmalı ve diğer tuşlar yok sayılmalı.

```js
for (const k of ['q', '1', 'Shift', 'w', 'e', 'F5', 'r', 't', 'y']) $.press(k)
assert.strictEqual(current, 'qwert')
```

The typed letters should be drawn in the first row.
tr: Yazılan harfler ilk satıra çizilmeli.

```js
$.press('h')
$.press('i')
$.tick(1)
const texts = $.screen().filter((c) => c.op === 'fillText')
assert.deepEqual(texts.map((c) => c.args[0]), ['H', 'I'])
assert.deepEqual(texts.map((c) => [c.args[1], c.args[2]]), [[56, 41], [118, 41]])
```

# --solution--

```js
// Word guessing game, step by step.
// The page already has <canvas id="game" width="360" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TRIES = 6
const SIZE = 56 // one letter tile
const GAP = 6
const LEFT = (canvas.width - 5 * SIZE - 4 * GAP) / 2
const TOP = 12

let current // the letters typed so far

function reset() {
  current = ''
}

function type(key) {
  if (key === 'Backspace') current = current.slice(0, -1)
  else if (/^[a-z]$/.test(key) && current.length < 5) current += key
}

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
  if (key === 'Backspace' || /^[a-z]$/.test(key)) {
    event.preventDefault()
    type(key)
  }
})

function draw() {
  ctx.fillStyle = '#18181b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let row = 0; row < TRIES; row++) {
    // For now every letter goes in the first row.
    const letters = row === 0 ? current : ''
    for (let i = 0; i < 5; i++) {
      const x = LEFT + i * (SIZE + GAP)
      const y = TOP + row * (SIZE + GAP)
      ctx.strokeStyle = letters[i] ? '#a1a1aa' : '#3f3f46'
      ctx.lineWidth = 2
      ctx.strokeRect(x + 1, y + 1, SIZE - 2, SIZE - 2)
      if (letters[i]) {
        ctx.fillStyle = 'white'
        ctx.font = 'bold 28px sans-serif'
        ctx.fillText(letters[i].toUpperCase(), x + SIZE / 2, y + SIZE / 2 + 1)
      }
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```

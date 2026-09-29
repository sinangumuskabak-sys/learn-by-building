---
title: Update as you type
title_tr: Yazdıkça güncelle
skills: [prog.functions, game.input]
---

# --goal--

Right now the count is made once, when the page opens. We put it in a function and run it again every time the text
changes.

# --goal-tr--

Şu an sayım yalnız **bir kez**, sayfa açılırken yapılıyor; kutuya yazınca değişmiyor. Sayım satırını bir
**fonksiyona** koyup kutu her değiştiğinde yeniden çalıştıracağız. Böylece dedektif sen yazdıkça çalışır.

# --code--

```js
function update() {
  result.textContent = 'Characters: ' + box.value.length
}

box.addEventListener('input', update)
update()
```

# --meaning--

- `update` does the report; defining it does not run it.
- `addEventListener('input', update)` runs `update` each time the box's text changes.
- The last `update()` makes the first report when the page opens.

# --meaning-tr--

- `function update() { ... }` → raporu hazırlayan fonksiyon. Tanımlamak çalıştırmak değildir.
- `box.addEventListener('input', update)` → "kutuya her **yazıldığında** (input olayı) `update`'i çalıştır".
  Dikkat: `update` yanında parantez yok; fonksiyonu şimdi çağırmıyoruz, **kutuya teslim ediyoruz**.
- `update()` → sayfa açılır açılmaz bir kez çalıştır ki ilk rapor boş kalmasın.

# --task--

Wrap the last line in `function update() { ... }`, then add the listener and the first call.

# --task-tr--

1. Son satırın üstüne `function update() {` yaz, satırı iki boşluk içeri al, altına `}` yaz.
2. Bir boş satırdan sonra dinleyici satırını ve `update()` çağrısını yaz.
3. **Çalıştır**, sonra sağdaki sayfada kutuya bir şeyler yaz: sayı hemen değişmeli.

# --hint--

Pass `update` to `addEventListener` without parentheses: `update()` would run it once, right away.

# --hint-tr--

`addEventListener`'a `update`'i parantezsiz ver: `update()` onu hemen bir kez çalıştırır, teslim etmez.

# --tests--

`update` should be a function.
tr: `update` bir fonksiyon olmalı.

```js
assert.isFunction(window.update)
```

Typing in the box should update the count.
tr: Kutuya yazmak sayıyı güncellemeli.

```js
const type = (value) => { const box = document.querySelector('#text'); box.value = value; box.dispatchEvent(new window.Event('input')) }
const result = () => document.querySelector('#result').textContent
type('Hello')
assert.strictEqual(result(), 'Characters: 5')
```

# --solution--

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Text detective</title>
    <style>
      body { font-family: sans-serif; max-width: 520px; margin: 24px auto; padding: 0 12px; }
      textarea { width: 100%; font: inherit; }
      #result { font-size: 1.2rem; white-space: pre-line; }
    </style>
  </head>
  <body>
    <h1>Text detective</h1>
    <textarea id="text" rows="4">The cat sat on the mat. The cat was happy.</textarea>
    <p id="result"></p>
    <script>
      const box = document.querySelector('#text')
      const result = document.querySelector('#result')

      function update() {
        result.textContent = 'Characters: ' + box.value.length
      }

      box.addEventListener('input', update)
      update()
    </script>
  </body>
</html>
```

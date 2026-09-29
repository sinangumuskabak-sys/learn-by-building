---
title: One setting for the speed
title_tr: Hız için tek ayar
skills: [fe.css]
---

# --goal--

The round length is written once, as a CSS variable. Changing that one value speeds up or slows down the whole
light.

# --goal-tr--

Son adım: turun süresini bir **CSS değişkenine** koyuyoruz. Böylece lambanın hızını tek bir değeri değiştirerek
ayarlayabilirsin. Programcılar bir değeri tek yerde tutmayı sever: değiştirmek kolay, unutmak zor.

# --code--

```css
:root {
  --round: 6s;
}

animation: glow var(--round) infinite;
```

# --meaning--

- `:root` is the whole page; variables set there are visible everywhere. Their names start with `--`.
- `var(--round)` reads the variable where a value is needed.

# --meaning-tr--

- `:root {` → sayfanın **kökü**, yani en dış öğe. Burada tanımlanan değişken her yerden okunur.
- `--round: 6s;` → CSS değişkenlerinin adı `--` ile başlar. Değeri 6 saniye.
- `var(--round)` → "değişkenin değerini buraya koy". `animation` satırında `6s` yerine yazıyoruz.

# --task--

1. Write the `:root` rule under the `body` rule.
2. In `.lamp`, replace `6s` with `var(--round)`.

# --task-tr--

1. `body` kuralının altına `:root` kuralını yaz.
2. `.lamp` kuralındaki `animation` satırında `6s` yerine `var(--round)` yaz.
3. **Çalıştır**. Sonra `--round`'u `3s` yap: lamba iki kat hızlanır. Trafik lamban hazır!

# --try--

Set `--round` to `3s`, then `12s`. Notice the delays stay 2s and 4s: can you make them follow `--round` too? (Hint: `calc(var(--round) / 3)`.)

# --try-tr--

`--round`'u `3s`, sonra `12s` yap. Gecikmeler 2s ve 4s kaldı; onları da `--round`'a bağlayabilir misin? (İpucu: `calc(var(--round) / 3)`.)

# --tests--

`--round` should be set on `:root`.
tr: `--round`, `:root` üzerinde tanımlı olmalı.

```js
const css = (selector, property) => [...document.styleSheets].flatMap((s) => [...s.cssRules]).filter((r) => r.selectorText === selector).map((r) => r.style.getPropertyValue(property)).filter(Boolean).pop() ?? ''
assert.strictEqual(css(':root', '--round').trim(), '6s')
```

The animation should read its length from `--round`.
tr: Animasyon süresini `--round`'dan okumalı.

```js
const css = (selector, property) => [...document.styleSheets].flatMap((s) => [...s.cssRules]).filter((r) => r.selectorText === selector).map((r) => r.style.getPropertyValue(property)).filter(Boolean).pop() ?? ''
assert.match(css('.lamp', 'animation'), /var\(--round\)/)
```

# --solution--

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Traffic light</title>
    <style>
      body {
        display: grid;
        place-items: center;
        min-height: 90vh;
        background: #cbd5e1;
      }

      :root {
        --round: 6s;
      }

      .light {
        width: 90px;
        height: 250px;
        background: #222;
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
      }

      .lamp {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: #555;
        opacity: 0.25;
        animation: glow var(--round) infinite;
      }

      .lamp:nth-child(1) {
        background: red;
      }

      .lamp:nth-child(2) {
        background: gold;
        animation-delay: 2s;
      }

      .lamp:nth-child(3) {
        background: limegreen;
        animation-delay: 4s;
      }

      @keyframes glow {
        0%, 30% {
          opacity: 1;
        }
        35%, 100% {
          opacity: 0.25;
        }
      }
    </style>
  </head>
  <body>
    <div class="light">
      <div class="lamp"></div>
      <div class="lamp"></div>
      <div class="lamp"></div>
    </div>
  </body>
</html>
```

---
title: Make the box look like a card
title_tr: Kutuyu karta benzet
skills: [fe.css]
---

# --goal--

Now we style the `card` box: white, with space inside and rounded corners.

# --goal-tr--

Şimdi `card` adlı kutuyu karta çeviriyoruz: **beyaz** zemin, içeride **boşluk**, **yuvarlak köşeler**.

Bir sınıfa kural yazmak için seçicinin başına nokta konur: `.card` = "sınıfı card olan her şey".

# --code--

```html
.card {
  background: white;
  padding: 24px;
  border-radius: 12px;
}
```

# --meaning--

- `.card` (with a dot) selects elements with `class="card"`.
- `padding: 24px` adds space between the card's edge and its text.
- `border-radius: 12px` rounds the corners.

# --meaning-tr--

- `.card {` → baştaki **nokta** "sınıf" demek: kural yalnız `class="card"` olan kutuya uygulanır.
- `background: white;` → kartın zemini beyaz.
- `padding: 24px;` → **iç boşluk**: kartın kenarı ile içindeki yazı arasında 24 piksel boşluk. Yazılar kenara
  yapışmasın.
- `border-radius: 12px;` → köşeleri 12 piksel yuvarlat. `0` sivri köşe, büyüdükçe daha yuvarlak.

# --task--

Write the `.card` rule under the `body` rule, after an empty line, still inside `<style>`.

# --task-tr--

`body` kuralının kapanan `}` işaretinin altına bir boş satır bırak ve `.card` kuralını yaz (yine `<style>` içinde).
**Çalıştır**.

# --hint--

Don't forget the dot: `.card`, not `card`.

# --hint-tr--

Noktayı unutma: `card` değil `.card`.

# --try--

Set `border-radius` to `40px`, then `0`. Which do you like? Keep your favourite.

# --try-tr--

`border-radius`'u önce `40px`, sonra `0` yap. Hangisini sevdin? Beğendiğin kalsın.

# --tests--

The card should have space inside it.
tr: Kartın içinde boşluk olmalı.

```js
assert.notEqual(window.getComputedStyle(document.querySelector('.card')).paddingTop, '0px')
```

The card should have rounded corners.
tr: Kartın köşeleri yuvarlak olmalı.

```js
assert.notInclude(['', '0px'], window.getComputedStyle(document.querySelector('.card')).borderTopLeftRadius)
```

The card should have its own background.
tr: Kartın kendi arka planı olmalı.

```js
assert.notInclude(['', 'rgba(0, 0, 0, 0)', 'transparent'], window.getComputedStyle(document.querySelector('.card')).backgroundColor)
```

# --solution--

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>My card</title>
    <style>
      body {
        font-family: sans-serif;
        background: #f1f5f9;
      }

      .card {
        background: white;
        padding: 24px;
        border-radius: 12px;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Ada Lovelace</h1>
      <p>Learning to build websites</p>
    </div>
  </body>
</html>
```

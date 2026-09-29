---
title: Give the box a shape
title_tr: Kutuya biçim ver
skills: [fe.css]
---

# --goal--

The box gets a size, a dark color and rounded corners: the body of the traffic light.

# --goal-tr--

Kutu görünsün: ona **boyut**, koyu bir **renk** ve yuvarlak **köşeler** veriyoruz. Lambanın gövdesi bu.

# --code--

```css
.light {
  width: 90px;
  height: 250px;
  background: #222;
  border-radius: 16px;
}
```

# --meaning--

- `.light` styles the element with `class="light"`.
- `width` and `height` set its size in pixels; `background` its color; `border-radius` rounds the corners.

# --meaning-tr--

- `.light {` → baştaki nokta sınıf demek: `class="light"` olan kutuya uygulanır.
- `width: 90px;` → genişlik 90 piksel. `height: 250px;` → yükseklik 250 piksel. Uzun, dar bir kutu.
- `background: #222;` → çok koyu gri, neredeyse siyah.
- `border-radius: 16px;` → köşeleri yuvarlat.

# --task--

Write the rule inside `<style>`, under the `body` rule.

# --task-tr--

Kuralı `<style>` içinde, `body` kuralının kapanan `}` işaretinin altına (bir boş satırdan sonra) yaz. **Çalıştır**.

# --try--

Make it wider or taller, or try `border-radius: 45px`. Then pick the shape you like.

# --try-tr--

Kutuyu genişlet ya da uzat, `border-radius: 45px` dene. Sonra beğendiğin biçimde bırak.

# --tests--

The box should be 90×250 pixels.
tr: Kutu 90×250 piksel olmalı.

```js
assert.strictEqual(window.getComputedStyle(document.querySelector('.light')).width, '90px')
assert.strictEqual(window.getComputedStyle(document.querySelector('.light')).height, '250px')
```

The box should be dark with rounded corners.
tr: Kutu koyu renkli ve yuvarlak köşeli olmalı.

```js
assert.strictEqual(window.getComputedStyle(document.querySelector('.light')).backgroundColor, 'rgb(34, 34, 34)')
assert.notInclude(['', '0px'], window.getComputedStyle(document.querySelector('.light')).borderTopLeftRadius)
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

      .light {
        width: 90px;
        height: 250px;
        background: #222;
        border-radius: 16px;
      }
    </style>
  </head>
  <body>
    <div class="light"></div>
  </body>
</html>
```

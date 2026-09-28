---
id: accessible-button
title: Make an icon button accessible
title_tr: Simge düğmesini erişilebilir yap
type: web
skills: [fe.accessibility]
level: 3
---

# --description--

Screen readers announce a button by its accessible name. A button that only contains an icon has no name
unless you give it one with `aria-label`.

# --description-tr--

Görme engelli kullanıcılar sayfayı **ekran okuyucu** ile dinler: program her düğmeyi adıyla sesli okur.
Düğmenin içinde yazı varsa (ör. "Kapat") adı odur. Ama içinde yalnızca bir simge (✕) olan düğmenin **adı yoktur**;
ekran okuyucu sadece "düğme" der ve kullanıcı ne işe yaradığını anlayamaz.

Çözüm: düğmeye `aria-label` özelliği (attribute) eklemek. Bu yazı ekranda görünmez ama ekran okuyucu onu okur:

```html
<button aria-label="Menüyü aç">☰</button>
```

# --instructions--

Give the button the accessible name `Close dialog`, and make the script set the text of `#status` to `ready`.

# --instructions-tr--

1. **index.html** dosyasında `<button type="button">✕</button>` satırını bul. Açılış etiketinin içine
   `aria-label="Close dialog"` ekle (metni aynen böyle, İngilizce yaz; test bunu arıyor).
2. **index.js** dosyasına, sayfadaki `<p id="status">` paragrafının yazısını `ready` yapan tek satırı yaz:
   `document.querySelector('#status').textContent = 'ready'`
3. Çalıştır.

# --hints--

The button should have `aria-label="Close dialog"`.
tr: Düğmede `aria-label="Close dialog"` olmalı.

```js
assert.strictEqual(document.querySelector('button')?.getAttribute('aria-label'), 'Close dialog')
```

The script should set `#status` to `ready`.
tr: Betik `#status` yazısını `ready` yapmalı.

```js
assert.strictEqual(document.querySelector('#status')?.textContent, 'ready')
```

# --seed--

```html
<!doctype html>
<html>
  <head></head>
  <body>
    <button type="button">✕</button>
    <p id="status"></p>
  </body>
</html>
```

```css
button { font-size: 1.5rem; }
```

```js
// Set the status text here
```

# --solutions--

```html
<!doctype html>
<html>
  <head></head>
  <body>
    <button type="button" aria-label="Close dialog">✕</button>
    <p id="status"></p>
  </body>
</html>
```

```css
button { font-size: 1.5rem; }
```

```js
document.querySelector('#status').textContent = 'ready'
```

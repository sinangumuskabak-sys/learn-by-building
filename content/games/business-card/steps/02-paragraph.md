---
title: A line about you
title_tr: Kendin hakkında bir satır
skills: [fe.html]
---

# --goal--

Under your name, one line about what you do, as a paragraph.

# --goal-tr--

Adının altına **ne yaptığını** anlatan kısa bir cümle ekleyeceğiz. Normal yazılar için **paragraf** etiketi
kullanılır: `<p>`.

# --code--

```html
<p>Learning to build websites</p>
```

# --meaning--

- `<p>` ... `</p>` is a paragraph: normal body text.
- Write your own sentence between the tags.

# --meaning-tr--

- `<p>` → paragraf başlıyor. `p`, İngilizce paragraph'ın ilk harfi.
- Aradaki yazı → **kendi cümlen**: ör. `Web geliştirmeyi öğreniyorum` ya da `Öğrenci, oyun sever`.
- `</p>` → paragraf bitti.
- Tarayıcı paragrafı başlıktan daha küçük, normal yazıyla ve üstünde biraz boşlukla gösterir.

# --task--

Write your paragraph on a new line under the `h1`.

# --task-tr--

`<h1>` satırının sonunda Enter'a bas ve alt satıra kendi paragrafını yaz. **Çalıştır**.

# --tests--

There should be a paragraph under the heading.
tr: Başlığın altında bir paragraf olmalı.

```js
const p = document.querySelector('h1 + p')
assert.isNotNull(p, 'no <p> right after the <h1>')
assert.isAbove(p.textContent.trim().length, 0, 'the paragraph is empty')
```

# --solution--

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>My card</title>
  </head>
  <body>
    <h1>Ada Lovelace</h1>
    <p>Learning to build websites</p>
  </body>
</html>
```

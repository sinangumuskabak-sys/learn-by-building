import type { CodeFile } from '../content/schema.ts'

function joinFiles(files: CodeFile[], lang: string): string {
  return files
    .filter((f) => f.lang === lang)
    .map((f) => f.contents)
    .join('\n')
}

/**
 * Combines a web challenge's files into one HTML document: styles go into <head>, scripts at the end of
 * <body>, in file order.
 */
export function buildDocument(files: CodeFile[]): string {
  const html = joinFiles(files, 'html') || '<!doctype html><html><head></head><body></body></html>'
  const styles = files
    .filter((f) => f.lang === 'css')
    .map((f) => `<style data-file="${f.name}">\n${f.contents}</style>`)
    .join('\n')
  const scripts = files
    .filter((f) => f.lang === 'js')
    .map((f) => `<script data-file="${f.name}">\n${f.contents.replace(/<\/script/gi, '<\\/script')}</script>`)
    .join('\n')
  const withStyles = /<\/head>/i.test(html) ? html.replace(/<\/head>/i, `${styles}\n</head>`) : `${styles}\n${html}`
  return /<\/body>/i.test(withStyles)
    ? withStyles.replace(/<\/body>(?![\s\S]*<\/body>)/i, `${scripts}\n</body>`)
    : `${withStyles}\n${scripts}`
}

/**
 * Answers Maymun's request for a picture of the preview. The frame is sandboxed away from the site, so the site cannot
 * draw it; the frame draws itself: a copy of its page (scripts left out, form values and canvases kept, its styles are
 * all inside it) goes into an SVG, which is drawn onto a canvas.
 */
const SNAPSHOT_SCRIPT = `<script>window.addEventListener('message', function (e) {
  var d = e.data
  if (e.source !== parent || !d || d.__lpGame !== 'snapshot') return
  var reply = function (url) { parent.postMessage({ __lpGame: 'snapshot', id: d.id, url: url }, '*') }
  try {
    var copy = document.documentElement.cloneNode(true)
    var live = document.documentElement.querySelectorAll('input, textarea, select, canvas')
    var kept = copy.querySelectorAll('input, textarea, select, canvas')
    live.forEach(function (el, i) {
      var c = kept[i]
      if (el.tagName === 'CANVAS') {
        var img = document.createElement('img')
        try { img.src = el.toDataURL() } catch (err) {}
        img.setAttribute('style', (el.getAttribute('style') || '') + ';width:' + el.clientWidth + 'px;height:' + el.clientHeight + 'px')
        c.replaceWith(img)
      } else if (el.tagName === 'TEXTAREA') c.textContent = el.value
      else if (el.tagName === 'SELECT') { if (c.options[el.selectedIndex]) c.options[el.selectedIndex].setAttribute('selected', '') }
      else if (el.type === 'checkbox' || el.type === 'radio') { if (el.checked) c.setAttribute('checked', ''); else c.removeAttribute('checked') }
      else c.setAttribute('value', el.value)
    })
    copy.querySelectorAll('script').forEach(function (el) { el.remove() })
    var w = window.innerWidth, h = window.innerHeight
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '"><foreignObject x="0" y="0" width="100%" height="100%">' +
      new XMLSerializer().serializeToString(copy) + '</foreignObject></svg>'
    var picture = new Image()
    picture.onload = function () {
      var out = document.createElement('canvas')
      out.width = w
      out.height = h
      var g = out.getContext('2d')
      g.fillStyle = '#fff'
      g.fillRect(0, 0, w, h)
      g.drawImage(picture, 0, 0)
      var url = ''
      try { url = out.toDataURL('image/png') } catch (err) {}
      reply(url)
    }
    picture.onerror = function () { reply('') }
    picture.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
  } catch (err) { reply('') }
})</` + `script>`

/** The document shown in a web challenge's preview frame: the learner's page, able to send Maymun a picture of itself. */
export function previewDocument(files: CodeFile[]): string {
  const html = buildDocument(files)
  return /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (head) => `${head}${SNAPSHOT_SCRIPT}`) : `${SNAPSHOT_SCRIPT}\n${html}`
}

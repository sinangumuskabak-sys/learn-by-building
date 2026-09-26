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

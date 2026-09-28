/** A part of the viewport, in CSS pixels. */
export interface Region {
  x: number
  y: number
  width: number
  height: number
}

/** Longest side of a picture sent to the AI; bigger pictures cost more and are scaled down by the services anyway. */
const MAX_SIDE = 1568
/** Above this a PNG is re-encoded as JPEG, so a busy screen stays a reasonable upload. */
const MAX_PNG = 1_500_000

/** Maymun's own pieces (the cat, the chat, the selection layer) never show up in a picture. */
export const UI_ATTRIBUTE = 'data-maymun-ui'

/**
 * Takes a picture of a part of the page as a data URL. The page is redrawn from its DOM, so no screen-sharing
 * permission is needed; games and previews run in same-origin iframes, whose canvases and pages are drawn in place.
 */
export async function captureRegion(region: Region): Promise<string> {
  // Loaded only when someone takes a picture.
  const { domToCanvas } = await import('modern-screenshot')
  const scale = Math.min(window.devicePixelRatio || 1, MAX_SIDE / Math.max(region.width, region.height))
  const page = await domToCanvas(document.body, {
    width: window.innerWidth,
    height: window.innerHeight,
    scale,
    backgroundColor: getComputedStyle(document.body).backgroundColor,
    style: { margin: '0' },
    // Computed values already have every var() resolved; copying the ~1700 theme variables to each node took seconds.
    includeStyleProperties: [...getComputedStyle(document.body)].filter((name) => !name.startsWith('--')),
    filter: (node) => !(node instanceof Element && node.hasAttribute(UI_ATTRIBUTE)),
  })
  const out = document.createElement('canvas')
  out.width = Math.max(1, Math.round(region.width * scale))
  out.height = Math.max(1, Math.round(region.height * scale))
  out.getContext('2d')!.drawImage(page, -region.x * scale, -region.y * scale)
  const png = out.toDataURL('image/png')
  return png.length > MAX_PNG ? out.toDataURL('image/jpeg', 0.85) : png
}

/** The media type and base64 data of a data URL. */
export function splitDataUrl(url: string): { type: string; data: string } {
  const match = /^data:([^;,]+);base64,(.*)$/s.exec(url)
  return match ? { type: match[1], data: match[2] } : { type: 'image/png', data: '' }
}

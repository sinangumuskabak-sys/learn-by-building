/**
 * A simulated browser for testing canvas games deterministically. Learner code runs against a fake
 * document/window whose canvas records draw calls instead of painting, whose clock only moves when a test
 * calls `$.tick()`, and whose keyboard and mouse are driven by the test. Nothing here touches the real DOM,
 * so the same code runs in a Web Worker (browser, killable on infinite loops) and in Node (`npm run validate`).
 */

export interface DrawCall {
  op: string
  args: unknown[]
  fill: string
  stroke: string
  font: string
  alpha: number
}

export interface Rect {
  x: number
  y: number
  w: number
  h: number
  color: string
}

export interface CanvasSize {
  width: number
  height: number
}

type Listener = (event: FakeEvent) => void

interface FakeEvent {
  type: string
  target: unknown
  currentTarget: unknown
  defaultPrevented: boolean
  preventDefault(): void
  stopPropagation(): void
  [key: string]: unknown
}

function makeEvent(type: string, props: Record<string, unknown>): FakeEvent {
  let stopped = false
  const event: FakeEvent = {
    type,
    target: null,
    currentTarget: null,
    defaultPrevented: false,
    timeStamp: 0,
    preventDefault() {
      event.defaultPrevented = true
    },
    stopPropagation() {
      stopped = true
    },
    get __stopped() {
      return stopped
    },
    ...props,
  }
  return event
}

function bubble(start: FakeTarget, event: FakeEvent) {
  for (let node: FakeTarget | null = start; node; node = node.parent) {
    node.deliver(event)
    if (event.__stopped) break
  }
}

class FakeTarget {
  private listeners = new Map<string, Listener[]>()
  parent: FakeTarget | null = null

  addEventListener(type: string, listener: Listener | { handleEvent: Listener } | null) {
    if (!listener) return
    const fn = typeof listener === 'function' ? listener : (e: FakeEvent) => listener.handleEvent(e)
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn])
  }

  removeEventListener(type: string, listener: Listener) {
    this.listeners.set(type, (this.listeners.get(type) ?? []).filter((l) => l !== listener))
  }

  /** Delivers the event here and bubbles it to parents, like a real DOM event with `bubbles: true`. */
  dispatchEvent(event: FakeEvent): boolean {
    event.target ??= this
    bubble(this, event)
    return !event.defaultPrevented
  }

  /** Runs this target's own listeners and `on<type>` handler for the event. */
  deliver(event: FakeEvent) {
    event.currentTarget = this
    for (const listener of this.listeners.get(event.type) ?? []) listener.call(this, event)
    const handler = (this as unknown as Record<string, unknown>)[`on${event.type}`]
    if (typeof handler === 'function') handler.call(this, event)
  }
}

const styleProps = [
  'fillStyle',
  'strokeStyle',
  'lineWidth',
  'lineCap',
  'lineJoin',
  'font',
  'textAlign',
  'textBaseline',
  'globalAlpha',
  'globalCompositeOperation',
  'shadowBlur',
  'shadowColor',
  'shadowOffsetX',
  'shadowOffsetY',
  'imageSmoothingEnabled',
  'lineDashOffset',
  'miterLimit',
  'direction',
  'filter',
] as const

const recordedOps = [
  'fillRect',
  'strokeRect',
  'clearRect',
  'fillText',
  'strokeText',
  'beginPath',
  'closePath',
  'moveTo',
  'lineTo',
  'arc',
  'arcTo',
  'ellipse',
  'rect',
  'roundRect',
  'quadraticCurveTo',
  'bezierCurveTo',
  'fill',
  'stroke',
  'clip',
  'drawImage',
  'translate',
  'rotate',
  'scale',
  'setTransform',
  'resetTransform',
  'transform',
  'setLineDash',
  'putImageData',
] as const

function fakeGradient() {
  return { addColorStop() {} }
}

/** A CanvasRenderingContext2D stand-in that keeps style state and records every drawing call. */
class FakeContext2D {
  [key: string]: unknown
  canvas: FakeCanvas
  private stack: Record<string, unknown>[] = []

  constructor(canvas: FakeCanvas, calls: DrawCall[]) {
    this.canvas = canvas
    Object.assign(this, {
      fillStyle: '#000000',
      strokeStyle: '#000000',
      lineWidth: 1,
      lineCap: 'butt',
      lineJoin: 'miter',
      font: '10px sans-serif',
      textAlign: 'start',
      textBaseline: 'alphabetic',
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
      shadowBlur: 0,
      shadowColor: 'rgba(0, 0, 0, 0)',
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      imageSmoothingEnabled: true,
      lineDashOffset: 0,
      miterLimit: 10,
      direction: 'inherit',
      filter: 'none',
    })
    for (const op of recordedOps) {
      this[op] = (...args: unknown[]) => {
        calls.push({
          op,
          args,
          fill: String(this.fillStyle),
          stroke: String(this.strokeStyle),
          font: String(this.font),
          alpha: Number(this.globalAlpha),
        })
      }
    }
  }

  save() {
    this.stack.push(Object.fromEntries(styleProps.map((p) => [p, this[p]])))
  }

  restore() {
    const state = this.stack.pop()
    if (state) Object.assign(this, state)
  }

  measureText(text: string) {
    const size = Number(/(\d+(?:\.\d+)?)px/.exec(String(this.font))?.[1] ?? 10)
    const width = String(text).length * size * 0.6
    return { width, actualBoundingBoxAscent: size * 0.8, actualBoundingBoxDescent: size * 0.2 }
  }

  createLinearGradient() {
    return fakeGradient()
  }
  createRadialGradient() {
    return fakeGradient()
  }
  createConicGradient() {
    return fakeGradient()
  }
  createPattern() {
    return {}
  }
  getLineDash() {
    return []
  }
  isPointInPath() {
    return false
  }
  createImageData(w: number, h: number) {
    return { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }
  }
  getImageData(_x: number, _y: number, w: number, h: number) {
    return { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }
  }
  getTransform() {
    return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }
  }
}

class FakeElement extends FakeTarget {
  tagName: string
  id = ''
  style: Record<string, string> = {}
  textContent = ''
  innerHTML = ''
  className = ''
  children: FakeElement[] = []
  dataset: Record<string, string> = {}

  constructor(tagName: string) {
    super()
    this.tagName = tagName.toUpperCase()
  }
  appendChild<T extends FakeElement>(child: T): T {
    child.parent = this
    this.children.push(child)
    return child
  }
  append(...nodes: FakeElement[]) {
    for (const node of nodes) if (node instanceof FakeElement) this.appendChild(node)
  }
  remove() {}
  setAttribute(name: string, value: string) {
    if (name === 'id') this.id = value
  }
  getAttribute() {
    return null
  }
  focus() {}
  blur() {}
  getBoundingClientRect() {
    return { x: 0, y: 0, left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 }
  }
  get classList() {
    return { add() {}, remove() {}, toggle() {}, contains: () => false }
  }
}

class FakeCanvas extends FakeElement {
  width: number
  height: number
  private context: FakeContext2D | null = null
  private calls: DrawCall[]

  constructor(size: CanvasSize, calls: DrawCall[]) {
    super('canvas')
    this.width = size.width
    this.height = size.height
    this.calls = calls
  }
  getContext(type: string) {
    if (type !== '2d') return null
    this.context ??= new FakeContext2D(this, this.calls)
    return this.context
  }
  get clientWidth() {
    return this.width
  }
  get clientHeight() {
    return this.height
  }
  get offsetWidth() {
    return this.width
  }
  get offsetHeight() {
    return this.height
  }
  getBoundingClientRect() {
    return { x: 0, y: 0, left: 0, top: 0, right: this.width, bottom: this.height, width: this.width, height: this.height }
  }
  toDataURL() {
    return 'data:,'
  }
}

/** Seeded PRNG (mulberry32) so "random" games behave the same on every test run. */
function seededRandom(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const keyCodes: Record<string, number> = {
  ArrowLeft: 37,
  ArrowUp: 38,
  ArrowRight: 39,
  ArrowDown: 40,
  ' ': 32,
  Enter: 13,
  Escape: 27,
  Shift: 16,
  Tab: 9,
  Backspace: 8,
}

function keyCode(key: string): string {
  if (key === ' ') return 'Space'
  if (/^[a-z]$/i.test(key)) return `Key${key.toUpperCase()}`
  if (/^\d$/.test(key)) return `Digit${key}`
  return key
}

export const FRAME_MS = 1000 / 60

interface Timer {
  id: number
  at: number
  fn: (...args: unknown[]) => void
  every: number | null
}

/** Creates a fresh simulated page. `globals` are handed to learner code; `$` is the test driver. */
export function createSim(size: CanvasSize, seed = 1) {
  const calls: DrawCall[] = []
  let now = 0
  let nextId = 1
  let timers: Timer[] = []
  let frameCallbacks: { id: number; fn: (time: number) => void }[] = []
  let frames = 0
  let random = seededRandom(seed)

  const win = new FakeTarget() as FakeTarget & Record<string, unknown>
  const doc = new FakeTarget() as FakeTarget & Record<string, unknown>
  doc.parent = win
  const html = new FakeElement('html')
  html.parent = doc
  const body = new FakeElement('body')
  body.parent = html
  const canvas = new FakeCanvas(size, calls)
  canvas.id = 'game'
  body.appendChild(canvas)

  const byId = (id: string): FakeElement | null => {
    const find = (node: FakeElement): FakeElement | null =>
      node.id === id ? node : node.children.map(find).find(Boolean) ?? null
    return find(body)
  }

  Object.assign(doc, {
    body,
    documentElement: html,
    hidden: false,
    visibilityState: 'visible',
    readyState: 'complete',
    getElementById: byId,
    querySelector: (selector: string) => {
      if (selector === 'canvas') return canvas
      if (selector.startsWith('#')) return byId(selector.slice(1))
      return null
    },
    querySelectorAll: (selector: string) => (selector === 'canvas' ? [canvas] : []),
    getElementsByTagName: (tag: string) => (tag.toLowerCase() === 'canvas' ? [canvas] : []),
    createElement: (tag: string) => (tag.toLowerCase() === 'canvas' ? new FakeCanvas({ width: 300, height: 150 }, []) : new FakeElement(tag)),
    hasFocus: () => true,
  })

  const setTimer = (fn: unknown, delay: unknown, every: boolean, args: unknown[]) => {
    if (typeof fn !== 'function') return 0
    const ms = Math.max(0, Number(delay) || 0)
    const timer: Timer = { id: nextId++, at: now + ms, fn: () => fn(...args), every: every ? Math.max(ms, 1) : null }
    timers.push(timer)
    return timer.id
  }
  const clearTimer = (id: unknown) => {
    timers = timers.filter((t) => t.id !== id)
  }

  const storage = new Map<string, string>()
  const localStorage = {
    getItem: (key: string) => storage.get(String(key)) ?? null,
    setItem: (key: string, value: unknown) => void storage.set(String(key), String(value)),
    removeItem: (key: string) => void storage.delete(String(key)),
    clear: () => storage.clear(),
    key: (index: number) => [...storage.keys()][index] ?? null,
    get length() {
      return storage.size
    },
  }

  const fakeMath = Object.create(Math) as Math
  fakeMath.random = () => random()

  const RealDate = Date
  class FakeDate extends RealDate {
    constructor(...args: unknown[]) {
      if (args.length === 0) super(1_700_000_000_000 + now)
      else super(...(args as [number]))
    }
    static now() {
      return 1_700_000_000_000 + now
    }
  }

  class FakeImage extends FakeElement {
    complete = false
    naturalWidth = 0
    naturalHeight = 0
    width = 0
    height = 0
    private _src = ''
    constructor() {
      super('img')
    }
    get src() {
      return this._src
    }
    set src(value: string) {
      this._src = value
      setTimer(() => {
        this.complete = true
        this.dispatchEvent(makeEvent('load', {}))
      }, 0, false, [])
    }
  }

  class FakeAudio {
    src: string
    volume = 1
    currentTime = 0
    loop = false
    paused = true
    constructor(src = '') {
      this.src = src
    }
    play() {
      this.paused = false
      return Promise.resolve()
    }
    pause() {
      this.paused = true
    }
    cloneNode() {
      return new FakeAudio(this.src)
    }
    addEventListener() {}
  }

  const performance = { now: () => now }
  const requestAnimationFrame = (fn: unknown) => {
    if (typeof fn !== 'function') return 0
    const id = nextId++
    frameCallbacks.push({ id, fn: fn as (time: number) => void })
    return id
  }
  const cancelAnimationFrame = (id: unknown) => {
    frameCallbacks = frameCallbacks.filter((f) => f.id !== id)
  }

  Object.assign(win, {
    document: doc,
    innerWidth: size.width,
    innerHeight: size.height,
    devicePixelRatio: 1,
    requestAnimationFrame,
    cancelAnimationFrame,
    setTimeout: (fn: unknown, ms?: unknown, ...args: unknown[]) => setTimer(fn, ms, false, args),
    setInterval: (fn: unknown, ms?: unknown, ...args: unknown[]) => setTimer(fn, ms, true, args),
    clearTimeout: clearTimer,
    clearInterval: clearTimer,
    performance,
    localStorage,
    Math: fakeMath,
    Date: FakeDate,
    Image: FakeImage,
    Audio: FakeAudio,
    alert: () => {},
    confirm: () => true,
    prompt: () => null,
    focus: () => {},
  })
  win.window = win
  win.self = win

  const bound = (name: string) => (win[name] as (...a: unknown[]) => unknown).bind(win)
  const globals: Record<string, unknown> = {
    window: win,
    document: doc,
    requestAnimationFrame,
    cancelAnimationFrame,
    setTimeout: win.setTimeout,
    setInterval: win.setInterval,
    clearTimeout: clearTimer,
    clearInterval: clearTimer,
    performance,
    localStorage,
    Math: fakeMath,
    Date: FakeDate,
    Image: FakeImage,
    Audio: FakeAudio,
    alert: win.alert,
    confirm: win.confirm,
    prompt: win.prompt,
    addEventListener: bound('addEventListener'),
    removeEventListener: bound('removeEventListener'),
    innerWidth: size.width,
    innerHeight: size.height,
  }

  const runTimersUntil = (time: number) => {
    for (let guard = 0; guard < 10_000; guard++) {
      const due = timers.filter((t) => t.at <= time).sort((a, b) => a.at - b.at || a.id - b.id)[0]
      if (!due) return
      now = Math.max(now, due.at)
      if (due.every === null) timers = timers.filter((t) => t !== due)
      else due.at += due.every
      due.fn()
    }
    throw new Error('Too many timers fired in one frame — is a setTimeout/setInterval scheduling itself with 0ms?')
  }

  /** Index into `calls` where what is currently on screen starts: the last full clear or full-canvas fill. */
  const screenStart = () => {
    for (let i = calls.length - 1; i >= 0; i--) {
      const { op, args } = calls[i]
      if (op === 'clearRect' || op === 'fillRect') {
        const [x, y, w, h] = args as number[]
        if (x <= 0 && y <= 0 && x + w >= canvas.width && y + h >= canvas.height) return op === 'clearRect' ? i + 1 : i
      }
    }
    return 0
  }

  const key = (type: string, key: string) =>
    doc.dispatchEvent(
      makeEvent(type, { key, code: keyCode(key), keyCode: keyCodes[key] ?? key.toUpperCase().charCodeAt(0), which: keyCodes[key] ?? key.toUpperCase().charCodeAt(0), repeat: false, shiftKey: false, ctrlKey: false, altKey: false, metaKey: false }),
    )

  const pointer = (type: string, x: number, y: number, button = 0) =>
    canvas.dispatchEvent(
      makeEvent(type, { clientX: x, clientY: y, offsetX: x, offsetY: y, pageX: x, pageY: y, x, y, button, buttons: type.endsWith('down') ? 1 << button : 0, pointerId: 1, pointerType: 'mouse', isPrimary: true }),
    )

  /** The test driver, available to test code as `$`. */
  const $ = {
    canvas,
    get ctx() {
      return canvas.getContext('2d')
    },
    /** Every recorded draw call since the page loaded. */
    calls,
    /** Milliseconds of simulated time since the page loaded. */
    get time() {
      return now
    },
    /** How many animation frames have run. */
    get frames() {
      return frames
    },
    /** How many requestAnimationFrame callbacks are waiting for the next frame. */
    get pendingFrames() {
      return frameCallbacks.length
    },
    get timers() {
      return timers.length
    },
    /** Advances the clock by `n` frames (1/60 s each), firing due timers and animation-frame callbacks. */
    tick(n = 1) {
      for (let i = 0; i < n; i++) {
        const target = now + FRAME_MS
        runTimersUntil(target)
        now = target
        const callbacks = frameCallbacks
        frameCallbacks = []
        frames++
        for (const { fn } of callbacks) fn(now)
      }
    },
    /** Advances the clock by `seconds`. */
    run(seconds: number) {
      $.tick(Math.round(seconds * 60))
    },
    press: (k: string) => key('keydown', k),
    release: (k: string) => key('keyup', k),
    tap(k: string) {
      key('keydown', k)
      key('keyup', k)
    },
    click(x: number, y: number) {
      pointer('pointerdown', x, y)
      pointer('mousedown', x, y)
      pointer('pointerup', x, y)
      pointer('mouseup', x, y)
      pointer('click', x, y)
    },
    move(x: number, y: number) {
      pointer('pointermove', x, y)
      pointer('mousemove', x, y)
    },
    /** A right click: pointer and mouse events with button 2, then `contextmenu`. */
    rightClick(x: number, y: number) {
      pointer('pointerdown', x, y, 2)
      pointer('mousedown', x, y, 2)
      pointer('pointerup', x, y, 2)
      pointer('mouseup', x, y, 2)
      pointer('contextmenu', x, y, 2)
    },
    /** Presses the pointer (mouse button or finger) down without releasing it. */
    pointerDown(x: number, y: number) {
      pointer('pointerdown', x, y)
      pointer('mousedown', x, y)
    },
    pointerUp(x: number, y: number) {
      pointer('pointerup', x, y)
      pointer('mouseup', x, y)
    },
    /** Restarts the random sequence; the page starts with seed 1. */
    seed(n: number) {
      random = seededRandom(n)
    },
    /** Draw calls making up the current picture (since the last full clear). */
    screen: () => calls.slice(screenStart()),
    /** Filled rectangles on screen, optionally only those of one color. */
    rects(color?: string): Rect[] {
      return $.screen()
        .filter((c) => c.op === 'fillRect')
        .map((c) => {
          const [x, y, w, h] = c.args as number[]
          return { x, y, w, h, color: c.fill.toLowerCase() }
        })
        .filter((r) => color === undefined || r.color === color.toLowerCase())
    },
    /** Text drawn on screen. */
    texts: () => $.screen().filter((c) => c.op === 'fillText' || c.op === 'strokeText').map((c) => String(c.args[0])),
    /** Circles/arcs drawn on screen, as `{x, y, r, color}`. */
    arcs: () =>
      $.screen()
        .filter((c) => c.op === 'arc' || c.op === 'ellipse')
        .map((c) => {
          const [x, y, r] = c.args as number[]
          return { x, y, r, color: c.fill.toLowerCase() }
        }),
    storage,
  }

  return { globals, $ }
}

export type Sim = ReturnType<typeof createSim>

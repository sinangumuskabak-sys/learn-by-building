import { runJsTests, type JsRunInput } from './js-core.ts'

/**
 * Runs a web challenge's tests inside its own preview frame. The frame is sandboxed away from the site (no
 * allow-same-origin), so the site cannot reach into its document; instead this script, bundled on its own and put into
 * the frame's page, runs the tests there and posts the result back. Loaded before the learner's scripts.
 */
window.addEventListener('message', (event: MessageEvent) => {
  const data = event.data as { __lpRun?: string; input?: Omit<JsRunInput, 'globals'> } | null
  if (event.source !== parent || !data?.__lpRun || !data.input) return
  void runJsTests({ ...data.input, globals: { document, window } }).then((result) =>
    parent.postMessage({ __lpResult: data.__lpRun, result }, '*'),
  )
})

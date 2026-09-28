/**
 * The game frame is sandboxed away from the site, so it has no localStorage of its own. It gets a copy of the values
 * games saved (best scores and the like) with its page, and sends every change back to be kept here. The site's own
 * keys (`lp.…`: progress, settings, AI keys) never go into the frame and cannot be written from it.
 */
const OWN = 'lp.'

/** The values games have saved, for a new game page. */
export function gameStorageSnapshot(): Record<string, string> {
  const values: Record<string, string> = {}
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key === null || key.startsWith(OWN)) continue
      const value = localStorage.getItem(key)
      if (value !== null) values[key] = value
    }
  } catch {
    // No storage (private mode): games start without saved values.
  }
  return values
}

/** Keeps a change a game made; `null` removes the key. */
export function saveGameStorage(key: unknown, value: unknown) {
  if (typeof key !== 'string' || key.startsWith(OWN)) return
  try {
    if (value === null) localStorage.removeItem(key)
    else if (typeof value === 'string') localStorage.setItem(key, value)
  } catch {
    // Quota or private mode: the game keeps the value for this run only.
  }
}

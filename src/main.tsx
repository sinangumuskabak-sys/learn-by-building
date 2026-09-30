import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { createAppRouter } from './app/router'
import { basenameFor, setNavigator, settleAddress } from './app/site'
import './index.css'

const router = createAppRouter(basenameFor(settleAddress()))
setNavigator((path) => void router.navigate(path))
// An old-style link inside the page (#/games/snake) goes to its real address.
window.addEventListener('hashchange', () => {
  if (!window.location.hash.startsWith('#/')) return
  const inner = new URL(window.location.hash.slice(1), 'http://x')
  void router.navigate(`${inner.pathname}${inner.search}`, { replace: true })
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

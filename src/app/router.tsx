import { createBrowserRouter, Navigate, type RouteObject } from 'react-router'
import { AppShell } from '../components/AppShell'
import { NotFoundPage, RouteErrorPage } from '../pages/NotFoundPage'

// The shell loads eagerly; the screens (Markdown, resizable panels, editor) load when first visited. The workshop (the
// list of projects) is the home page; the old catalog addresses lead there too.
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        // A page that fails shows an error inside the shell, so the header and Maymun stay.
        errorElement: <RouteErrorPage />,
        children: [
          // The workshop is the home page (its address for search engines too); /games shows it as well.
          { index: true, lazy: async () => ({ Component: (await import('../pages/GamesPage')).GamesPage }) },
          { path: 'c/:categoryId', element: <Navigate to="/games" replace /> },
          { path: 'learn/:challengeId', element: <Navigate to="/games" replace /> },
          { path: 'games', lazy: async () => ({ Component: (await import('../pages/GamesPage')).GamesPage }) },
          {
            path: 'games/:gameId/:stepId?',
            lazy: async () => ({ Component: (await import('../pages/GameStepPage')).GameStepPage }),
          },
          { path: 'skills', lazy: async () => ({ Component: (await import('../pages/SkillsPage')).SkillsPage }) },
          { path: 'memory', lazy: async () => ({ Component: (await import('../pages/VaultPage')).VaultPage }) },
          { path: 'settings', lazy: async () => ({ Component: (await import('../pages/SettingsPage')).SettingsPage }) },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]

/** The router for a language's addresses (see site.ts: English at the root, Turkish under /tr/). */
export const createAppRouter = (basename: string) => createBrowserRouter(routes, { basename })

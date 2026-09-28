import { createHashRouter, type RouteObject } from 'react-router'
import { AppShell } from '../components/AppShell'
import { CategoryPage } from '../pages/CategoryPage'
import { HomePage } from '../pages/HomePage'
import { NotFoundPage, RouteErrorPage } from '../pages/NotFoundPage'

// The catalog loads eagerly; heavier screens (Markdown, resizable panels, editor) load when first visited.
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        // A page that fails shows an error inside the shell, so the header and Maymun stay.
        errorElement: <RouteErrorPage />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'c/:categoryId', element: <CategoryPage /> },
          {
            path: 'learn/:challengeId',
            lazy: async () => ({ Component: (await import('../pages/ChallengePage')).ChallengePage }),
          },
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

export const router = createHashRouter(routes)

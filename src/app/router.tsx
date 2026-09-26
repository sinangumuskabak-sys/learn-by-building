import { createHashRouter, type RouteObject } from 'react-router'
import { AppShell } from '../components/AppShell'
import { CategoryPage } from '../pages/CategoryPage'
import { HomePage } from '../pages/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage'

// The catalog loads eagerly; heavier screens (Markdown, resizable panels, editor) load when first visited.
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'c/:categoryId', element: <CategoryPage /> },
      {
        path: 'learn/:challengeId',
        lazy: async () => ({ Component: (await import('../pages/ChallengePage')).ChallengePage }),
      },
      { path: 'skills', lazy: async () => ({ Component: (await import('../pages/SkillsPage')).SkillsPage }) },
      { path: 'settings', lazy: async () => ({ Component: (await import('../pages/SettingsPage')).SettingsPage }) },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

export const router = createHashRouter(routes)

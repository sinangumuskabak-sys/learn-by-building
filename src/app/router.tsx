import { createHashRouter } from 'react-router'
import { AppShell } from '../components/AppShell'
import { HomePage } from '../pages/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { PlaceholderPage } from '../pages/PlaceholderPage'

export const routes = [
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'skills', element: <PlaceholderPage title="Skill map" /> },
      { path: 'settings', element: <PlaceholderPage title="Settings" /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

export const router = createHashRouter(routes)

import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <section>
      <h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
      <Link to="/" className="mt-4 inline-block text-accent hover:underline">
        Back to catalog
      </Link>
    </section>
  )
}

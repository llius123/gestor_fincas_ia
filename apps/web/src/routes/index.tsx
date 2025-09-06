import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div>
      <h3 className="text-3xl font-bold mb-6">Welcome Home!</h3>
      <div className="flex gap-4">
        <button className="btn btn-primary">
          Primary
        </button>
        <button className="btn btn-secondary">
          Secondary
        </button>
        <button className="btn btn-accent">
          Accent
        </button>
        <button className="btn btn-outline btn-info">
          Info Outline
        </button>
      </div>
    </div>
  )
}
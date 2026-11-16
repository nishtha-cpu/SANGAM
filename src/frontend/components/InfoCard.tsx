export interface InfoCardProps {
  title: string
  items: string[]
}

export function InfoCard({ title, items }: InfoCardProps) {
  return (
    <section className="card p-6">
      <h2 className="font-semibold">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((i) => (
          <li key={i} className="flex gap-3 text-sm leading-6 text-slate-400">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-300" />
            {i}
          </li>
        ))}
      </ul>
    </section>
  )
}

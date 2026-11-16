import { Icon } from './icons'

export interface EmptyProps {
  title: string
  text: string
}

export function Empty({ title, text }: EmptyProps) {
  return (
    <div className="card col-span-full py-16 text-center">
      <Icon name="search" className="mx-auto size-7 text-slate-600" />
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{text}</p>
    </div>
  )
}

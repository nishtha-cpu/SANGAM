import { Header } from './Header'
import { Footer } from './Footer'

export interface PageFrameProps {
  children: React.ReactNode
  title?: string
  eyebrow?: string
  wide?: boolean
}

export function PageFrame({
  children,
  title,
  eyebrow,
  wide = false,
}: PageFrameProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header inner />
      <main
        className={`mx-auto w-full flex-1 px-5 py-10 lg:px-8 lg:py-14 ${wide ? 'max-w-[1480px]' : 'max-w-[1180px]'}`}
      >
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        {title && (
          <h1 className="mb-8 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {title}
          </h1>
        )}
        {children}
      </main>
      <Footer />
    </div>
  )
}

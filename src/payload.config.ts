import path from 'path'
import { buildFigmaConfig } from '@payloadcms/figma'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { en as adminLanguage } from '@payloadcms/translations/languages/en'
import { fileURLToPath } from 'url'
import { Admins } from './collections/Admins'
import { Media } from './collections/Media'
import { Folders } from './collections/Folders'
import { Tags } from './collections/Tags'
import { Users } from './collections/Users'
import { Classes } from './collections/Classes'
import { CaseStudies } from './collections/CaseStudies'
import { Quizzes } from './collections/Quizzes'
import { SecurityPatterns } from './collections/SecurityPatterns'
import { Reviews } from './collections/Reviews'
import { Orders } from './collections/Orders'
import { QuizAttempts } from './collections/QuizAttempts'
import { WatchProgress } from './collections/WatchProgress'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default (async () => {
  try {
    return await buildFigmaConfig({
      admin: {
        user: Admins.slug,
        constrainWidth: true,
        dashboard: {
          widgets: [],
          defaultLayout: [
            { widgetSlug: 'activity', width: 'full' },
            { widgetSlug: 'collections', width: 'full' },
          ],
        },
        importMap: {
          baseDir: path.resolve(dirname),
        },
      },
      i18n: {
        fallbackLanguage: 'en',
        supportedLanguages: { en: adminLanguage },
      },
      collections: [
        Admins,
        Users,
        Media,
        Folders,
        Tags,
        Classes,
        CaseStudies,
        Quizzes,
        SecurityPatterns,
        Reviews,
        Orders,
        QuizAttempts,
        WatchProgress,
      ],
      typescript: {
        outputFile: path.resolve(dirname, 'payload-types.ts'),
      },
      localization: {
        locales: [{ code: 'en', label: 'English' }],
        fallback: true,
        defaultLocale: 'en',
      },
      plugins: [mcpPlugin({})],
      figma: {},
    })
  } catch (err: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[payload.config] Local development: Figma Cloud backend not connected (%s).',
        err instanceof Error ? err.message : String(err),
      )
    }
    // In local development outside sboxd/Figma Cloud, prevent unhandled rejection
    // so Next.js server actions and local pages can render without crashing.
    return {
      collections: [
        Admins,
        Users,
        Media,
        Folders,
        Tags,
        Classes,
        CaseStudies,
        Quizzes,
        SecurityPatterns,
        Reviews,
        Orders,
        QuizAttempts,
        WatchProgress,
      ],
      secret: process.env.PAYLOAD_SECRET || 'sangam-dev-fallback-secret-2026',
    } as any
  }
})()

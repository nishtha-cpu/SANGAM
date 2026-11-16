import { PageFrame } from '@frontend/layouts/PageFrame'

export const metadata = {
  title: 'Privacy Policy | SANGAM Security Architecture',
  description: 'Data protection practices, cookie policy, DPDP Act compliance, and user rights at SANGAM.',
}

export default function PrivacyPage() {
  return (
    <PageFrame title="Privacy Policy" eyebrow="Data protection & user rights">
      <div className="mx-auto max-w-4xl space-y-8 text-sm leading-relaxed text-slate-300">
        <section className="card p-8">
          <h2 className="text-xl font-semibold text-white">1. Information We Collect</h2>
          <p className="mt-3 text-slate-400">
            We collect information you provide directly during registration, profile updates, and course interactions:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-slate-400">
            <li><strong>Identity &amp; Contact:</strong> Full name, email address, password hash (PBKDF2/Payload native auth; raw passwords are never stored).</li>
            <li><strong>Academic &amp; Learning Progress:</strong> Video playback watch positions, completed modules, quiz submissions, scores, and submitted architecture review diagrams.</li>
            <li><strong>Transaction Records:</strong> Razorpay order identifiers, payment status, package tier, and tax invoices. SANGAM never stores raw credit/debit card numbers or bank credentials.</li>
            <li><strong>Technical Telemetry:</strong> IP addresses, browser user agent, session timestamps, and security audit log entries.</li>
          </ul>
        </section>

        <section className="card p-8">
          <h2 className="text-xl font-semibold text-white">2. Purpose of Data Processing</h2>
          <p className="mt-3 text-slate-400">
            Your personal data is processed solely to:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-slate-400">
            <li>Authenticate and maintain secure authenticated learner sessions via HTTP-only encrypted cookies.</li>
            <li>Deliver personalized learning analytics, quiz evaluations, and instructor feedback.</li>
            <li>Issue cryptographically verifiable certificates upon curriculum completion.</li>
            <li>Enforce platform security boundaries, detect unauthorized credential sharing, and prevent malicious attacks.</li>
          </ul>
        </section>

        <section className="card p-8">
          <h2 className="text-xl font-semibold text-white">3. Cookies &amp; Local Storage</h2>
          <p className="mt-3 text-slate-400">
            We use strictly necessary cookies to authenticate your requests (<code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-emerald-300">sangam-session</code> for learners and <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-cyan-300">admin-session</code> for staff). We do not deploy third-party advertising cookies or cross-site tracking pixels.
          </p>
        </section>

        <section className="card p-8">
          <h2 className="text-xl font-semibold text-white">4. Compliance with Digital Personal Data Protection (DPDP) Act</h2>
          <p className="mt-3 text-slate-400">
            In accordance with India&apos;s Digital Personal Data Protection Act (DPDP) and international data protection standards:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-slate-400">
            <li><strong>Right to Access:</strong> You can view all personal details, active sessions, and learning records from your Profile dashboard.</li>
            <li><strong>Right to Correction:</strong> You can edit your name, contact details, and preferences in Account Settings.</li>
            <li><strong>Right to Erasure (&ldquo;Right to be Forgotten&rdquo;):</strong> You may request permanent deletion of your account and personal data from your Settings panel or by emailing privacy@sangam.security.</li>
          </ul>
        </section>

        <section className="card p-8">
          <h2 className="text-xl font-semibold text-white">5. Security of Your Data</h2>
          <p className="mt-3 text-slate-400">
            All data in transit is encrypted using modern TLS 1.3 encryption. Data at rest is isolated within secure cloud infrastructure with strict access controls, rate limiting, and defensive security headers (CSP, HSTS, X-Content-Type-Options).
          </p>
        </section>

        <section className="card p-8">
          <h2 className="text-xl font-semibold text-white">6. Contact Data Protection Officer</h2>
          <p className="mt-3 text-slate-400">
            For questions or requests concerning your privacy, contact our Data Protection Officer at: <br />
            <span className="text-emerald-300 font-mono">dpo@sangam.security</span>
          </p>
        </section>
      </div>
    </PageFrame>
  )
}

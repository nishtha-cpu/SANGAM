import { PageFrame } from '@frontend/layouts/PageFrame'

export const metadata = {
  title: 'Terms and Conditions | SANGAM Security Architecture',
  description: 'Terms of service, refund policy, intellectual property rights, and user conduct guidelines for SANGAM.',
}

export default function TermsPage() {
  return (
    <PageFrame title="Terms and Conditions" eyebrow="Legal agreement & policies">
      <div className="mx-auto max-w-4xl space-y-8 text-sm leading-relaxed text-slate-300">
        <section className="card p-8">
          <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
          <p className="mt-3 text-slate-400">
            By accessing or using the SANGAM Security Architecture Learning Platform (&ldquo;Service&rdquo;), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, do not access or use the platform.
          </p>
        </section>

        <section className="card p-8">
          <h2 className="text-xl font-semibold text-white">2. Educational Scope &amp; Non-Production Advisory</h2>
          <p className="mt-3 text-slate-400">
            All content, security patterns, case studies, architecture diagrams, and assessment feedback provided on SANGAM are strictly for educational and training purposes. SANGAM is not a certified security assessment consultancy and does not guarantee that architectures constructed using learned patterns will be free of vulnerabilities.
          </p>
        </section>

        <section className="card p-8">
          <h2 className="text-xl font-semibold text-white">3. Intellectual Property Rights</h2>
          <p className="mt-3 text-slate-400">
            All platform materials, including curriculum designs, video masterclasses, interactive quiz questions, proprietary threat modeling frameworks, and source code examples, are the intellectual property of SANGAM. You may not reproduce, redistribute, resell, or publicly display these materials without explicit written authorization.
          </p>
        </section>

        <section className="card p-8">
          <h2 className="text-xl font-semibold text-white">4. User Accounts &amp; Access Controls</h2>
          <p className="mt-3 text-slate-400">
            You must provide accurate and complete registration information. You are solely responsible for maintaining the confidentiality of your credentials. Account sharing or simultaneous credential utilization by multiple individuals is strictly prohibited and subject to immediate account termination without refund.
          </p>
        </section>

        <section className="card p-8">
          <h2 className="text-xl font-semibold text-white">5. Subscriptions, Payments &amp; Refund Policy</h2>
          <p className="mt-3 text-slate-400">
            Package purchases grant license access for the duration specified during checkout (e.g., 12 months for Professional packages). Payments processed via authorized payment gateways (e.g., Razorpay) are billed in INR or USD as indicated. Refunds are eligible within 7 calendar days of purchase provided less than 20% of course content has been accessed and zero design reviews have been submitted for evaluation.
          </p>
        </section>

        <section className="card p-8">
          <h2 className="text-xl font-semibold text-white">6. Prohibited Activities</h2>
          <p className="mt-3 text-slate-400">
            Users agree not to probe, scan, or test the vulnerability of the SANGAM platform or bypass rate limits, authentication boundaries, or access controls. Automated scraping, data mining, or extraction of assessment answers is strictly prohibited.
          </p>
        </section>

        <section className="card p-8">
          <h2 className="text-xl font-semibold text-white">7. Governing Law &amp; Jurisdiction</h2>
          <p className="mt-3 text-slate-400">
            These terms are governed by and construed in accordance with the laws of India. Any disputes arising out of or related to these terms shall be subject to the exclusive jurisdiction of the courts of Bengaluru, Karnataka.
          </p>
        </section>
      </div>
    </PageFrame>
  )
}

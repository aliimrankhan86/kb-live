import type { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Set a new password | PilgrimCompare',
  robots: { index: false, follow: false },
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-12">
      <div className="mx-auto max-w-md">
        <ResetPasswordForm />
      </div>
    </div>
  )
}

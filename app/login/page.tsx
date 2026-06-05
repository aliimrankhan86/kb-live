import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Partner Login — KaabaTrip',
  description: 'Sign in to your KaabaTrip partner dashboard',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-8 shadow-lg">
        <LoginForm />
      </div>
    </div>
  );
}
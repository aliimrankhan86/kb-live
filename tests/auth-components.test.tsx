import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { OperatorSidebar } from '@/components/operator/OperatorSidebar';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/operator/dashboard',
}));

global.fetch = vi.fn();

describe('LoginForm', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders login form with email and password fields', () => {
    render(<LoginForm />);
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    expect(screen.getByTestId('login-email')).toBeInTheDocument();
    expect(screen.getByTestId('login-password')).toBeInTheDocument();
    expect(screen.getByTestId('login-submit')).toBeInTheDocument();
  });

  it('shows error on failed login', async () => {
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid credentials' }),
    });

    render(<LoginForm />);
    fireEvent.change(screen.getByTestId('login-email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('login-password'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByTestId('login-submit'));

    await waitFor(() => {
      expect(screen.getByTestId('login-error')).toHaveTextContent('Invalid credentials');
    });
  });

  it('has link to signup', () => {
    render(<LoginForm />);
    expect(screen.getByText('Register your company')).toHaveAttribute('href', '/signup');
  });
});

describe('SignUpForm', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders signup form with role toggle', () => {
    render(<SignUpForm />);
    expect(screen.getByTestId('signup-form')).toBeInTheDocument();
    expect(screen.getByTestId('signup-role-customer')).toBeInTheDocument();
    expect(screen.getByTestId('signup-role-operator')).toBeInTheDocument();
    expect(screen.getByTestId('signup-email')).toBeInTheDocument();
    expect(screen.getByTestId('signup-password')).toBeInTheDocument();
    expect(screen.getByTestId('signup-name')).toBeInTheDocument();
  });

  it('toggles role between customer and operator', () => {
    render(<SignUpForm />);
    fireEvent.click(screen.getByTestId('signup-role-customer'));
    fireEvent.click(screen.getByTestId('signup-role-operator'));
    expect(screen.getByTestId('signup-submit')).toBeInTheDocument();
  });

  it('shows error on failed signup', async () => {
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Email already registered' }),
    });

    render(<SignUpForm />);
    fireEvent.change(screen.getByTestId('signup-name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByTestId('signup-email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('signup-password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByTestId('signup-submit'));

    await waitFor(() => {
      expect(screen.getByTestId('signup-error')).toHaveTextContent('Email already registered');
    });
  });
});

describe('OperatorSidebar', () => {
  it('renders with operator name and verification status', () => {
    render(
      <OperatorSidebar
        operatorName="Al-Hidayah Travel"
        verificationStatus="verified"
        userRole="operator"
        userName="Ahmed"
      />
    );
    expect(screen.getByTestId('operator-sidebar')).toBeInTheDocument();
    expect(screen.getByText('Al-Hidayah Travel')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByText('Ahmed')).toBeInTheDocument();
  });

  it('shows pending status', () => {
    render(
      <OperatorSidebar
        operatorName="New Travel"
        verificationStatus="pending"
        userRole="operator"
        userName="New User"
      />
    );
    expect(screen.getByText('Pending')).toHaveClass('text-amber-400');
  });

  it('renders admin role correctly', () => {
    render(
      <OperatorSidebar
        operatorName="Admin Panel"
        verificationStatus="verified"
        userRole="admin"
        userName="Admin User"
      />
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
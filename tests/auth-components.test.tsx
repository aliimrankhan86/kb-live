import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { OperatorSidebar } from '@/components/operator/OperatorSidebar';

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/operator/dashboard',
}));

global.fetch = vi.fn();

describe('LoginForm', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders login form with Traveller tab selected by default', () => {
    render(<LoginForm />);
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    expect(screen.getByTestId('login-tab-customer')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('login-tab-partner')).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByTestId('login-email')).toBeInTheDocument();
    expect(screen.getByTestId('login-password')).toBeInTheDocument();
    expect(screen.getByTestId('login-submit')).toBeInTheDocument();
  });

  it('switches between Traveller and Partner tabs', () => {
    render(<LoginForm />);
    // Default is Traveller
    expect(screen.getByText('Traveller Login')).toBeInTheDocument();

    // Switch to Partner
    fireEvent.click(screen.getByTestId('login-tab-partner'));
    expect(screen.getByText('Operator Login')).toBeInTheDocument();
    expect(screen.getByTestId('login-tab-partner')).toHaveAttribute('aria-selected', 'true');

    // Switch back to Traveller
    fireEvent.click(screen.getByTestId('login-tab-customer'));
    expect(screen.getByText('Traveller Login')).toBeInTheDocument();
    expect(screen.getByTestId('login-tab-customer')).toHaveAttribute('aria-selected', 'true');
  });

  it('shows forgot password view when link is clicked', () => {
    render(<LoginForm />);
    expect(screen.queryByTestId('login-forgot-view')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('login-forgot-password'));
    expect(screen.getByTestId('login-forgot-view')).toBeInTheDocument();
    expect(screen.getByText('Reset Password')).toBeInTheDocument();
    expect(screen.getByTestId('login-forgot-email')).toBeInTheDocument();
    expect(screen.getByTestId('login-back-to-signin')).toBeInTheDocument();
  });

  it('returns to sign in from forgot password view', () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByTestId('login-forgot-password'));
    expect(screen.getByTestId('login-forgot-view')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('login-back-to-signin'));
    expect(screen.queryByTestId('login-forgot-view')).not.toBeInTheDocument();
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
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

  it('redirects traveller login to the customer view', async () => {
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { id: 'cust1', email: 'customer@example.com', role: 'customer' } }),
    });

    render(<LoginForm />);
    fireEvent.change(screen.getByTestId('login-email'), { target: { value: 'customer@example.com' } });
    fireEvent.change(screen.getByTestId('login-password'), { target: { value: 'PilgrimCompare!2026' } });
    fireEvent.click(screen.getByTestId('login-submit'));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('redirects partner login to the operator dashboard', async () => {
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { id: 'op1', email: 'operator@example.com', role: 'operator' } }),
    });

    render(<LoginForm />);
    fireEvent.click(screen.getByTestId('login-tab-partner'));
    fireEvent.change(screen.getByTestId('login-email'), { target: { value: 'operator@example.com' } });
    fireEvent.change(screen.getByTestId('login-password'), { target: { value: 'PilgrimCompare!2026' } });
    fireEvent.click(screen.getByTestId('login-submit'));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/operator/dashboard');
    });
  });

  it('toggles password visibility on login', () => {
    render(<LoginForm />);
    const passwordInput = screen.getByTestId('login-password');
    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(screen.getByTestId('login-password-toggle'));
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(screen.getByTestId('login-password-toggle'));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('has traveller signup link in customer tab', () => {
    render(<LoginForm />);
    expect(screen.getByText('Sign up')).toHaveAttribute('href', '/signup?type=customer');
  });

  it('has partner signup link in partner tab', () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByTestId('login-tab-partner'));
    expect(screen.getByText('Register your company')).toHaveAttribute('href', '/signup?type=operator');
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
    expect(screen.getByTestId('signup-confirm-password')).toBeInTheDocument();
    expect(screen.getByTestId('signup-name')).toBeInTheDocument();
  });

  it('toggles role between customer and operator', () => {
    render(<SignUpForm />);
    // Default from URLSearchParams is operator (Partner)
    expect(screen.getByRole('heading', { name: 'Operator Registration' })).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('signup-role-customer'));
    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('signup-role-operator'));
    expect(screen.getByRole('heading', { name: 'Operator Registration' })).toBeInTheDocument();
  });

  it('shows password mismatch error when passwords do not match', async () => {
    render(<SignUpForm />);
    fireEvent.change(screen.getByTestId('signup-name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByTestId('signup-email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('signup-password'), { target: { value: 'TestPass123!' } });
    fireEvent.change(screen.getByTestId('signup-confirm-password'), { target: { value: 'Different456!' } });
    fireEvent.click(screen.getByTestId('signup-terms-checkbox'));
    fireEvent.click(screen.getByTestId('signup-submit'));

    await waitFor(() => {
      expect(screen.getByTestId('signup-password-mismatch')).toHaveTextContent('Passwords do not match');
    });
  });

  it('shows error on failed signup', async () => {
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Email already registered' }),
    });

    render(<SignUpForm />);
    fireEvent.change(screen.getByTestId('signup-name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByTestId('signup-email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('signup-password'), { target: { value: 'TestPass123!' } });
    fireEvent.change(screen.getByTestId('signup-confirm-password'), { target: { value: 'TestPass123!' } });
    fireEvent.click(screen.getByTestId('signup-terms-checkbox'));
    fireEvent.click(screen.getByTestId('signup-submit'));

    await waitFor(() => {
      expect(screen.getByTestId('signup-error')).toHaveTextContent('Email already registered');
    });
  });

  it('requires terms agreement before enabling submit', () => {
    render(<SignUpForm />);
    expect(screen.getByTestId('signup-terms-checkbox')).toBeInTheDocument();
    expect(screen.getByTestId('signup-marketing-checkbox')).toBeInTheDocument();
    expect(screen.getByTestId('signup-submit')).toBeDisabled();
  });

  it('toggles password visibility on signup fields', () => {
    render(<SignUpForm />);
    const passwordInput = screen.getByTestId('signup-password');
    const confirmPasswordInput = screen.getByTestId('signup-confirm-password');

    expect(passwordInput).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByTestId('signup-password-toggle'));
    expect(passwordInput).toHaveAttribute('type', 'text');

    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByTestId('signup-confirm-password-toggle'));
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');
  });

  it('links to login with correct type param based on role', () => {
    render(<SignUpForm />);
    // Default is partner
    expect(screen.getByText('Sign in')).toHaveAttribute('href', '/login?type=operator');

    fireEvent.click(screen.getByTestId('signup-role-customer'));
    expect(screen.getByText('Sign in')).toHaveAttribute('href', '/login?type=customer');
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

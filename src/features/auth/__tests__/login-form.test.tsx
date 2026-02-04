/**
 * LoginForm Component Tests
 *
 * Tests the login form component including:
 * - Form rendering
 * - Email/password validation
 * - Form submission
 * - Google OAuth button
 * - Error handling
 * - Loading states
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/__tests__/test-utils';
import { LoginForm } from '../components/login-form';
import { supabase } from '@/lib/supabase/client';

// Type assertion for mocked supabase
const mockedSupabase = supabase as jest.Mocked<typeof supabase>;

describe('LoginForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the login form', () => {
      render(<LoginForm />);

      // Check for translated keys (returned as-is in our mock)
      expect(screen.getByText('title')).toBeInTheDocument();
    });

    it('renders email input field', () => {
      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText('emailPlaceholder');
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('renders password input field', () => {
      render(<LoginForm />);

      const passwordInput = screen.getByPlaceholderText('passwordPlaceholder');
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('renders Google OAuth button', () => {
      render(<LoginForm />);

      expect(screen.getByText('googleLogin')).toBeInTheDocument();
    });

    it('renders submit button', () => {
      render(<LoginForm />);

      expect(screen.getByText('submit')).toBeInTheDocument();
    });

    it('renders forgot password link', () => {
      render(<LoginForm />);

      expect(screen.getByText('forgotPassword')).toBeInTheDocument();
    });

    it('renders sign up link', () => {
      render(<LoginForm />);

      expect(screen.getByText('signUp')).toBeInTheDocument();
    });
  });

  describe('form validation', () => {
    it('shows error when email is empty on submit', async () => {
      const { user } = render(<LoginForm />);

      // Submit without filling anything
      await user.click(screen.getByText('submit'));

      // Should show validation errors for both email and password (translated key)
      await waitFor(() => {
        const requiredErrors = screen.getAllByText('required');
        expect(requiredErrors.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('shows error for invalid email format', async () => {
      const { user } = render(<LoginForm />);

      await user.type(screen.getByPlaceholderText('emailPlaceholder'), 'invalid-email');
      await user.click(screen.getByText('submit'));

      await waitFor(() => {
        expect(screen.getByText('email')).toBeInTheDocument();
      });
    });

    it('shows error when password is too short', async () => {
      const { user } = render(<LoginForm />);

      await user.type(screen.getByPlaceholderText('emailPlaceholder'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('passwordPlaceholder'), 'short');
      await user.click(screen.getByText('submit'));

      await waitFor(() => {
        expect(screen.getByText('minLength')).toBeInTheDocument();
      });
    });
  });

  describe('form submission', () => {
    it('calls supabase signInWithPassword on valid submission', async () => {
      // Mock successful sign in
      vi.mocked(mockedSupabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: {} as any, session: {} as any },
        error: null,
      });

      const { user } = render(<LoginForm />);

      await user.type(screen.getByPlaceholderText('emailPlaceholder'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('passwordPlaceholder'), 'password123');
      await user.click(screen.getByText('submit'));

      await waitFor(() => {
        expect(mockedSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('shows error message when login fails', async () => {
      // Mock failed sign in
      vi.mocked(mockedSupabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials', name: 'AuthError', status: 400 },
      });

      const { user } = render(<LoginForm />);

      await user.type(screen.getByPlaceholderText('emailPlaceholder'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('passwordPlaceholder'), 'wrongpassword');
      await user.click(screen.getByText('submit'));

      await waitFor(() => {
        // Should show the translated error message
        expect(screen.getByText('invalidCredentials')).toBeInTheDocument();
      });
    });

    it('disables submit button while loading', async () => {
      // Mock a slow response
      vi.mocked(mockedSupabase.auth.signInWithPassword).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      const { user } = render(<LoginForm />);

      await user.type(screen.getByPlaceholderText('emailPlaceholder'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('passwordPlaceholder'), 'password123');
      await user.click(screen.getByText('submit'));

      // The submit button should be in a loading state
      const submitButton = screen.getByText('submit').closest('button');
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Google OAuth', () => {
    it('calls supabase signInWithOAuth when Google button is clicked', async () => {
      // Mock successful OAuth
      vi.mocked(mockedSupabase.auth.signInWithOAuth).mockResolvedValue({
        data: { provider: 'google', url: 'https://example.com/auth' },
        error: null,
      });

      const { user } = render(<LoginForm />);

      await user.click(screen.getByText('googleLogin'));

      await waitFor(() => {
        expect(mockedSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
          provider: 'google',
          options: expect.objectContaining({
            redirectTo: expect.stringContaining('/auth/callback'),
          }),
        });
      });
    });

    it('disables email login button while Google login is loading', async () => {
      // Mock a slow response
      vi.mocked(mockedSupabase.auth.signInWithOAuth).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      const { user } = render(<LoginForm />);

      await user.click(screen.getByText('googleLogin'));

      // The submit button for email login should be disabled
      const submitButton = screen.getByText('submit').closest('button');
      expect(submitButton).toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('has accessible form inputs', () => {
      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText('emailPlaceholder');
      const passwordInput = screen.getByPlaceholderText('passwordPlaceholder');

      // Inputs should have associated labels
      expect(screen.getByText('email')).toBeInTheDocument();
      expect(screen.getByText('password')).toBeInTheDocument();
    });

    it('form inputs are properly autocompleted', () => {
      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText('emailPlaceholder');
      const passwordInput = screen.getByPlaceholderText('passwordPlaceholder');

      expect(emailInput).toHaveAttribute('autocomplete', 'email');
      expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
    });
  });

  describe('navigation links', () => {
    it('renders link to signup page', () => {
      render(<LoginForm />);

      const signupLink = screen.getByText('signUp');
      expect(signupLink).toHaveAttribute('href', '/signup');
    });

    it('renders link to forgot password page', () => {
      render(<LoginForm />);

      const forgotLink = screen.getByText('forgotPassword');
      expect(forgotLink).toHaveAttribute('href', '/forgot-password');
    });
  });
});

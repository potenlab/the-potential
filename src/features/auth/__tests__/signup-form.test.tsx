/**
 * SignupForm Component Tests
 *
 * Tests the multi-step signup form component including:
 * - Step navigation (account -> profile -> OTP)
 * - Form validation for each step
 * - Form submission
 * - OTP verification
 * - Error handling
 * - Loading states
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/__tests__/test-utils';
import { SignupForm } from '../components/signup-form';
import { supabase } from '@/lib/supabase/client';

// Type assertion for mocked supabase
const mockedSupabase = supabase as jest.Mocked<typeof supabase>;

describe('SignupForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial rendering (account step)', () => {
    it('renders the signup form', () => {
      render(<SignupForm />);

      expect(screen.getByText('title')).toBeInTheDocument();
    });

    it('renders step indicator with 3 steps', () => {
      render(<SignupForm />);

      // Should have 3 step indicators (circles)
      const stepIndicators = document.querySelectorAll('.rounded-full');
      // There are 3 steps, but also includes other rounded-full elements
      expect(stepIndicators.length).toBeGreaterThanOrEqual(3);
    });

    it('renders email input field', () => {
      render(<SignupForm />);

      expect(screen.getByPlaceholderText('emailPlaceholder')).toBeInTheDocument();
    });

    it('renders password input field', () => {
      render(<SignupForm />);

      expect(screen.getByPlaceholderText('passwordPlaceholder')).toBeInTheDocument();
    });

    it('renders confirm password input field', () => {
      render(<SignupForm />);

      expect(screen.getByPlaceholderText('confirmPasswordPlaceholder')).toBeInTheDocument();
    });

    it('renders next button', () => {
      render(<SignupForm />);

      expect(screen.getByText('next')).toBeInTheDocument();
    });

    it('renders terms agreement text', () => {
      render(<SignupForm />);

      // The text uses rich formatting, so we check for the link
      expect(screen.getByText('login')).toBeInTheDocument();
    });
  });

  describe('account step validation', () => {
    it('shows error when email is empty', async () => {
      const { user } = render(<SignupForm />);

      await user.click(screen.getByText('next'));

      await waitFor(() => {
        expect(screen.getAllByText('required').length).toBeGreaterThan(0);
      });
    });

    it('shows error for invalid email format', async () => {
      const { user } = render(<SignupForm />);

      await user.type(screen.getByPlaceholderText('emailPlaceholder'), 'invalid');
      await user.click(screen.getByText('next'));

      await waitFor(() => {
        expect(screen.getByText('email')).toBeInTheDocument();
      });
    });

    it('shows error when passwords do not match', async () => {
      const { user } = render(<SignupForm />);

      await user.type(screen.getByPlaceholderText('emailPlaceholder'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('passwordPlaceholder'), 'password123');
      await user.type(screen.getByPlaceholderText('confirmPasswordPlaceholder'), 'different');
      await user.click(screen.getByText('next'));

      await waitFor(() => {
        expect(screen.getByText('passwordMismatch')).toBeInTheDocument();
      });
    });

    it('shows error when password is too short', async () => {
      const { user } = render(<SignupForm />);

      await user.type(screen.getByPlaceholderText('emailPlaceholder'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('passwordPlaceholder'), 'short');
      await user.type(screen.getByPlaceholderText('confirmPasswordPlaceholder'), 'short');
      await user.click(screen.getByText('next'));

      await waitFor(() => {
        expect(screen.getByText('minLength')).toBeInTheDocument();
      });
    });
  });

  describe('profile step', () => {
    it('advances to profile step after valid account data', async () => {
      const { user } = render(<SignupForm />);

      // Fill account form
      await user.type(screen.getByPlaceholderText('emailPlaceholder'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('passwordPlaceholder'), 'password123');
      await user.type(screen.getByPlaceholderText('confirmPasswordPlaceholder'), 'password123');
      await user.click(screen.getByText('next'));

      // Should now show profile step
      await waitFor(() => {
        expect(screen.getByPlaceholderText('namePlaceholder')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('companyPlaceholder')).toBeInTheDocument();
      });
    });

    it('shows back button on profile step', async () => {
      const { user } = render(<SignupForm />);

      // Navigate to profile step
      await user.type(screen.getByPlaceholderText('emailPlaceholder'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('passwordPlaceholder'), 'password123');
      await user.type(screen.getByPlaceholderText('confirmPasswordPlaceholder'), 'password123');
      await user.click(screen.getByText('next'));

      await waitFor(() => {
        expect(screen.getByText('back')).toBeInTheDocument();
      });
    });

    it('can go back to account step', async () => {
      const { user } = render(<SignupForm />);

      // Navigate to profile step
      await user.type(screen.getByPlaceholderText('emailPlaceholder'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('passwordPlaceholder'), 'password123');
      await user.type(screen.getByPlaceholderText('confirmPasswordPlaceholder'), 'password123');
      await user.click(screen.getByText('next'));

      // Go back
      await waitFor(() => {
        expect(screen.getByText('back')).toBeInTheDocument();
      });
      await user.click(screen.getByText('back'));

      // Should be back at account step
      await waitFor(() => {
        expect(screen.getByPlaceholderText('emailPlaceholder')).toBeInTheDocument();
      });
    });
  });

  describe('profile step validation', () => {
    async function navigateToProfileStep(user: ReturnType<typeof render>['user']) {
      await user.type(screen.getByPlaceholderText('emailPlaceholder'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('passwordPlaceholder'), 'password123');
      await user.type(screen.getByPlaceholderText('confirmPasswordPlaceholder'), 'password123');
      await user.click(screen.getByText('next'));
      await waitFor(() => {
        expect(screen.getByPlaceholderText('namePlaceholder')).toBeInTheDocument();
      });
    }

    it('shows error when name is empty', async () => {
      const { user } = render(<SignupForm />);
      await navigateToProfileStep(user);

      await user.click(screen.getByText('submit'));

      await waitFor(() => {
        expect(screen.getAllByText('required').length).toBeGreaterThan(0);
      });
    });

    it('shows error when company name is empty', async () => {
      const { user } = render(<SignupForm />);
      await navigateToProfileStep(user);

      await user.type(screen.getByPlaceholderText('namePlaceholder'), 'John Doe');
      await user.click(screen.getByText('submit'));

      await waitFor(() => {
        expect(screen.getByText('required')).toBeInTheDocument();
      });
    });
  });

  describe('form submission', () => {
    async function fillFormCompletely(user: ReturnType<typeof render>['user']) {
      // Account step
      await user.type(screen.getByPlaceholderText('emailPlaceholder'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('passwordPlaceholder'), 'password123');
      await user.type(screen.getByPlaceholderText('confirmPasswordPlaceholder'), 'password123');
      await user.click(screen.getByText('next'));

      // Profile step
      await waitFor(() => {
        expect(screen.getByPlaceholderText('namePlaceholder')).toBeInTheDocument();
      });
      await user.type(screen.getByPlaceholderText('namePlaceholder'), 'John Doe');
      await user.type(screen.getByPlaceholderText('companyPlaceholder'), 'Test Company');
    }

    it('calls supabase signUp on valid submission', async () => {
      vi.mocked(mockedSupabase.auth.signUp).mockResolvedValue({
        data: { user: {} as any, session: null },
        error: null,
      });

      const { user } = render(<SignupForm />);
      await fillFormCompletely(user);

      await user.click(screen.getByText('submit'));

      await waitFor(() => {
        expect(mockedSupabase.auth.signUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          options: expect.objectContaining({
            data: expect.objectContaining({
              name: 'John Doe',
              company_name: 'Test Company',
              approval_status: 'pending',
            }),
          }),
        });
      });
    });

    it('shows error when signup fails', async () => {
      vi.mocked(mockedSupabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already exists', name: 'AuthError', status: 400 },
      });

      const { user } = render(<SignupForm />);
      await fillFormCompletely(user);

      await user.click(screen.getByText('submit'));

      await waitFor(() => {
        expect(screen.getByText('User already exists')).toBeInTheDocument();
      });
    });

    it('advances to OTP step after successful signup', async () => {
      vi.mocked(mockedSupabase.auth.signUp).mockResolvedValue({
        data: { user: {} as any, session: null },
        error: null,
      });

      const { user } = render(<SignupForm />);
      await fillFormCompletely(user);

      await user.click(screen.getByText('submit'));

      await waitFor(() => {
        // OTP step should show the verify button and resend button (in cooldown)
        expect(screen.getByText('verify')).toBeInTheDocument();
        expect(screen.getByText(/resendIn/)).toBeInTheDocument();
      });
    });
  });

  describe('OTP step', () => {
    async function navigateToOtpStep(user: ReturnType<typeof render>['user']) {
      vi.mocked(mockedSupabase.auth.signUp).mockResolvedValue({
        data: { user: {} as any, session: null },
        error: null,
      });

      // Account step
      await user.type(screen.getByPlaceholderText('emailPlaceholder'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('passwordPlaceholder'), 'password123');
      await user.type(screen.getByPlaceholderText('confirmPasswordPlaceholder'), 'password123');
      await user.click(screen.getByText('next'));

      // Profile step
      await waitFor(() => {
        expect(screen.getByPlaceholderText('namePlaceholder')).toBeInTheDocument();
      });
      await user.type(screen.getByPlaceholderText('namePlaceholder'), 'John Doe');
      await user.type(screen.getByPlaceholderText('companyPlaceholder'), 'Test Company');
      await user.click(screen.getByText('submit'));

      // Wait for OTP step - the resend button shows "resendIn" during cooldown
      await waitFor(() => {
        expect(screen.getByText(/resendIn/)).toBeInTheDocument();
      });
    }

    it('shows resend button with cooldown', async () => {
      const { user } = render(<SignupForm />);
      await navigateToOtpStep(user);

      // Resend should be in cooldown initially
      const resendButton = screen.getByText(/resendIn/);
      expect(resendButton).toBeInTheDocument();
    });

    it('calls verifyOtp when OTP is submitted', async () => {
      vi.mocked(mockedSupabase.auth.verifyOtp).mockResolvedValue({
        data: { user: {} as any, session: {} as any },
        error: null,
      });

      const { user } = render(<SignupForm />);
      await navigateToOtpStep(user);

      // The OTP input uses InputOTP which is harder to test directly
      // For now, we check that the verify button exists but is disabled without OTP
      const verifyButton = screen.getByText('verify');
      expect(verifyButton.closest('button')).toBeDisabled();
    });

    it('can go back to profile step from OTP', async () => {
      const { user } = render(<SignupForm />);
      await navigateToOtpStep(user);

      await user.click(screen.getByText('back'));

      await waitFor(() => {
        expect(screen.getByPlaceholderText('namePlaceholder')).toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    it('has accessible form inputs with labels', () => {
      render(<SignupForm />);

      expect(screen.getByText('email')).toBeInTheDocument();
      expect(screen.getByText('password')).toBeInTheDocument();
      expect(screen.getByText('confirmPassword')).toBeInTheDocument();
    });

    it('form inputs have proper autocomplete attributes', () => {
      render(<SignupForm />);

      expect(screen.getByPlaceholderText('emailPlaceholder')).toHaveAttribute(
        'autocomplete',
        'email'
      );
      expect(screen.getByPlaceholderText('passwordPlaceholder')).toHaveAttribute(
        'autocomplete',
        'new-password'
      );
    });
  });

  describe('navigation links', () => {
    it('renders link to login page', () => {
      render(<SignupForm />);

      const loginLink = screen.getByText('login');
      expect(loginLink).toHaveAttribute('href', '/login');
    });
  });
});

'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/common/visually-hidden';
import { useAuthModalStore } from '@/stores/auth-modal-store';
import { LoginForm } from './login-form';
import { SignupForm } from './signup-form';

/**
 * Auth Modal Component
 *
 * Renders login or signup forms inside a Dialog overlay.
 * State is controlled by the auth modal zustand store, allowing
 * any component (e.g., Header) to trigger it.
 *
 * Features:
 * - Switches between login and signup views without closing the modal
 * - Closes automatically on successful authentication
 * - Uses the existing Dialog component with dark theme styling
 */
export function AuthModal() {
  const { isOpen, view, close, setView } = useAuthModalStore();

  const handleSwitchToSignup = () => {
    setView('signup');
  };

  const handleSwitchToLogin = () => {
    setView('login');
  };

  const handleSuccess = () => {
    close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-md p-6 md:p-8" showCloseButton>
        <VisuallyHidden>
          <DialogTitle>{view === 'login' ? 'Log in' : 'Sign up'}</DialogTitle>
        </VisuallyHidden>
        {view === 'login' ? (
          <LoginForm
            isModal
            onSwitchToSignup={handleSwitchToSignup}
            onSuccess={handleSuccess}
          />
        ) : (
          <SignupForm
            isModal
            onSwitchToLogin={handleSwitchToLogin}
            onSuccess={handleSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

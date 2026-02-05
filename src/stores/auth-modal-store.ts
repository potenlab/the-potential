import { create } from 'zustand';

/**
 * Auth Modal Store
 *
 * Manages the state of the authentication modal dialog.
 * Controls which view (login/signup) is displayed and whether the modal is open.
 *
 * Used by the Header component to trigger the modal and by the AuthModal
 * component to read state and render the appropriate form.
 */

type AuthModalView = 'login' | 'signup';

interface AuthModalState {
  isOpen: boolean;
  view: AuthModalView;
  openLogin: () => void;
  openSignup: () => void;
  close: () => void;
  setView: (view: AuthModalView) => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  view: 'login',
  openLogin: () => set({ isOpen: true, view: 'login' }),
  openSignup: () => set({ isOpen: true, view: 'signup' }),
  close: () => set({ isOpen: false }),
  setView: (view) => set({ view }),
}));

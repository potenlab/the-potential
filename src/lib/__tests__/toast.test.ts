/**
 * Toast utility function tests
 *
 * Tests the toast notification utilities that wrap Sonner.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted to ensure mock functions are available when vi.mock is hoisted
const { mockSuccess, mockError, mockWarning, mockInfo, mockLoading, mockPromise, mockDismiss, mockCustom } = vi.hoisted(() => ({
  mockSuccess: vi.fn().mockReturnValue('success-id'),
  mockError: vi.fn().mockReturnValue('error-id'),
  mockWarning: vi.fn().mockReturnValue('warning-id'),
  mockInfo: vi.fn().mockReturnValue('info-id'),
  mockLoading: vi.fn().mockReturnValue('loading-id'),
  mockPromise: vi.fn(),
  mockDismiss: vi.fn(),
  mockCustom: vi.fn().mockReturnValue('custom-id'),
}));

vi.mock('sonner', () => ({
  toast: Object.assign(mockCustom, {
    success: mockSuccess,
    error: mockError,
    warning: mockWarning,
    info: mockInfo,
    loading: mockLoading,
    promise: mockPromise,
    dismiss: mockDismiss,
  }),
}));

// Import after mocking
import { toast } from '../toast';

describe('toast utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('toast.success', () => {
    it('should call sonner success with message', () => {
      toast.success('Success message');

      expect(mockSuccess).toHaveBeenCalledWith('Success message', {
        description: undefined,
        duration: 4000,
        action: undefined,
        cancel: undefined,
        onDismiss: undefined,
        onAutoClose: undefined,
      });
    });

    it('should pass description option', () => {
      toast.success('Success', { description: 'Additional info' });

      expect(mockSuccess).toHaveBeenCalledWith('Success', {
        description: 'Additional info',
        duration: 4000,
        action: undefined,
        cancel: undefined,
        onDismiss: undefined,
        onAutoClose: undefined,
      });
    });

    it('should pass custom duration', () => {
      toast.success('Success', { duration: 10000 });

      expect(mockSuccess).toHaveBeenCalledWith('Success', {
        description: undefined,
        duration: 10000,
        action: undefined,
        cancel: undefined,
        onDismiss: undefined,
        onAutoClose: undefined,
      });
    });

    it('should pass action button', () => {
      const onClick = vi.fn();
      toast.success('Success', {
        action: { label: 'Undo', onClick },
      });

      expect(mockSuccess).toHaveBeenCalledWith(
        'Success',
        expect.objectContaining({
          action: expect.objectContaining({
            label: 'Undo',
          }),
        })
      );
    });
  });

  describe('toast.error', () => {
    it('should call sonner error with message', () => {
      toast.error('Error message');

      expect(mockError).toHaveBeenCalledWith('Error message', {
        description: undefined,
        duration: 5000, // Error has longer default duration
        action: undefined,
        cancel: undefined,
        onDismiss: undefined,
        onAutoClose: undefined,
      });
    });

    it('should have longer default duration than success', () => {
      toast.error('Error');
      toast.success('Success');

      const errorCall = mockError.mock.calls[0][1];
      const successCall = mockSuccess.mock.calls[0][1];

      expect(errorCall.duration).toBeGreaterThan(successCall.duration);
    });
  });

  describe('toast.warning', () => {
    it('should call sonner warning with message', () => {
      toast.warning('Warning message');

      expect(mockWarning).toHaveBeenCalledWith('Warning message', {
        description: undefined,
        duration: 4000,
        action: undefined,
        cancel: undefined,
        onDismiss: undefined,
        onAutoClose: undefined,
      });
    });
  });

  describe('toast.info', () => {
    it('should call sonner info with message', () => {
      toast.info('Info message');

      expect(mockInfo).toHaveBeenCalledWith('Info message', {
        description: undefined,
        duration: 4000,
        action: undefined,
        cancel: undefined,
        onDismiss: undefined,
        onAutoClose: undefined,
      });
    });
  });

  describe('toast.loading', () => {
    it('should call sonner loading and return dismiss function', () => {
      const dismiss = toast.loading('Loading...');

      expect(mockLoading).toHaveBeenCalledWith('Loading...', {
        description: undefined,
        onDismiss: undefined,
      });

      expect(typeof dismiss).toBe('function');
    });

    it('should dismiss the toast when returned function is called', () => {
      const dismiss = toast.loading('Loading...');
      dismiss();

      expect(mockDismiss).toHaveBeenCalledWith('loading-id');
    });
  });

  describe('toast.promise', () => {
    it('should call sonner promise with messages', () => {
      const promise = Promise.resolve('data');

      toast.promise(promise, {
        loading: 'Loading...',
        success: 'Done!',
        error: 'Failed',
      });

      expect(mockPromise).toHaveBeenCalledWith(promise, {
        loading: 'Loading...',
        success: 'Done!',
        error: 'Failed',
        duration: undefined,
      });
    });
  });

  describe('toast.custom', () => {
    it('should call sonner toast directly', () => {
      toast.custom('Custom message');

      expect(mockCustom).toHaveBeenCalledWith('Custom message', {
        description: undefined,
        duration: 4000,
        action: undefined,
        cancel: undefined,
        onDismiss: undefined,
        onAutoClose: undefined,
      });
    });
  });

  describe('toast.dismiss', () => {
    it('should call sonner dismiss without id to dismiss all', () => {
      toast.dismiss();

      expect(mockDismiss).toHaveBeenCalledWith(undefined);
    });

    it('should call sonner dismiss with specific id', () => {
      toast.dismiss('some-id');

      expect(mockDismiss).toHaveBeenCalledWith('some-id');
    });
  });

  describe('callback options', () => {
    it('should pass onDismiss callback', () => {
      const onDismiss = vi.fn();
      toast.success('Success', { onDismiss });

      expect(mockSuccess).toHaveBeenCalledWith(
        'Success',
        expect.objectContaining({ onDismiss })
      );
    });

    it('should pass onAutoClose callback', () => {
      const onAutoClose = vi.fn();
      toast.success('Success', { onAutoClose });

      expect(mockSuccess).toHaveBeenCalledWith(
        'Success',
        expect.objectContaining({ onAutoClose })
      );
    });

    it('should pass cancel option', () => {
      const onClick = vi.fn();
      toast.success('Success', {
        cancel: { label: 'Cancel', onClick },
      });

      expect(mockSuccess).toHaveBeenCalledWith(
        'Success',
        expect.objectContaining({
          cancel: expect.objectContaining({
            label: 'Cancel',
          }),
        })
      );
    });
  });
});

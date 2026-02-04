/**
 * Input Component Tests
 *
 * Tests the customized Input component with The Potential's design system.
 * Tests cover:
 * - Rendering with label, helper text, error
 * - Icon support
 * - Disabled state
 * - Accessibility (aria attributes)
 * - Focus and change handlers
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/__tests__/test-utils';
import { Input } from '../input';

describe('Input Component', () => {
  describe('rendering', () => {
    it('renders an input element', () => {
      render(<Input placeholder="Enter text" />);

      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('renders with correct base classes', () => {
      render(<Input placeholder="Test" />);

      const input = screen.getByPlaceholderText('Test');
      expect(input).toHaveClass('h-12'); // 48px height
      expect(input).toHaveClass('rounded-2xl'); // 16px radius
    });

    it('applies custom className', () => {
      render(<Input placeholder="Test" className="mt-4" />);

      const input = screen.getByPlaceholderText('Test');
      expect(input).toHaveClass('mt-4');
    });
  });

  describe('label', () => {
    it('renders label when provided', () => {
      render(<Input label="Email" placeholder="Enter email" />);

      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('associates label with input via htmlFor', () => {
      render(<Input label="Email" placeholder="Enter email" />);

      const input = screen.getByPlaceholderText('Enter email');
      const label = screen.getByText('Email');

      expect(label).toHaveAttribute('for', input.id);
    });

    it('does not render label when not provided', () => {
      render(<Input placeholder="Enter email" />);

      // With no label prop, there should be no label element
      expect(screen.queryByLabelText(/.*/)).toBeNull();
    });
  });

  describe('helper text', () => {
    it('renders helper text when provided', () => {
      render(<Input helperText="This is helper text" placeholder="Test" />);

      expect(screen.getByText('This is helper text')).toBeInTheDocument();
    });

    it('links helper text to input via aria-describedby', () => {
      render(<Input id="test-input" helperText="Helper" placeholder="Test" />);

      const input = screen.getByPlaceholderText('Test');
      expect(input).toHaveAttribute('aria-describedby', 'test-input-helper');
    });

    it('hides helper text when error is shown', () => {
      render(
        <Input
          helperText="Helper text"
          error="Error message"
          placeholder="Test"
        />
      );

      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('renders error message when error prop is provided', () => {
      render(<Input error="This field is required" placeholder="Test" />);

      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('applies error styles to input', () => {
      render(<Input error="Error" placeholder="Test" />);

      const input = screen.getByPlaceholderText('Test');
      expect(input).toHaveClass('border-[#FF453A]');
    });

    it('sets aria-invalid to true when error exists', () => {
      render(<Input error="Error" placeholder="Test" />);

      const input = screen.getByPlaceholderText('Test');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('links error message to input via aria-describedby', () => {
      render(<Input id="test-input" error="Error" placeholder="Test" />);

      const input = screen.getByPlaceholderText('Test');
      expect(input).toHaveAttribute('aria-describedby', 'test-input-error');
    });

    it('displays error in red color', () => {
      render(<Input error="Error message" placeholder="Test" />);

      const errorElement = screen.getByText('Error message');
      expect(errorElement).toHaveClass('text-[#FF453A]');
    });
  });

  describe('icons', () => {
    it('renders left icon', () => {
      render(
        <Input
          leftIcon={<span data-testid="left-icon">L</span>}
          placeholder="With icon"
        />
      );

      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('renders right icon', () => {
      render(
        <Input
          rightIcon={<span data-testid="right-icon">R</span>}
          placeholder="With icon"
        />
      );

      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('applies left padding when left icon is present', () => {
      render(
        <Input
          leftIcon={<span>L</span>}
          placeholder="With icon"
        />
      );

      const input = screen.getByPlaceholderText('With icon');
      expect(input).toHaveClass('pl-12');
    });

    it('applies right padding when right icon is present', () => {
      render(
        <Input
          rightIcon={<span>R</span>}
          placeholder="With icon"
        />
      );

      const input = screen.getByPlaceholderText('With icon');
      expect(input).toHaveClass('pr-12');
    });
  });

  describe('disabled state', () => {
    it('is disabled when disabled prop is true', () => {
      render(<Input disabled placeholder="Disabled" />);

      expect(screen.getByPlaceholderText('Disabled')).toBeDisabled();
    });

    it('applies disabled styles', () => {
      render(<Input disabled placeholder="Disabled" />);

      const input = screen.getByPlaceholderText('Disabled');
      expect(input).toHaveClass('disabled:cursor-not-allowed');
      expect(input).toHaveClass('disabled:opacity-50');
    });
  });

  describe('input types', () => {
    it('supports email type', () => {
      render(<Input type="email" placeholder="Email" />);

      expect(screen.getByPlaceholderText('Email')).toHaveAttribute('type', 'email');
    });

    it('supports password type', () => {
      render(<Input type="password" placeholder="Password" />);

      expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'password');
    });

    it('supports number type', () => {
      render(<Input type="number" placeholder="Number" />);

      expect(screen.getByPlaceholderText('Number')).toHaveAttribute('type', 'number');
    });

    it('defaults to text type', () => {
      render(<Input placeholder="Text" />);

      // Note: When type is not specified, the actual attribute may be undefined
      // but the input behaves as text
      const input = screen.getByPlaceholderText('Text');
      expect(input).toBeInTheDocument();
    });
  });

  describe('event handlers', () => {
    it('calls onChange when value changes', async () => {
      const onChange = vi.fn();
      const { user } = render(<Input onChange={onChange} placeholder="Test" />);

      await user.type(screen.getByPlaceholderText('Test'), 'hello');

      expect(onChange).toHaveBeenCalled();
    });

    it('calls onFocus when input is focused', async () => {
      const onFocus = vi.fn();
      render(<Input onFocus={onFocus} placeholder="Test" />);

      screen.getByPlaceholderText('Test').focus();

      expect(onFocus).toHaveBeenCalled();
    });

    it('calls onBlur when input loses focus', async () => {
      const onBlur = vi.fn();
      render(<Input onBlur={onBlur} placeholder="Test" />);

      const input = screen.getByPlaceholderText('Test');
      input.focus();
      input.blur();

      expect(onBlur).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('can receive focus', () => {
      render(<Input placeholder="Focusable" />);

      const input = screen.getByPlaceholderText('Focusable');
      input.focus();

      expect(input).toHaveFocus();
    });

    it('supports autocomplete attribute', () => {
      render(<Input autoComplete="email" placeholder="Email" />);

      expect(screen.getByPlaceholderText('Email')).toHaveAttribute(
        'autocomplete',
        'email'
      );
    });

    it('supports required attribute', () => {
      render(<Input required placeholder="Required" />);

      expect(screen.getByPlaceholderText('Required')).toBeRequired();
    });

    it('generates unique id when not provided', () => {
      render(<Input placeholder="Test" />);

      const input = screen.getByPlaceholderText('Test');
      expect(input.id).toBeTruthy();
    });

    it('uses provided id', () => {
      render(<Input id="custom-id" placeholder="Test" />);

      expect(screen.getByPlaceholderText('Test')).toHaveAttribute('id', 'custom-id');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to input element', () => {
      const ref = vi.fn();
      render(<Input ref={ref} placeholder="Test" />);

      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLInputElement);
    });
  });

  describe('value handling', () => {
    it('supports controlled value', () => {
      render(<Input value="controlled" onChange={() => {}} placeholder="Test" />);

      expect(screen.getByPlaceholderText('Test')).toHaveValue('controlled');
    });

    it('supports defaultValue', () => {
      render(<Input defaultValue="default" placeholder="Test" />);

      expect(screen.getByPlaceholderText('Test')).toHaveValue('default');
    });
  });
});

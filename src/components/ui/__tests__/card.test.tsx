/**
 * Card Component Tests
 *
 * Tests the customized Card component with The Potential's design system.
 * Tests cover:
 * - Card variants (default, elevated, gradient, interactive, glow, ghost)
 * - Padding options
 * - Sub-components (CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
 * - Custom className support
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/__tests__/test-utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../card';

describe('Card Component', () => {
  describe('rendering', () => {
    it('renders children correctly', () => {
      render(<Card>Card content</Card>);

      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('renders as a div element', () => {
      render(<Card data-testid="card">Content</Card>);

      const card = screen.getByTestId('card');
      expect(card.tagName).toBe('DIV');
    });

    it('has correct base classes', () => {
      render(<Card data-testid="card">Content</Card>);

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('rounded-3xl'); // 24px border radius
      expect(card).toHaveClass('border');
    });
  });

  describe('variants', () => {
    it('applies default variant classes', () => {
      render(<Card data-testid="card">Default</Card>);

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('bg-[#121212]');
      // Note: data-variant is undefined when not explicitly set (default applied via cva)
    });

    it('applies elevated variant classes', () => {
      render(<Card data-testid="card" variant="elevated">Elevated</Card>);

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('bg-[#1C1C1E]');
      expect(card).toHaveClass('shadow-lg');
    });

    it('applies gradient variant classes', () => {
      render(<Card data-testid="card" variant="gradient">Gradient</Card>);

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('bg-gradient-to-br');
    });

    it('applies interactive variant classes', () => {
      render(<Card data-testid="card" variant="interactive">Interactive</Card>);

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('hover:border-[#0079FF]/40');
      expect(card).toHaveClass('hover:scale-[1.02]');
      expect(card).toHaveClass('cursor-pointer');
    });

    it('applies glow variant classes', () => {
      render(<Card data-testid="card" variant="glow">Glow</Card>);

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('border-[#0079FF]/40');
      expect(card).toHaveClass('shadow-[0_0_20px_rgba(0,121,255,0.4)]');
    });

    it('applies ghost variant classes', () => {
      render(<Card data-testid="card" variant="ghost">Ghost</Card>);

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('bg-transparent');
      expect(card).toHaveClass('border-transparent');
    });
  });

  describe('padding', () => {
    it('applies no padding when padding="none"', () => {
      render(<Card data-testid="card" padding="none">Content</Card>);

      const card = screen.getByTestId('card');
      expect(card).not.toHaveClass('p-4');
      expect(card).not.toHaveClass('p-5');
      expect(card).not.toHaveClass('p-6');
    });

    it('applies sm padding', () => {
      render(<Card data-testid="card" padding="sm">Content</Card>);

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('p-4');
    });

    it('applies md padding (default)', () => {
      render(<Card data-testid="card" padding="md">Content</Card>);

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('p-5');
    });

    it('applies lg padding', () => {
      render(<Card data-testid="card" padding="lg">Content</Card>);

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('p-6');
    });

    it('uses md padding by default', () => {
      render(<Card data-testid="card">Default padding</Card>);

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('p-5');
    });
  });

  describe('custom className', () => {
    it('merges custom className with variant classes', () => {
      render(
        <Card data-testid="card" className="mt-4 w-full">
          Custom
        </Card>
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('mt-4');
      expect(card).toHaveClass('w-full');
      expect(card).toHaveClass('rounded-3xl'); // Still has base classes
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to div element', () => {
      const ref = vi.fn();
      render(<Card ref={ref}>Content</Card>);

      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
    });
  });
});

describe('CardHeader Component', () => {
  it('renders children correctly', () => {
    render(<CardHeader>Header content</CardHeader>);

    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('has correct base classes', () => {
    render(<CardHeader data-testid="header">Header</CardHeader>);

    const header = screen.getByTestId('header');
    expect(header).toHaveClass('flex');
    expect(header).toHaveClass('flex-col');
    expect(header).toHaveClass('space-y-1.5');
  });

  it('merges custom className', () => {
    render(
      <CardHeader data-testid="header" className="mb-4">
        Header
      </CardHeader>
    );

    const header = screen.getByTestId('header');
    expect(header).toHaveClass('mb-4');
    expect(header).toHaveClass('flex');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<CardHeader ref={ref}>Header</CardHeader>);

    expect(ref).toHaveBeenCalled();
    expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
  });
});

describe('CardTitle Component', () => {
  it('renders children correctly', () => {
    render(<CardTitle>Title text</CardTitle>);

    expect(screen.getByText('Title text')).toBeInTheDocument();
  });

  it('renders as h3 element', () => {
    render(<CardTitle data-testid="title">Title</CardTitle>);

    const title = screen.getByTestId('title');
    expect(title.tagName).toBe('H3');
  });

  it('has correct styling classes', () => {
    render(<CardTitle data-testid="title">Title</CardTitle>);

    const title = screen.getByTestId('title');
    expect(title).toHaveClass('text-xl');
    expect(title).toHaveClass('font-bold');
    expect(title).toHaveClass('text-white');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<CardTitle ref={ref}>Title</CardTitle>);

    expect(ref).toHaveBeenCalled();
    expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLHeadingElement);
  });
});

describe('CardDescription Component', () => {
  it('renders children correctly', () => {
    render(<CardDescription>Description text</CardDescription>);

    expect(screen.getByText('Description text')).toBeInTheDocument();
  });

  it('renders as p element', () => {
    render(<CardDescription data-testid="desc">Description</CardDescription>);

    const desc = screen.getByTestId('desc');
    expect(desc.tagName).toBe('P');
  });

  it('has muted text color', () => {
    render(<CardDescription data-testid="desc">Description</CardDescription>);

    const desc = screen.getByTestId('desc');
    expect(desc).toHaveClass('text-[#8B95A1]');
    expect(desc).toHaveClass('text-sm');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<CardDescription ref={ref}>Description</CardDescription>);

    expect(ref).toHaveBeenCalled();
    expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLParagraphElement);
  });
});

describe('CardContent Component', () => {
  it('renders children correctly', () => {
    render(<CardContent>Content goes here</CardContent>);

    expect(screen.getByText('Content goes here')).toBeInTheDocument();
  });

  it('renders as div element', () => {
    render(<CardContent data-testid="content">Content</CardContent>);

    const content = screen.getByTestId('content');
    expect(content.tagName).toBe('DIV');
  });

  it('merges custom className', () => {
    render(
      <CardContent data-testid="content" className="mt-4">
        Content
      </CardContent>
    );

    const content = screen.getByTestId('content');
    expect(content).toHaveClass('mt-4');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<CardContent ref={ref}>Content</CardContent>);

    expect(ref).toHaveBeenCalled();
    expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
  });
});

describe('CardFooter Component', () => {
  it('renders children correctly', () => {
    render(<CardFooter>Footer content</CardFooter>);

    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('renders as div element', () => {
    render(<CardFooter data-testid="footer">Footer</CardFooter>);

    const footer = screen.getByTestId('footer');
    expect(footer.tagName).toBe('DIV');
  });

  it('has flex layout classes', () => {
    render(<CardFooter data-testid="footer">Footer</CardFooter>);

    const footer = screen.getByTestId('footer');
    expect(footer).toHaveClass('flex');
    expect(footer).toHaveClass('items-center');
    expect(footer).toHaveClass('pt-4');
  });

  it('merges custom className', () => {
    render(
      <CardFooter data-testid="footer" className="justify-between">
        Footer
      </CardFooter>
    );

    const footer = screen.getByTestId('footer');
    expect(footer).toHaveClass('justify-between');
    expect(footer).toHaveClass('flex');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<CardFooter ref={ref}>Footer</CardFooter>);

    expect(ref).toHaveBeenCalled();
    expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
  });
});

describe('Card composition', () => {
  it('composes all sub-components correctly', () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description goes here</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Main content of the card</p>
        </CardContent>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card description goes here')).toBeInTheDocument();
    expect(screen.getByText('Main content of the card')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });
});

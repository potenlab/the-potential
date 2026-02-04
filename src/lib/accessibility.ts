/**
 * Accessibility Utilities - The Potential Design System
 *
 * A collection of utilities and helpers for implementing accessible
 * user interfaces following WCAG 2.1 AA guidelines.
 *
 * Categories:
 * - Focus Management: Managing focus for keyboard navigation
 * - ARIA Helpers: Building proper ARIA attributes
 * - Keyboard Navigation: Handling keyboard interactions
 * - Announcements: Live region announcements for screen readers
 *
 * WCAG 2.1 AA Compliance Checklist:
 * - 1.3.1 Info and Relationships
 * - 1.4.3 Contrast (Minimum)
 * - 2.1.1 Keyboard
 * - 2.1.2 No Keyboard Trap
 * - 2.4.1 Bypass Blocks
 * - 2.4.3 Focus Order
 * - 2.4.6 Headings and Labels
 * - 2.4.7 Focus Visible
 * - 4.1.2 Name, Role, Value
 */

// ============================================================================
// Types
// ============================================================================

export type AriaRole =
  | 'alert'
  | 'alertdialog'
  | 'application'
  | 'article'
  | 'banner'
  | 'button'
  | 'checkbox'
  | 'columnheader'
  | 'combobox'
  | 'complementary'
  | 'contentinfo'
  | 'definition'
  | 'dialog'
  | 'directory'
  | 'document'
  | 'feed'
  | 'figure'
  | 'form'
  | 'grid'
  | 'gridcell'
  | 'group'
  | 'heading'
  | 'img'
  | 'link'
  | 'list'
  | 'listbox'
  | 'listitem'
  | 'log'
  | 'main'
  | 'marquee'
  | 'math'
  | 'menu'
  | 'menubar'
  | 'menuitem'
  | 'menuitemcheckbox'
  | 'menuitemradio'
  | 'navigation'
  | 'none'
  | 'note'
  | 'option'
  | 'presentation'
  | 'progressbar'
  | 'radio'
  | 'radiogroup'
  | 'region'
  | 'row'
  | 'rowgroup'
  | 'rowheader'
  | 'scrollbar'
  | 'search'
  | 'searchbox'
  | 'separator'
  | 'slider'
  | 'spinbutton'
  | 'status'
  | 'switch'
  | 'tab'
  | 'table'
  | 'tablist'
  | 'tabpanel'
  | 'term'
  | 'textbox'
  | 'timer'
  | 'toolbar'
  | 'tooltip'
  | 'tree'
  | 'treegrid'
  | 'treeitem';

export type AriaLive = 'off' | 'polite' | 'assertive';

// ============================================================================
// Focus Management
// ============================================================================

/**
 * Query selector for all focusable elements
 */
export const FOCUSABLE_SELECTOR = [
  'a[href]:not([disabled]):not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled]):not([tabindex="-1"]):not([type="hidden"])',
  'select:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"]):not([disabled])',
  '[contenteditable="true"]:not([tabindex="-1"])',
  'audio[controls]:not([disabled])',
  'video[controls]:not([disabled])',
  'details > summary:not([disabled])',
].join(', ');

/**
 * Query selector for tabbable elements (excludes tabindex="-1")
 */
export const TABBABLE_SELECTOR = [
  'a[href]:not([disabled]):not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled]):not([tabindex="-1"]):not([type="hidden"])',
  'select:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  '[tabindex="0"]:not([disabled])',
  '[contenteditable="true"]:not([tabindex="-1"])',
].join(', ');

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(
  container: HTMLElement | null
): HTMLElement[] {
  if (!container) return [];
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

/**
 * Get all tabbable elements within a container
 */
export function getTabbableElements(
  container: HTMLElement | null
): HTMLElement[] {
  if (!container) return [];
  return Array.from(container.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR));
}

/**
 * Focus the first focusable element in a container
 */
export function focusFirst(container: HTMLElement | null): boolean {
  const elements = getFocusableElements(container);
  if (elements.length > 0) {
    elements[0].focus();
    return true;
  }
  return false;
}

/**
 * Focus the last focusable element in a container
 */
export function focusLast(container: HTMLElement | null): boolean {
  const elements = getFocusableElements(container);
  if (elements.length > 0) {
    elements[elements.length - 1].focus();
    return true;
  }
  return false;
}

/**
 * Check if an element is currently focusable
 */
export function isFocusable(element: HTMLElement | null): boolean {
  if (!element) return false;
  return element.matches(FOCUSABLE_SELECTOR);
}

/**
 * Check if an element is visible and focusable
 */
export function isVisibleAndFocusable(element: HTMLElement | null): boolean {
  if (!element) return false;
  if (!isFocusable(element)) return false;

  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    element.offsetParent !== null
  );
}

// ============================================================================
// ARIA Helpers
// ============================================================================

/**
 * Generate a unique ID for ARIA associations
 */
let idCounter = 0;
export function generateId(prefix: string = 'aria'): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Build aria-describedby attribute from multiple IDs
 */
export function ariaDescribedBy(...ids: (string | undefined | null)[]): string | undefined {
  const validIds = ids.filter(Boolean);
  return validIds.length > 0 ? validIds.join(' ') : undefined;
}

/**
 * Build aria-labelledby attribute from multiple IDs
 */
export function ariaLabelledBy(...ids: (string | undefined | null)[]): string | undefined {
  const validIds = ids.filter(Boolean);
  return validIds.length > 0 ? validIds.join(' ') : undefined;
}

/**
 * Props for a dialog component
 */
export interface DialogAriaProps {
  id: string;
  role: 'dialog' | 'alertdialog';
  'aria-modal': boolean;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

/**
 * Generate ARIA props for a dialog
 */
export function getDialogAriaProps(options: {
  id?: string;
  titleId?: string;
  descriptionId?: string;
  alert?: boolean;
}): DialogAriaProps {
  const { id = generateId('dialog'), titleId, descriptionId, alert = false } = options;

  return {
    id,
    role: alert ? 'alertdialog' : 'dialog',
    'aria-modal': true,
    ...(titleId && { 'aria-labelledby': titleId }),
    ...(descriptionId && { 'aria-describedby': descriptionId }),
  };
}

/**
 * Props for a menu/dropdown component
 */
export interface MenuAriaProps {
  id: string;
  role: 'menu' | 'listbox';
  'aria-labelledby'?: string;
  'aria-activedescendant'?: string;
}

/**
 * Generate ARIA props for a menu
 */
export function getMenuAriaProps(options: {
  id?: string;
  triggerId?: string;
  activeItemId?: string;
  listbox?: boolean;
}): MenuAriaProps {
  const { id = generateId('menu'), triggerId, activeItemId, listbox = false } = options;

  return {
    id,
    role: listbox ? 'listbox' : 'menu',
    ...(triggerId && { 'aria-labelledby': triggerId }),
    ...(activeItemId && { 'aria-activedescendant': activeItemId }),
  };
}

/**
 * Props for a menu trigger button
 */
export interface MenuTriggerAriaProps {
  id: string;
  'aria-haspopup': 'menu' | 'listbox' | 'true';
  'aria-expanded': boolean;
  'aria-controls'?: string;
}

/**
 * Generate ARIA props for a menu trigger
 */
export function getMenuTriggerAriaProps(options: {
  id?: string;
  menuId?: string;
  isOpen: boolean;
  type?: 'menu' | 'listbox';
}): MenuTriggerAriaProps {
  const { id = generateId('trigger'), menuId, isOpen, type = 'menu' } = options;

  return {
    id,
    'aria-haspopup': type,
    'aria-expanded': isOpen,
    ...(menuId && isOpen && { 'aria-controls': menuId }),
  };
}

/**
 * Props for a tab component
 */
export function getTabAriaProps(options: {
  id: string;
  panelId: string;
  isSelected: boolean;
}): Record<string, string | boolean | number> {
  return {
    role: 'tab',
    id: options.id,
    'aria-selected': options.isSelected,
    'aria-controls': options.panelId,
    tabIndex: options.isSelected ? 0 : -1,
  };
}

/**
 * Props for a tab panel component
 */
export function getTabPanelAriaProps(options: {
  id: string;
  tabId: string;
  isSelected: boolean;
}): Record<string, string | boolean | number> {
  return {
    role: 'tabpanel',
    id: options.id,
    'aria-labelledby': options.tabId,
    hidden: !options.isSelected,
    tabIndex: 0,
  };
}

// ============================================================================
// Keyboard Navigation
// ============================================================================

/**
 * Key codes for keyboard navigation
 */
export const Keys = {
  Enter: 'Enter',
  Space: ' ',
  Escape: 'Escape',
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  Home: 'Home',
  End: 'End',
  Tab: 'Tab',
  PageUp: 'PageUp',
  PageDown: 'PageDown',
} as const;

export type Key = (typeof Keys)[keyof typeof Keys];

/**
 * Check if a key press is an activation key (Enter or Space)
 */
export function isActivationKey(key: string): boolean {
  return key === Keys.Enter || key === Keys.Space;
}

/**
 * Check if a key press is a navigation key
 */
export function isNavigationKey(key: string): boolean {
  const navigationKeys: string[] = [
    Keys.ArrowUp,
    Keys.ArrowDown,
    Keys.ArrowLeft,
    Keys.ArrowRight,
    Keys.Home,
    Keys.End,
  ];
  return navigationKeys.includes(key);
}

/**
 * Handle roving tabindex navigation for a list of items
 */
export function handleRovingTabIndex(
  event: KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  options: {
    orientation?: 'horizontal' | 'vertical' | 'both';
    loop?: boolean;
  } = {}
): number {
  const { orientation = 'vertical', loop = true } = options;
  const { key } = event;

  let newIndex = currentIndex;

  // Determine which keys to handle based on orientation
  const nextKeys: string[] =
    orientation === 'horizontal'
      ? [Keys.ArrowRight]
      : orientation === 'vertical'
        ? [Keys.ArrowDown]
        : [Keys.ArrowRight, Keys.ArrowDown];

  const prevKeys: string[] =
    orientation === 'horizontal'
      ? [Keys.ArrowLeft]
      : orientation === 'vertical'
        ? [Keys.ArrowUp]
        : [Keys.ArrowLeft, Keys.ArrowUp];

  if (nextKeys.includes(key)) {
    event.preventDefault();
    newIndex = loop
      ? (currentIndex + 1) % items.length
      : Math.min(currentIndex + 1, items.length - 1);
  } else if (prevKeys.includes(key)) {
    event.preventDefault();
    newIndex = loop
      ? (currentIndex - 1 + items.length) % items.length
      : Math.max(currentIndex - 1, 0);
  } else if (key === Keys.Home) {
    event.preventDefault();
    newIndex = 0;
  } else if (key === Keys.End) {
    event.preventDefault();
    newIndex = items.length - 1;
  }

  if (newIndex !== currentIndex && items[newIndex]) {
    items[newIndex].focus();
  }

  return newIndex;
}

// ============================================================================
// Live Announcements
// ============================================================================

let liveRegion: HTMLDivElement | null = null;

/**
 * Create or get the live region for screen reader announcements
 */
function getOrCreateLiveRegion(): HTMLDivElement {
  if (liveRegion) return liveRegion;

  if (typeof document === 'undefined') {
    throw new Error('Live region can only be created in browser environment');
  }

  liveRegion = document.createElement('div');
  liveRegion.setAttribute('role', 'status');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className =
    'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 [clip:rect(0,0,0,0)]';
  document.body.appendChild(liveRegion);

  return liveRegion;
}

/**
 * Announce a message to screen readers
 */
export function announce(
  message: string,
  options: {
    politeness?: AriaLive;
    timeout?: number;
  } = {}
): void {
  const { politeness = 'polite', timeout = 1000 } = options;

  if (typeof document === 'undefined') return;

  const region = getOrCreateLiveRegion();
  region.setAttribute('aria-live', politeness);

  // Clear existing content first
  region.textContent = '';

  // Use setTimeout to ensure the change is detected
  setTimeout(() => {
    region.textContent = message;
  }, 50);

  // Clear after timeout
  setTimeout(() => {
    region.textContent = '';
  }, timeout);
}

/**
 * Announce a polite message (won't interrupt current speech)
 */
export function announcePolite(message: string, timeout?: number): void {
  announce(message, { politeness: 'polite', timeout });
}

/**
 * Announce an assertive message (will interrupt current speech)
 */
export function announceAssertive(message: string, timeout?: number): void {
  announce(message, { politeness: 'assertive', timeout });
}

// ============================================================================
// Color Contrast
// ============================================================================

/**
 * Parse a hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate relative luminance of a color
 */
export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * WCAG 2.1 requires:
 * - 4.5:1 for normal text (Level AA)
 * - 3:1 for large text (Level AA)
 * - 7:1 for normal text (Level AAA)
 * - 4.5:1 for large text (Level AAA)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 1;

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if a color combination meets WCAG AA requirements
 */
export function meetsContrastAA(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const requiredRatio = isLargeText ? 3 : 4.5;
  return ratio >= requiredRatio;
}

/**
 * Check if a color combination meets WCAG AAA requirements
 */
export function meetsContrastAAA(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const requiredRatio = isLargeText ? 4.5 : 7;
  return ratio >= requiredRatio;
}

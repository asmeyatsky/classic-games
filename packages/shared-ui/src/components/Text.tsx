import React from 'react';

/**
 * Text Component
 *
 * Architectural Intent:
 * - Provides semantic typography with predefined styles
 * - Supports multiple heading levels and body text variants
 * - Flexible color and alignment options
 * - Consistent typography across platforms
 *
 * Key Design Decisions:
 * 1. Semantic HTML elements (h1-h3, p, span)
 * 2. Variant-based styling for consistency
 * 3. Optional bold for emphasis
 * 4. Flexible color overrides
 */

export interface TextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'body-small' | 'caption';
  color?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'success' | 'warning' | string;
  align?: 'left' | 'center' | 'right' | 'justify';
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold';
  className?: string;
  style?: React.CSSProperties;
}

const variantElements: Record<string, React.ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  body: 'p',
  'body-small': 'p',
  caption: 'span',
};

const variantClasses: Record<string, string> = {
  h1: 'text-4xl font-extrabold tracking-tight',
  h2: 'text-3xl font-bold tracking-tight',
  h3: 'text-2xl font-bold',
  h4: 'text-xl font-semibold',
  body: 'text-base font-regular leading-relaxed',
  'body-small': 'text-sm font-regular leading-normal',
  caption: 'text-xs font-regular text-tertiary',
};

const colorClasses: Record<string, string> = {
  primary: 'text-white',
  secondary: 'text-secondary',
  tertiary: 'text-tertiary',
  error: 'text-error',
  success: 'text-success',
  warning: 'text-warning',
};

const alignClasses: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
};

const weightClasses: Record<string, string> = {
  light: 'font-light',
  regular: 'font-regular',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

/**
 * Web Implementation of Text Component
 */
export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  color = 'primary',
  align = 'left',
  weight,
  className = '',
  style = {},
}) => {
  const Element = variantElements[variant];
  const variantClass = variantClasses[variant];
  const colorClass = colorClasses[color] || color;
  const alignClass = alignClasses[align];
  const weightClass = weight ? weightClasses[weight] : '';

  // Check if color is a custom value (not in colorClasses)
  const isCustomColor = !colorClasses[color];

  return React.createElement(
    Element,
    {
      className: `
        ${variantClass}
        ${isCustomColor ? '' : colorClass}
        ${alignClass}
        ${weightClass}
        ${className}
      `,
      style: isCustomColor ? { color, ...style } : style,
    },
    children
  );
};

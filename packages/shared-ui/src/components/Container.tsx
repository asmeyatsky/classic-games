import React from 'react';

/**
 * Container Component
 *
 * Architectural Intent:
 * - Provides a constrained, centered layout container
 * - Enables responsive max-width constraints
 * - Manages padding and centering consistently
 * - Foundation for page-level layouts
 *
 * Key Design Decisions:
 * 1. Flexible max-width for different content types
 * 2. Padding normalization
 * 3. Optional centering for content alignment
 * 4. CSS-based responsive approach
 */

export interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | number;
  padding?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  center?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const getMaxWidthClass = (maxWidth: string | number): string => {
  if (typeof maxWidth === 'number') {
    return '';
  }
  const maxWidthMap: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  };
  return maxWidthMap[maxWidth] || 'max-w-4xl';
};

const getPaddingClass = (padding: string | number): string => {
  if (typeof padding === 'number') {
    return '';
  }
  const paddingMap: Record<string, string> = {
    xs: 'px-4 py-2',
    sm: 'px-6 py-4',
    md: 'px-8 py-6',
    lg: 'px-12 py-8',
    xl: 'px-16 py-12',
  };
  return paddingMap[padding] || 'px-8 py-6';
};

/**
 * Web Implementation of Container Component
 */
export const Container: React.FC<ContainerProps> = ({
  children,
  maxWidth = 'lg',
  padding = 'md',
  center = true,
  className = '',
  style = {},
}) => {
  const maxWidthClass = getMaxWidthClass(maxWidth);
  const paddingClass = getPaddingClass(padding);

  const maxWidthStyle =
    typeof maxWidth === 'number' ? { maxWidth: `${maxWidth}px` } : {};
  const paddingStyle =
    typeof padding === 'number' ? { padding: `${padding}px` } : {};

  return (
    <div
      className={`
        w-full
        ${maxWidthClass}
        ${paddingClass}
        ${center ? 'mx-auto' : ''}
        ${className}
      `}
      style={{
        ...maxWidthStyle,
        ...paddingStyle,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

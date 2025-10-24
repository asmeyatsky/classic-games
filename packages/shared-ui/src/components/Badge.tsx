import React from 'react';

/**
 * Badge Component
 *
 * Architectural Intent:
 * - Displays status badges with semantic meaning
 * - Supports multiple variants for different contexts
 * - Flexible sizing for different use cases
 * - High contrast for accessibility
 */

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  style?: React.CSSProperties;
}

const variantClasses = {
  success: 'bg-success/20 text-success border border-success/30',
  error: 'bg-error/20 text-error border border-error/30',
  warning: 'bg-warning/20 text-warning border border-warning/30',
  info: 'bg-info/20 text-info border border-info/30',
  primary: 'bg-primary/20 text-primary-light border border-primary/30',
  secondary: 'bg-secondary/20 text-secondary-light border border-secondary/30',
};

const sizeClasses = {
  small: 'px-2 py-1 text-xs',
  medium: 'px-3 py-1.5 text-sm',
  large: 'px-4 py-2 text-base',
};

/**
 * Web Implementation of Badge Component
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'info',
  size = 'medium',
  className = '',
  style = {},
}) => {
  return (
    <span
      className={`
        inline-flex items-center
        rounded-full font-semibold
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      style={style}
    >
      {children}
    </span>
  );
};

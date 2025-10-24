import React from 'react';

/**
 * Button Component
 *
 * Architectural Intent:
 * - Provides a consistent button interface across platforms
 * - Supports multiple variants and sizes for different use cases
 * - Accessible with proper ARIA attributes
 * - Smooth animations and transitions
 *
 * Key Design Decisions:
 * 1. Variants (primary, secondary, outline) for semantic clarity
 * 2. Multiple sizes for flexibility
 * 3. Disabled state management
 * 4. Full-width support for mobile-first design
 */

export interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Web Implementation of Button Component
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  className = '',
  style = {},
  type = 'button',
}) => {
  const handleClick = () => {
    if (onPress) onPress();
    if (onClick) onClick();
  };

  // Size classes
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2.5 text-base',
    large: 'px-6 py-3.5 text-lg',
  };

  // Variant classes
  const variantClasses = {
    primary: `bg-gradient-primary text-white shadow-lg hover:shadow-glow-primary
              hover:scale-[1.02] active:scale-[0.98] disabled-state:opacity-60`,
    secondary: `bg-gradient-secondary text-white shadow-lg hover:shadow-glow-secondary
                hover:scale-[1.02] active:scale-[0.98] disabled-state:opacity-60`,
    outline: `border-2 border-primary text-primary bg-transparent
              hover:bg-primary/10 hover:scale-[1.02] active:scale-[0.98]`,
    ghost: `text-primary bg-transparent hover:bg-primary/5
            hover:scale-[1.02] active:scale-[0.98]`,
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-lg font-semibold font-display
        transition-smooth
        cursor-pointer
        ${fullWidth ? 'w-full' : 'inline-block'}
        ${disabled ? 'cursor-not-allowed opacity-50' : ''}
        ${className}
      `}
      style={style}
    >
      {children}
    </button>
  );
};

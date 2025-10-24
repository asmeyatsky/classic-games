import React from 'react';

/**
 * Card Component
 *
 * Architectural Intent:
 * - Provides a consistent card/container component
 * - Supports variable elevation levels for depth
 * - Flexible padding options
 * - Optional click handling for interactive cards
 *
 * Key Design Decisions:
 * 1. Elevation levels map to visual depth
 * 2. Padding values are normalized
 * 3. Smooth transitions for interactive states
 * 4. Platform-agnostic padding options
 */

export interface CardProps {
  children: React.ReactNode;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  padding?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  onPress?: () => void;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  interactive?: boolean;
}

const getPaddingClass = (padding: string): string => {
  const paddingMap: Record<string, string> = {
    xs: 'p-1',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };
  return paddingMap[padding] || 'p-4';
};

const getElevationClass = (elevation: number): string => {
  const elevationMap: Record<number, string> = {
    0: 'shadow-none',
    1: 'shadow-xs',
    2: 'shadow-sm',
    3: 'shadow-md',
    4: 'shadow-lg',
    5: 'shadow-xl',
  };
  return elevationMap[elevation] || 'shadow-sm';
};

/**
 * Web Implementation of Card Component
 */
export const Card: React.FC<CardProps> = ({
  children,
  elevation = 2,
  padding = 'md',
  onPress,
  onClick,
  className = '',
  style = {},
  interactive = false,
}) => {
  const handleClick = () => {
    if (onPress) onPress();
    if (onClick) onClick();
  };

  const paddingClass = getPaddingClass(padding);
  const elevationClass = getElevationClass(elevation);

  return (
    <div
      onClick={handleClick}
      className={`
        bg-surface rounded-lg
        ${paddingClass}
        ${elevationClass}
        ${interactive ? 'cursor-pointer transition-smooth hover:shadow-lg hover:bg-surface-hover' : ''}
        ${className}
      `}
      style={style}
    >
      {children}
    </div>
  );
};

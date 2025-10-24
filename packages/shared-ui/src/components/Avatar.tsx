import React from 'react';

/**
 * Avatar Component
 *
 * Architectural Intent:
 * - Displays user profile images or initials
 * - Supports multiple sizes
 * - Fallback to initials if image unavailable
 * - Optional click handler for profile interactions
 */

export interface AvatarProps {
  source?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  initials?: string;
  onPress?: () => void;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const sizeMap = {
  sm: { width: '32px', height: '32px', fontSize: '12px' },
  md: { width: '48px', height: '48px', fontSize: '16px' },
  lg: { width: '64px', height: '64px', fontSize: '20px' },
  xl: { width: '96px', height: '96px', fontSize: '28px' },
};

/**
 * Web Implementation of Avatar Component
 */
export const Avatar: React.FC<AvatarProps> = ({
  source,
  size = 'md',
  initials = '?',
  onPress,
  onClick,
  className = '',
  style = {},
}) => {
  const handleClick = () => {
    if (onPress) onPress();
    if (onClick) onClick();
  };

  const sizeStyle = sizeMap[size];

  return (
    <div
      onClick={handleClick}
      className={`
        flex items-center justify-center
        rounded-full bg-gradient-primary
        text-white font-bold
        transition-smooth
        ${onPress || onClick ? 'cursor-pointer hover:shadow-lg hover:scale-110' : ''}
        ${className}
      `}
      style={{
        ...sizeStyle,
        ...style,
      }}
    >
      {source ? (
        <img
          src={source}
          alt="Avatar"
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

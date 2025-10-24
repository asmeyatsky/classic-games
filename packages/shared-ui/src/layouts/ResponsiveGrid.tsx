import React from 'react';

/**
 * Responsive Grid Layout Component
 *
 * Architectural Intent:
 * - Platform-agnostic responsive grid system
 * - Provides consistent spacing and alignment
 * - Adapts to different screen sizes
 * - Uses flexbox for flexible layouts
 */

export interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: number | { mobile: number; tablet: number; desktop: number };
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  autoFill?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const getGapValue = (gap: string): number => {
  const gapMap: Record<string, number> = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  };
  return gapMap[gap] || 16;
};

const getPaddingValue = (padding: string): number => {
  const paddingMap: Record<string, number> = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  };
  return paddingMap[padding] || 16;
};

/**
 * Responsive Grid Component (Web Implementation)
 * Uses CSS Grid for responsive layouts
 */
export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = 3,
  gap = 'md',
  padding = 'md',
  align = 'stretch',
  justify = 'start',
  autoFill = true,
  className = '',
  style = {},
}) => {
  const gapValue = getGapValue(gap);
  const paddingValue = getPaddingValue(padding);

  let gridTemplateColumns: string;
  if (typeof columns === 'number') {
    gridTemplateColumns = autoFill
      ? `repeat(auto-fill, minmax(250px, 1fr))`
      : `repeat(${columns}, 1fr)`;
  } else {
    // For responsive columns, default to desktop
    gridTemplateColumns = `repeat(${columns.desktop || 3}, 1fr)`;
  }

  const alignItemsMap: Record<string, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
  };

  const justifyContentMap: Record<string, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around',
    evenly: 'space-evenly',
  };

  return (
    <div
      className={`w-full ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns,
        gap: `${gapValue}px`,
        padding: `${paddingValue}px`,
        alignItems: alignItemsMap[align],
        justifyContent: justifyContentMap[justify],
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Shared UI Library - Premium Design System
 *
 * Architectural Intent:
 * - Centralized export of all UI components and design systems
 * - Platform-agnostic component definitions
 * - Shared theme and animation systems
 * - Foundation for cross-platform consistency
 */

// Components
export { Button } from './components/Button';
export type { ButtonProps } from './components/Button';

export { Card } from './components/Card';
export type { CardProps } from './components/Card';

export { Container } from './components/Container';
export type { ContainerProps } from './components/Container';

export { Text } from './components/Text';
export type { TextProps } from './components/Text';

export { Modal } from './components/Modal';
export type { ModalProps } from './components/Modal';

export { Avatar } from './components/Avatar';
export type { AvatarProps } from './components/Avatar';

export { Badge } from './components/Badge';
export type { BadgeProps } from './components/Badge';

// Layouts
export { ResponsiveGrid } from './layouts/ResponsiveGrid';
export type { ResponsiveGridProps } from './layouts/ResponsiveGrid';

// Theme
export { theme } from './theme';
export type { Theme } from './theme';

// Animations
export {
  AnimationDurations,
  EasingFunctions,
  AnimationPresets,
  Transforms,
  createAnimationDelay,
  composeAnimation,
} from './animations';

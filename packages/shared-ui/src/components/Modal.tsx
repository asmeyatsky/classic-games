import React from 'react';

/**
 * Modal Component
 *
 * Architectural Intent:
 * - Provides a modal dialog overlay with backdrop
 * - Supports title and close handler
 * - Smooth fade-in/out animations
 * - Keyboard-accessible
 */

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

/**
 * Web Implementation of Modal Component
 */
export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  children,
  title,
  size = 'md',
  className = '',
}) => {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal Content */}
      <div
        className={`
          relative bg-surface rounded-xl shadow-2xl
          ${sizeClasses[size]}
          w-full mx-4
          animate-scale-in
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-surface-light">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-tertiary hover:text-primary transition-smooth text-2xl"
            >
              ×
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

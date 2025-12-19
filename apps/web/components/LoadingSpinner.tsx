import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const spinnerSize = sizeClasses[size];

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div
        className={`${spinnerSize} border-4 border-gray-700 border-t-primary rounded-full animate-spin`}
      ></div>
      <p className="text-gray-300">{text}</p>
    </div>
  );
};

export default LoadingSpinner;

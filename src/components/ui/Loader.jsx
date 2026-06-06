import React from 'react';
import clsx from '../../utils/clsx.js';

export default function Loader({ variant = 'glass', size = 'md', className }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const dotSizeClasses = {
    sm: 'h-1 w-1',
    md: 'h-2 w-2',
    lg: 'h-3 w-3',
    xl: 'h-4 w-4',
  };

  if (variant === 'dots') {
    return (
      <div className={clsx("flex items-center gap-1", className)}>
        <div className={clsx(dotSizeClasses[size], "rounded-full bg-primary-500 animate-[bounce_1s_infinite_0ms]")} />
        <div className={clsx(dotSizeClasses[size], "rounded-full bg-primary-500 animate-[bounce_1s_infinite_200ms]")} />
        <div className={clsx(dotSizeClasses[size], "rounded-full bg-primary-500 animate-[bounce_1s_infinite_400ms]")} />
      </div>
    );
  }

  if (variant === 'glass') {
    return (
      <div className={clsx("relative flex items-center justify-center", sizeClasses[size], className)}>
        {/* Glow effect behind */}
        <div className="absolute inset-0 rounded-full bg-primary-400 blur-md animate-pulse-glow opacity-50"></div>
        {/* Spinner ring */}
        <svg
          className="relative animate-spin text-primary-500 z-10"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );
  }

  return null;
}

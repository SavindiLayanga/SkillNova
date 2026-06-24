import React from 'react';
import clsx from '../../utils/clsx.js';

export default function Loader({ 
  text, 
  secondaryText,
  className,
  size = "lg"
}) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16 md:h-20 md:w-20"
  };

  const borderSizes = {
    sm: '3px',
    md: '5px',
    lg: '8px'
  };

  const containerClasses = {
    sm: "p-2",
    md: "p-4",
    lg: "min-h-[70vh] w-full flex-grow p-6"
  };

  return (
    <div className={clsx("flex flex-col items-center justify-center", containerClasses[size], className)}>
      {/* Spinner container using custom-loader CSS */}
      <div 
        className={clsx("custom-loader", sizeClasses[size], (text || secondaryText) && "mb-6")}
        style={{ '--b': borderSizes[size] }}
      ></div>

      {/* Loading Text */}
      {text && (
        <h3 className={clsx("font-semibold text-gray-900 text-center animate-pulse", size === "sm" ? "text-sm" : "text-lg md:text-xl mb-2")}>
          {text}
        </h3>
      )}
      {secondaryText && (
        <p className="text-sm text-gray-500 text-center max-w-sm">
          {secondaryText}
        </p>
      )}
    </div>
  );
}

import React from 'react';

export const Progress = ({ 
  value = 0, 
  max = 100, 
  className = '',
  indicatorClassName = '',
  ...props 
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div 
      className={`relative w-full overflow-hidden rounded-full bg-slate-800 ${className}`}
      {...props}
    >
      <div
        className={`h-full w-full flex-1 bg-blue-500 transition-all duration-500 ease-out ${indicatorClassName}`}
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  );
};

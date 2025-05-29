import React from 'react';

export const Badge = ({ 
  className = '', 
  children, 
  variant = 'default', 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors';
  
  const variants = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    outline: 'text-slate-300 border-slate-600 hover:bg-slate-800',
    secondary: 'bg-slate-700 text-slate-200 border-slate-600',
    destructive: 'bg-red-600/20 text-red-400 border-red-500/30',
    success: 'bg-green-600/20 text-green-400 border-green-500/30',
    warning: 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30',
    info: 'bg-blue-600/20 text-blue-400 border-blue-500/30'
  };

  return (
    <span 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
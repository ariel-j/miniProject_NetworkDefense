import React from 'react';

export const Button = ({ 
  className = '', 
  children, 
  variant = 'default', 
  size = 'default',
  disabled = false,
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    default: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
    outline: 'border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white',
    ghost: 'hover:bg-slate-800 text-slate-300 hover:text-white',
    destructive: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
  };

  const sizes = {
    default: 'px-4 py-2 text-sm',
    sm: 'px-3 py-1.5 text-xs',
    lg: 'px-6 py-3 text-base',
    icon: 'p-2'
  };
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

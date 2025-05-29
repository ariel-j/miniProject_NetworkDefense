import React, { createContext, useContext, useState } from 'react';

const TabsContext = createContext();

export const Tabs = ({ 
  defaultValue, 
  value: controlledValue, 
  onValueChange,
  className = '',
  children,
  ...props 
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const setValue = (newValue) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ className = '', children, ...props }) => {
  return (
    <div 
      className={`inline-flex h-10 items-center justify-center rounded-lg bg-slate-800/50 p-1 text-slate-400 grid w-full ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const TabsTrigger = ({ 
  value, 
  className = '', 
  children, 
  disabled = false,
  ...props 
}) => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('TabsTrigger must be used within Tabs');
  }

  const { value: selectedValue, setValue } = context;
  const isSelected = selectedValue === value;

  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:pointer-events-none disabled:opacity-50 ${
        isSelected 
          ? 'bg-slate-900 text-slate-50 shadow-sm' 
          : 'hover:bg-slate-700 hover:text-slate-200'
      } ${className}`}
      onClick={() => !disabled && setValue(value)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ 
  value, 
  className = '', 
  children, 
  ...props 
}) => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('TabsContent must be used within Tabs');
  }

  const { value: selectedValue } = context;
  const isSelected = selectedValue === value;

  if (!isSelected) return null;

  return (
    <div 
      className={`mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
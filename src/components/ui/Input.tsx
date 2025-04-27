import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  className,
  label,
  error,
  fullWidth = false,
  icon,
  ...props
}) => {
  const id = props.id || props.name;
  
  const inputClasses = twMerge(
    clsx(
      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
      'file:border-0 file:bg-transparent file:text-sm file:font-medium',
      'placeholder:text-muted-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      error ? 'border-destructive focus-visible:ring-destructive' : '',
      icon ? 'pl-10' : '',
      className
    )
  );
  
  const containerClasses = twMerge(
    clsx(
      'space-y-2',
      fullWidth ? 'w-full' : 'max-w-sm'
    )
  );

  return (
    <div className={containerClasses}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-2.5 text-muted-foreground">
            {icon}
          </div>
        )}
        
        <input id={id} className={inputClasses} {...props} />
      </div>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

export default Input;
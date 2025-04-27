import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive';
}

const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-primary/10 text-primary hover:bg-primary/20',
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    outline: 'text-foreground border border-input',
    success: 'bg-success/10 text-success hover:bg-success/20',
    warning: 'bg-warning/10 text-warning hover:bg-warning/20',
    destructive: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          variantStyles[variant],
          className
        )
      )}
      {...props}
    />
  );
};

export default Badge;
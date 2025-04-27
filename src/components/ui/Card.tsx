import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ className, children }) => {
  return (
    <div className={twMerge(clsx('bg-white rounded-lg border shadow-sm', className))}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

const CardHeader: React.FC<CardHeaderProps> = ({ className, children }) => {
  return (
    <div className={twMerge(clsx('p-6 flex flex-col space-y-1.5', className))}>
      {children}
    </div>
  );
};

interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
}

const CardTitle: React.FC<CardTitleProps> = ({ className, children }) => {
  return (
    <h3 className={twMerge(clsx('text-lg font-semibold leading-none tracking-tight', className))}>
      {children}
    </h3>
  );
};

interface CardDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

const CardDescription: React.FC<CardDescriptionProps> = ({ className, children }) => {
  return (
    <p className={twMerge(clsx('text-sm text-muted-foreground', className))}>
      {children}
    </p>
  );
};

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

const CardContent: React.FC<CardContentProps> = ({ className, children }) => {
  return (
    <div className={twMerge(clsx('p-6 pt-0', className))}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

const CardFooter: React.FC<CardFooterProps> = ({ className, children }) => {
  return (
    <div className={twMerge(clsx('flex items-center p-6 pt-0', className))}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
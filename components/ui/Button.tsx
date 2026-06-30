'use client';
import React from 'react';
import { clsx } from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';
export type ButtonSize = 'sm' | 'md';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:   'bg-action text-background hover:bg-action-hover disabled:bg-action-muted disabled:text-action-muted-fg',
  secondary: 'border border-border-base bg-surface-hover text-content-secondary hover:bg-action-muted disabled:bg-surface-hover disabled:text-content-faint',
  danger:    'border border-border-base bg-danger-surface text-danger-content hover:bg-danger-surface-hover',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 py-1.5 text-xs',
  md: 'min-h-10 px-4 py-2 text-sm',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'sm',
  className,
  children,
  ...props
}) => (
  <button
    className={clsx(
      'inline-flex cursor-pointer items-center justify-center rounded text-center font-medium leading-snug transition-colors active:translate-y-px disabled:cursor-not-allowed disabled:active:translate-y-0',
      variantClasses[variant],
      sizeClasses[size],
      className
    )}
    {...props}
  >
    {children}
  </button>
);

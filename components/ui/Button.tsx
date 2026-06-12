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
  primary:   'bg-action text-white hover:bg-action-hover disabled:bg-action-muted disabled:text-action-muted-fg',
  secondary: 'bg-surface-hover text-content-secondary hover:bg-action-muted disabled:bg-surface-hover disabled:text-content-faint',
  danger:    'bg-danger-surface text-danger-content hover:bg-danger-surface-hover',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
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
      'rounded transition-colors cursor-pointer disabled:cursor-not-allowed',
      variantClasses[variant],
      sizeClasses[size],
      className
    )}
    {...props}
  >
    {children}
  </button>
);

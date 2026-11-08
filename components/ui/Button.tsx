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
      // 按压反馈只用滤镜，不用 transform：位移会扩大滚动容器的溢出区域，
      // 在内容恰好临界的面板里按下按钮会突然出现滚动条、缩窄按钮并吞掉 click。
      'inline-flex cursor-pointer items-center justify-center rounded text-center font-medium leading-snug transition-colors active:brightness-95 disabled:cursor-not-allowed',
      variantClasses[variant],
      sizeClasses[size],
      className
    )}
    {...props}
  >
    {children}
  </button>
);

import React from 'react';
import { clsx } from 'clsx';

interface PanelProps {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** 输入/输出面板通用骨架 */
export const Panel: React.FC<PanelProps> = ({ title, actions, children, className }) => (
  <div className={clsx('flex min-w-0 flex-col rounded-lg bg-surface p-3 shadow sm:p-4', className)}>
    <div className="mb-4 flex flex-wrap items-start justify-between gap-2 sm:items-center">
      <h2 className="min-w-0 text-base font-semibold text-content sm:text-lg">{title}</h2>
      {actions && <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">{actions}</div>}
    </div>
    <div className="flex min-h-0 flex-grow flex-col">{children}</div>
  </div>
);

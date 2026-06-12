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
  <div className={clsx('bg-surface rounded-lg shadow p-4 flex flex-col', className)}>
    <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
    <div className="flex-grow flex flex-col min-h-0">{children}</div>
  </div>
);

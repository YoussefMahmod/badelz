"use client";

import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-sm bg-[#1a1a1a] border border-[#333] text-[#666]">
        {icon}
      </div>
      <h3 className="mb-1 text-lg font-semibold text-[#999]">{title}</h3>
      {description && (
        <p className="mb-6 max-w-xs text-sm text-[#666]">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="rounded-sm bg-[#d4ff00] px-6 py-2.5 text-sm font-bold text-[#0d0d0d] cursor-pointer active:scale-[0.97] transition-transform duration-75"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

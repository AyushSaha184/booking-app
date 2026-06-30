import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
}

export const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ label, error, leftIcon, rightIcon, className, wrapperClassName, id, ...props }, ref) => {
    const inputId = id ?? `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className={cn('space-y-2', wrapperClassName)}>
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>

        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8B1538] transition-colors">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full bg-white border border-gray-200 rounded-xl text-base text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200",
              "focus:bg-white focus:border-[#8B1538] focus:ring-4 focus:ring-[#8B1538]/5",
              leftIcon && "pl-11 pr-4",
              !leftIcon && rightIcon && "pl-4 pr-11",
              !leftIcon && !rightIcon && "px-4",
              "py-3.5",
              error && "border-red-300 focus:border-red-500 focus:ring-red-500/10 bg-red-50/30",
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-600 flex items-center gap-1 pl-1 animate-in fade-in slide-in-from-top-1">
            <span>⚠</span> {error}
          </p>
        )}
      </div>
    )
  }
);
AnimatedInput.displayName = 'AnimatedInput';
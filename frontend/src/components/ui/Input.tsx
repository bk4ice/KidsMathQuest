import React, { forwardRef } from 'react';
import classNames from 'classnames';

export type InputSize = 'small' | 'middle' | 'large';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  size = 'middle',
  error = false,
  className,
  ...props
}, ref) => {
  const baseClasses = 'w-full bg-[#f7f3df] border-[#c4b89e] text-[#725d42] font-medium placeholder-[#c4b89e] focus:outline-none transition-all duration-250';
  
  const sizeClasses = {
    small: 'h-8 px-[14px] text-xs rounded-[40px] border-2 shadow-[0_2px_0_0_#d4c9b4]',
    middle: 'h-10 px-[18px] text-sm rounded-[50px] border-[2.5px] shadow-[0_3px_0_0_#d4c9b4]',
    large: 'h-12 px-[22px] text-base rounded-[50px] border-[3px] shadow-[0_4px_0_0_#d4c9b4]',
  };

  const focusClasses = 'focus:border-[#ffcc00] focus:shadow-[0_3px_0_0_#e0b800,0_0_0_3px_rgba(255,204,0,0.15)]';
  const errorClasses = 'border-[#e05a5a] shadow-[0_3px_0_0_#c94444]';
  const disabledClasses = 'bg-[#ece8dc] border-[#d4c9b4] shadow-none opacity-60 cursor-not-allowed';

  return (
    <input
      ref={ref}
      className={classNames(
        baseClasses,
        sizeClasses[size],
        !props.disabled && !error && focusClasses,
        error && errorClasses,
        props.disabled && disabledClasses,
        className
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';

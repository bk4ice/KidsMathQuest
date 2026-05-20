import React from 'react';
import classNames from 'classnames';

export type ButtonType = 'primary' | 'success' | 'warning' | 'danger' | 'default';
export type ButtonSize = 'small' | 'middle' | 'large';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  type?: ButtonType;
  nativeType?: 'submit' | 'reset' | 'button';
  size?: ButtonSize;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  type = 'default',
  nativeType = 'button',
  size = 'middle',
  loading = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = 'relative inline-flex items-center justify-center font-bold transition-all duration-250 select-none cursor-pointer';
  
  const sizeClasses = {
    small: 'h-8 px-4 text-xs rounded-xl',
    middle: 'h-[45px] px-5 text-sm rounded-[50px]',
    large: 'h-12 px-8 text-base rounded-3xl',
  };

  const typeClasses = {
    primary: 'bg-[#f8f8f0] text-[#794f27] border-2 border-[#f8f8f0] shadow-[0_5px_0_0_#bdaea0] active:shadow-[0_1px_0_0_#bdaea0]',
    success: 'bg-[#6fba2c] text-white border-2 border-[#6fba2c] shadow-[0_5px_0_0_#5a9e1e] active:shadow-[0_1px_0_0_#5a9e1e]',
    warning: 'bg-[#f5c31c] text-[#725d42] border-2 border-[#f5c31c] shadow-[0_5px_0_0_#dba90e] active:shadow-[0_1px_0_0_#dba90e]',
    danger: 'bg-[#e05a5a] text-white border-2 border-[#e05a5a] shadow-[0_5px_0_0_#c94444] active:shadow-[0_1px_0_0_#c94444]',
    default: 'bg-white text-[#725d42] border-2 border-[#c4b89e] shadow-[0_5px_0_0_#d4c9b4] active:shadow-[0_1px_0_0_#d4c9b4]',
  };

  const activeClasses = 'active:translate-y-[2px] hover:-translate-y-[1px]';
  const disabledClasses = 'opacity-50 cursor-not-allowed shadow-none active:translate-y-0';

  const mergedClasses = classNames(
    baseClasses,
    sizeClasses[size],
    typeClasses[type],
    !disabled && !loading && activeClasses,
    (disabled || loading) && disabledClasses,
    className
  );

  return (
    <button
      type={nativeType}
      className={mergedClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="mr-2 animate-spin">
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </span>
      )}
      {children}
    </button>
  );
};

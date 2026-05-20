import React from 'react';
import classNames from 'classnames';

export type CardType = 'default' | 'title';
export type CardColor = 
  | 'default' 
  | 'app-pink' 
  | 'purple' 
  | 'app-blue' 
  | 'app-yellow' 
  | 'app-orange' 
  | 'app-teal' 
  | 'app-green' 
  | 'app-red' 
  | 'lime-green' 
  | 'yellow-green' 
  | 'brown' 
  | 'warm-peach-pink';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: CardType;
  color?: CardColor;
}

const colorMap: Record<CardColor, { bg: string; text: string }> = {
  default: { bg: 'bg-[#f7f3df]', text: 'text-[#725d42]' },
  'app-pink': { bg: 'bg-[#f8a6b2]', text: 'text-white' },
  purple: { bg: 'bg-[#b77dee]', text: 'text-white' },
  'app-blue': { bg: 'bg-[#889df0]', text: 'text-white' },
  'app-yellow': { bg: 'bg-[#f7cd67]', text: 'text-[#725d42]' },
  'app-orange': { bg: 'bg-[#e59266]', text: 'text-white' },
  'app-teal': { bg: 'bg-[#82d5bb]', text: 'text-white' },
  'app-green': { bg: 'bg-[#8ac68a]', text: 'text-white' },
  'app-red': { bg: 'bg-[#fc736d]', text: 'text-white' },
  'lime-green': { bg: 'bg-[#d1da49]', text: 'text-[#3d5a1a]' },
  'yellow-green': { bg: 'bg-[#ecdf52]', text: 'text-[#725d42]' },
  brown: { bg: 'bg-[#9a835a]', text: 'text-white' },
  'warm-peach-pink': { bg: 'bg-[#e18c6f]', text: 'text-white' },
};

export const Card: React.FC<CardProps> = ({
  type = 'default',
  color = 'default',
  children,
  className,
  style,
  ...props
}) => {
  const { bg, text } = colorMap[color];
  
  const baseClasses = classNames(
    'transition-all duration-300 ease-in-out',
    bg,
    text,
    className
  );

  if (type === 'title') {
    return (
      <div 
        className={classNames(
          baseClasses,
          'rounded-[40px_35px_45px_38px/38px_45px_35px_40px] px-8 py-3 font-semibold shadow-[0_4px_10px_rgba(107,92,67,0.42)] hover:-translate-y-1'
        )}
        style={style}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <div 
      className={classNames(
        baseClasses,
        'rounded-[20px] px-6 py-4 shadow-[0_4px_10px_rgba(107,92,67,0.42)] hover:-translate-y-1'
      )}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};

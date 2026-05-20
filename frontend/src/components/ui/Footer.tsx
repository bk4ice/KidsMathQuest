import React from 'react';

export type FooterType = 'tree' | 'sea';

export interface FooterProps {
  type?: FooterType;
  className?: string;
  style?: React.CSSProperties;
}

export const Footer: React.FC<FooterProps> = ({ type = 'tree', className, style }) => {
  const baseClass = 'w-full bg-no-repeat bg-center bg-contain';
  const typeClass = type === 'sea' ? 'h-20' : 'h-[80px]';
  const bgImage = type === 'sea'
    ? 'url(/img/footer-sea.svg)'
    : 'url(/img/footer-tree.webp)';

  return (
    <div
      className={`${baseClass} ${typeClass} ${className}`}
      style={{ backgroundImage: bgImage, ...style }}
    />
  );
};

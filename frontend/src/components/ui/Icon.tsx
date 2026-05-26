import React from 'react';

export type IconName =
  | 'leaf'
  | 'miles'
  | 'critterpedia'
  | 'trophy'
  | 'history'
  | 'logout'
  | 'play'
  | 'sparkle'
  | 'star'
  | 'heart'
  | 'backspace'
  | 'close'
  | 'eye'
  | 'target'
  | 'check';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number | string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, className, ...props }) => {
  const icons: Record<IconName, React.ReactNode> = {
    leaf: (
      <path d="M12 2.5c5 0 9 4 9 9s-4 8.5-10 8.5c-5 0-8.5-3.5-8-8.5 0.5-5 4-9 9-9z M9.5 16c2.5-3 5.5-5.5 9-8" />
    ),
    miles: (
      <path d="M12 2l2.5 7.5H22l-6 4.5 2.5 8-6.5-5-6.5 5 2.5-8-6-4.5h7.5L12 2z" />
    ),
    critterpedia: (
      <g>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20v4H6.5a2.5 2.5 0 0 1-2.5-2.5zM6.5 2H20v15H6.5A2.5 2.5 0 0 0 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2z" />
        <path d="M10 7.5c2.5 0 4.5 2 4.5 4.5s-2 4.5-4.5 4.5c-2.5 0-4-1.5-4-4.5 0-3 2.5-4.5 4.5-4.5z M8.5 14c1.5-1.5 3-2.5 4.5-4" strokeWidth="1.5" />
      </g>
    ),
    trophy: (
      <path d="M6 9V2h12v7c0 3.31-2.69 6-6 6S6 12.31 6 9zm0-5H2v2c0 1.66 1.34 3 3 3h1v-5zm13 0v5h1c1.66 0 3-1.34 3-3V4h-4zM12 15v5m-4 0h8" />
    ),
    history: (
      <g>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </g>
    ),
    logout: (
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14l5-5-5-5m5 5H9" />
    ),
    play: (
      <path d="M6 3l14 9-14 9V3z" fill="currentColor" stroke="none" />
    ),
    sparkle: (
      <path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z" fill="currentColor" stroke="none" />
    ),
    star: (
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" stroke="none" />
    ),
    heart: (
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" stroke="none" />
    ),
    backspace: (
      <path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14.5 13.91 11.41 17 10 15.59 13.09 12.5 10 9.41 11.41 8 14.5 11.09 17.59 8 19 9.41 15.91 12.5 19 15.59z" fill="currentColor" stroke="none" />
    ),
    close: (
      <path d="M18 6L6 18M6 6l12 12" />
    ),
    eye: (
      <g>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </g>
    ),
    target: (
      <g>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </g>
    ),
    check: (
      <path d="M20 6L9 17l-5-5" fill="currentColor" stroke="none" />
    ),
  };

  const currentIcon = icons[name];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {currentIcon}
    </svg>
  );
};

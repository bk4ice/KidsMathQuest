import React from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className = '',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div 
        className={`relative z-10 max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-[40px] p-6 ${className}`}
        style={{ 
          backgroundColor: 'rgb(247, 243, 223)',
          boxShadow: '0 4px 10px rgba(107, 92, 67, 0.42)'
        }}
      >
        {children}
      </div>
    </div>
  );
};

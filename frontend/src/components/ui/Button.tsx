import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'claim';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  className = '',
}) => {
  const baseClasses = "font-semibold text-base leading-[142%] uppercase transition-all duration-200 flex items-center justify-center px-6 h-12 items-center relative overflow-hidden";
  
  const primaryClasses = "bg-gradient-to-t to-[#ffda00] from-[#b63d12] text-[#090909] rounded-[50px] hover:opacity-90 items-center pt-1";
  
  if (variant === 'secondary') {
    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${className} rounded-[50px] bg-gradient-to-r from-[#ffda00] !to-[#9F0B18] !p-0.5 items-center`}
      >
        <span className="flex bg-black/95 rounded-[46px] text-[#f2cc02] items-center justify-center w-full h-full text-center px-6 pt-1 relative z-10">
          {children}
        </span>
      </button>
    );
  }

  if (variant === 'tertiary') {
    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${className} rounded-[50px] bg-gradient-to-l from-[#ffda00] !to-[#9F0B18] !p-0.5 items-center`}
      >
        <span className="flex bg-black/95 rounded-[46px] text-[#f2cc02] items-center justify-center w-full h-full text-center px-6 pt-1 relative z-10">
          {children}
        </span>
      </button>
    );
  }

  if (variant === 'claim') {
    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${className} rounded-[50px] bg-gradient-to-b from-[#ffda00] !to-[#9F0B18] !p-0.5 items-center`}
      >
        <span className="flex bg-black/95 rounded-[46px] text-[#f2cc02] items-center justify-center w-full h-full text-center px-6 pt-1 relative z-10">
          {children}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${primaryClasses} ${className}`}
    >
      <span className="relative z-10">
        {children}
      </span>
    </button>
  );
};
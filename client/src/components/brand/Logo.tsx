import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSlogan?: boolean;
}

export default function Logo({ size = 'md', showSlogan = false }: LogoProps) {
  const sizeClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const iconSizes = {
    sm: 'w-7 h-7 text-sm',
    md: 'w-9 h-9 text-lg',
    lg: 'w-12 h-12 text-2xl',
  };

  return (
    <div className="flex items-center gap-3">
      {/* Isotipo: Símbolo moderno inspirado en el brillo y energía de la flor */}
      <div className={`${iconSizes[size]} rounded-xl bg-gradient-to-br from-brand-primary to-[#FF8C33] flex items-center justify-center shadow-lg shadow-brand-primary/25 text-white font-black tracking-tighter`}>
        C
      </div>
      
      <div className="flex flex-col">
        <span className={`font-extrabold tracking-tight text-text-main ${sizeClasses[size]}`}>
          Cempa<span className="text-brand-primary">.ai</span>
        </span>
        {showSlogan && (
          <span className="text-[10px] text-text-muted font-medium tracking-wide">
            Your ideas, brought to brilliant life.
          </span>
        )}
      </div>
    </div>
  );
}

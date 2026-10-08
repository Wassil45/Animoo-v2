import React from 'react';

interface AnimooLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  taglineText?: string;
  variant?: 'full' | 'icon-only' | 'wordmark';
}

export const AnimooLogo: React.FC<AnimooLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
  taglineText = 'Le Tinder pour vos boules de poils 🐾',
  variant = 'full',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div className="flex items-center gap-2">
        {/* Heart & Paw Icon */}
        {variant !== 'wordmark' && (
          <div className={`${iconSizes[size]} flex-shrink-0 relative flex items-center justify-center`}>
            <svg
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-[0_4px_10px_rgba(255,51,102,0.3)]"
            >
              <defs>
                <linearGradient id="animooHeartGrad" x1="10%" y1="0%" x2="90%" y2="100%">
                  <stop offset="0%" stopColor="#FF385C" />
                  <stop offset="50%" stopColor="#E11D48" />
                  <stop offset="100%" stopColor="var(--color-primary)" />
                </linearGradient>
              </defs>
              
              {/* Outer Heart Shape */}
              <path
                d="M50 88C48.5 88 47 87.2 46 86C32 72 16 57 10 44C4 31 8 16 23 11C35 7 45 15 50 21C55 15 65 7 77 11C92 16 96 31 90 44C84 57 68 72 54 86C53 87.2 51.5 88 50 88Z"
                fill="url(#animooHeartGrad)"
              />
              
              {/* White Paw Cutout inside heart */}
              {/* Main Pad */}
              <path
                d="M50 68C43 68 39 61 40 54C41 49 45 47 50 47C55 47 59 49 60 54C61 61 57 68 50 68Z"
                fill="#FFFFFF"
              />
              {/* 4 Toe Beans */}
              <ellipse cx="36" cy="42" rx="4.5" ry="6.5" transform="rotate(-20 36 42)" fill="#FFFFFF" />
              <ellipse cx="45" cy="36" rx="4.5" ry="6.5" transform="rotate(-7 45 36)" fill="#FFFFFF" />
              <ellipse cx="55" cy="36" rx="4.5" ry="6.5" transform="rotate(7 55 36)" fill="#FFFFFF" />
              <ellipse cx="64" cy="42" rx="4.5" ry="6.5" transform="rotate(20 64 42)" fill="#FFFFFF" />
            </svg>
          </div>
        )}

        {/* Wordmark: animoo */}
        {variant !== 'icon-only' && (
          <div className="flex items-baseline">
            <span
              className={`${textSizes[size]} font-extrabold tracking-tight text-[#23272F] flex items-center`}
              style={{ letterSpacing: '-0.03em' }}
            >
              an
              {/* 'i' with signature pink dot */}
              <span className="relative inline-flex flex-col items-center">
                <span className="w-2 h-2 rounded-full bg-[#E11D48] absolute -top-1.5" />
                <span>ı</span>
              </span>
              moo
              <span className="text-[#E11D48] font-black">.</span>
            </span>
          </div>
        )}
      </div>

      {showTagline && (
        <p className="text-xs font-semibold text-stone-500 mt-1 flex items-center gap-1">
          {taglineText}
        </p>
      )}
    </div>
  );
};

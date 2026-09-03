import React from 'react';

export const LeafIllustration: React.FC<{ className?: string }> = ({ className = 'w-6 h-6 text-[#6C9A4A]' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M20 36C20 36 21 27 28 20C35 13 36 4 36 4C36 4 27 5 20 12C13 19 4 20 4 20C4 20 13 21 20 28V36Z"
      fill="currentColor"
      fillOpacity="0.85"
    />
    <path
      d="M20 36C20 36 21 22 36 4M20 20C24 16 28 14 32 12M20 28C16 24 12 22 8 20"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const FlowerIllustration: React.FC<{ className?: string }> = ({ className = 'w-6 h-6 text-[#F4C542]' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="20" cy="10" r="7" fill="#F7B7C4" />
    <circle cx="30" cy="20" r="7" fill="#F7B7C4" />
    <circle cx="20" cy="30" r="7" fill="#F7B7C4" />
    <circle cx="10" cy="20" r="7" fill="#F7B7C4" />
    <circle cx="20" cy="20" r="6" fill="#F4C542" />
    <circle cx="20" cy="20" r="2.5" fill="#405B32" />
  </svg>
);

export const StarSparkle: React.FC<{ className?: string }> = ({ className = 'w-4 h-4 text-[#F28C38]' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
  </svg>
);

export const StampOneOfOne: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`inline-flex items-center gap-1.5 px-3 py-1 bg-[#F8F1DF] border border-[#6C9A4A]/40 rounded-full text-xs font-semibold text-[#405B32] shadow-xs ${className}`}
  >
    <span className="w-2 h-2 rounded-full bg-[#6C9A4A] animate-pulse"></span>
    <span>1 / 1 — ĐỘC BẢN</span>
  </div>
);

export const SoldOutStamp: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`inline-flex items-center gap-1.5 px-3 py-1 bg-[#283124] text-[#FFFDF7] rounded-full text-xs font-bold tracking-wider uppercase ${className}`}
  >
    <span>SOLD OUT</span>
  </div>
);

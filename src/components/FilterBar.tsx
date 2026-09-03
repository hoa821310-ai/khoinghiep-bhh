import React from 'react';
import { Sparkles, CheckCircle2, Clock, Timer } from 'lucide-react';

export type FilterStatus = 'ALL' | 'AVAILABLE' | 'UPCOMING' | 'SOLD_OUT';

interface FilterBarProps {
  activeFilter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
  availableCount: number;
  upcomingCount: number;
  soldOutCount: number;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  activeFilter,
  onFilterChange,
  availableCount,
  upcomingCount,
  soldOutCount,
  totalCount
}) => {
  const filters: { id: FilterStatus; label: string; count: number; icon: React.ReactNode }[] = [
    { id: 'ALL', label: 'Tất cả', count: totalCount, icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'AVAILABLE', label: 'Đang mở bán', count: availableCount, icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    { id: 'UPCOMING', label: 'Sắp mở bán', count: upcomingCount, icon: <Timer className="w-3.5 h-3.5" /> },
    { id: 'SOLD_OUT', label: 'SOLD OUT', count: soldOutCount, icon: <Clock className="w-3.5 h-3.5" /> }
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none no-scrollbar">
      {filters.map(filter => {
        const isActive = activeFilter === filter.id;
        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 border ${
              isActive
                ? 'bg-[#6C9A4A] text-white border-[#405B32] shadow-xs scale-100'
                : 'bg-[#FFFDF7] text-[#283124] border-[#DED8C5] hover:bg-[#F8F1DF]'
            }`}
          >
            {filter.icon}
            <span>{filter.label}</span>
            <span
              className={`px-1.5 py-0.2 text-[10px] rounded-full font-extrabold ${
                isActive ? 'bg-white/25 text-white' : 'bg-[#F8F1DF] text-[#707766]'
              }`}
            >
              {filter.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

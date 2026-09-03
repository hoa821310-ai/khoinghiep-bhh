import React from 'react';
import { LeafIllustration, FlowerIllustration, StarSparkle } from './BotanicalDecorations';
import { Sparkles, ArrowRight, ShieldCheck, Heart, Calendar, Clock } from 'lucide-react';

interface HeroProps {
  onExplore: () => void;
  onAbout: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplore, onAbout }) => {
  return (
    <section className="relative px-3 sm:px-6 pt-4 pb-10 sm:pb-16 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative bg-[#FFFDF7] rounded-3xl sm:rounded-[36px] border border-[#DED8C5] shadow-xs p-6 sm:p-12 lg:p-16 overflow-hidden">
          
          {/* Subtle Organic Background Accents */}
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 rounded-full bg-[#C7DCAE]/25 blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-64 h-64 rounded-full bg-[#F4C542]/20 blur-2xl pointer-events-none"></div>
          
          {/* Decorative Corner Botanicals */}
          <div className="absolute top-6 left-6 opacity-80 hidden sm:block">
            <LeafIllustration className="w-10 h-10 text-[#6C9A4A]" />
          </div>
          <div className="absolute top-8 right-10 opacity-80 hidden sm:block">
            <FlowerIllustration className="w-12 h-12 text-[#F4C542]" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            
            {/* Stamp Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F8F1DF] border border-[#6C9A4A]/30 text-xs font-bold text-[#405B32] mb-5 sm:mb-6 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#6C9A4A] animate-pulse"></span>
              <span>CHỢ ĐỘC BẢN HỌC SINH — CLB KHỞI NGHIỆP</span>
              <StarSparkle className="w-3.5 h-3.5 text-[#F28C38]" />
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#283124] tracking-tight leading-[1.15] font-heading mb-4 sm:mb-6">
              Những sản phẩm <br className="hidden sm:inline" />
              <span className="text-[#6C9A4A] relative inline-block">
                chỉ có một.
                <svg className="absolute -bottom-1.5 left-0 w-full text-[#F4C542] opacity-80" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 0 100 5" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            {/* Story / Description */}
            <p className="text-sm sm:text-base lg:text-lg text-[#707766] font-medium leading-relaxed max-w-2xl mx-auto mb-8 sm:mb-10">
              Mỗi sản phẩm được CLB tự thiết kế và sản xuất thủ công. Mỗi mẫu chỉ có 
              <strong className="text-[#283124] font-bold"> duy nhất 1 sản phẩm</strong> — khi ai đó đặt mua, món đồ sẽ vĩnh viễn thuộc về họ và không bao giờ tái xuất hiện.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10">
              <button
                onClick={onExplore}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#6C9A4A] hover:bg-[#405B32] text-[#FFFDF7] font-bold text-sm sm:text-base transition-all duration-200 shadow-sm hover:shadow active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Khám phá sản phẩm</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onAbout}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#F8F1DF] hover:bg-[#DED8C5] text-[#283124] font-bold text-sm sm:text-base border border-[#DED8C5] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4 text-[#F28C38]" />
                <span>Tìm hiểu về CLB</span>
              </button>
            </div>

            {/* 3 Core Value Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-6 border-t border-[#DED8C5]/70 text-left">
              
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F8F1DF]/60 border border-[#DED8C5]/50">
                <div className="w-9 h-9 rounded-xl bg-[#6C9A4A]/15 text-[#405B32] flex items-center justify-center shrink-0 font-bold text-sm">
                  1/1
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#283124]">Độc bản 100%</h4>
                  <p className="text-[11px] text-[#707766]">1 sản phẩm = 1 chủ nhân duy nhất.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F8F1DF]/60 border border-[#DED8C5]/50">
                <div className="w-9 h-9 rounded-xl bg-[#F4C542]/20 text-[#8C5D00] flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#283124]">Giao thứ 2 → thứ 6</h4>
                  <p className="text-[11px] text-[#707766]">Tự tính ngày làm việc tiếp theo.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F8F1DF]/60 border border-[#DED8C5]/50">
                <div className="w-9 h-9 rounded-xl bg-[#F28C38]/20 text-[#D06510] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#283124]">Khung giờ rõ ràng</h4>
                  <p className="text-[11px] text-[#707766]">Nhận tại lớp hoặc điểm hẹn CLB.</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

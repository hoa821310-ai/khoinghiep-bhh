import React from 'react';
import { LeafIllustration, FlowerIllustration, StarSparkle } from './BotanicalDecorations';
import { Heart, Sparkles, Scissors, Users, Palette } from 'lucide-react';

export const ClubStory: React.FC = () => {
  return (
    <section className="px-3 sm:px-6 py-10 sm:py-16 max-w-7xl mx-auto">
      <div className="relative bg-[#FFFDF7] rounded-3xl sm:rounded-[40px] border border-[#DED8C5] p-6 sm:p-12 lg:p-16 overflow-hidden shadow-xs">
        
        {/* Background botanical accents */}
        <div className="absolute top-4 left-6 opacity-30 pointer-events-none">
          <LeafIllustration className="w-16 h-16 text-[#6C9A4A]" />
        </div>
        <div className="absolute bottom-6 right-8 opacity-30 pointer-events-none">
          <FlowerIllustration className="w-20 h-20 text-[#F4C542]" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F8F1DF] border border-[#DED8C5] text-xs font-bold text-[#405B32] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#F28C38]" />
            <span>CÂU CHUYỆN KHỞI NGHIỆP HỌC SINH</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#283124] font-heading mb-4 sm:mb-6">
            Mỗi món đồ, một câu chuyện.
          </h2>

          <p className="font-serif-story italic text-base sm:text-xl text-[#6C9A4A] mb-6">
            "Chúng tôi không sản xuất hàng loạt. Mỗi món đồ chỉ xuất hiện một lần."
          </p>

          <div className="text-xs sm:text-sm text-[#707766] leading-relaxed space-y-4 mb-10 text-left sm:text-center max-w-2xl mx-auto">
            <p>
              Tại <strong>CLB Khởi Nghiệp</strong> (THPT Bình Hưng Hoà), mỗi sản phẩm ra đời đều là kết tinh từ niềm đam mê sáng tạo, sự tỉ mỉ trong từng đường nét thủ công và tinh thần học hỏi không ngừng của các bạn học sinh.
            </p>
            <p>
              Chúng mình trân trọng tính cá nhân hóa và sự duy nhất. Vì vậy, mỗi mẫu thiết kế chỉ được sản xuất đúng <strong>1 bản duy nhất</strong>. Khi bạn sở hữu một món đồ từ CLB, bạn chính là chủ nhân duy nhất của tác phẩm ấy.
            </p>
          </div>

          {/* Scrapbook Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            
            <div className="p-4 rounded-2xl bg-[#F8F1DF]/70 border border-[#DED8C5]">
              <div className="w-9 h-9 rounded-xl bg-[#6C9A4A]/20 text-[#405B32] flex items-center justify-center mb-2.5">
                <Scissors className="w-4 h-4" />
              </div>
              <h4 className="font-heading font-bold text-sm text-[#283124] mb-1">
                Tự tay chế tác
              </h4>
              <p className="text-xs text-[#707766]">
                100% được lên ý tưởng, thiết kế và gia công bởi học sinh trong CLB.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F1DF]/70 border border-[#DED8C5]">
              <div className="w-9 h-9 rounded-xl bg-[#F4C542]/30 text-[#8C5D00] flex items-center justify-center mb-2.5">
                <Palette className="w-4 h-4" />
              </div>
              <h4 className="font-heading font-bold text-sm text-[#283124] mb-1">
                Thiết kế độc bản
              </h4>
              <p className="text-xs text-[#707766]">
                Không lặp lại mẫu mã, mỗi sản phẩm mang một phong cách riêng biệt.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F1DF]/70 border border-[#DED8C5]">
              <div className="w-9 h-9 rounded-xl bg-[#F7B7C4]/50 text-[#A03045] flex items-center justify-center mb-2.5">
                <Heart className="w-4 h-4" />
              </div>
              <h4 className="font-heading font-bold text-sm text-[#283124] mb-1">
                Ủng hộ chúng mình
              </h4>
              <p className="text-xs text-[#707766]">
                Doanh thu được dùng để duy trì vật liệu và phát triển các hoạt động của CLB.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

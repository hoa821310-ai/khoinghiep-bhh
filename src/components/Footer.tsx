import React from 'react';
import { LeafIllustration, StarSparkle } from './BotanicalDecorations';
import { Phone, Heart, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatPhoneDisplay } from '../utils/dateUtils';

interface FooterProps {
  onNavClick: (view: string) => void;
  onOpenSellerLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick, onOpenSellerLogin }) => {
  const { sellerContactPhone, currentUser } = useStore();

  return (
    <footer className="mt-16 border-t border-[#DED8C5] bg-[#FFFDF7] pt-12 pb-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#6C9A4A]/15 border border-[#6C9A4A]/30 flex items-center justify-center text-[#405B32]">
                <LeafIllustration className="w-6 h-6" />
              </div>
              <span className="font-heading font-extrabold text-xl text-[#283124]">
                CLB Khởi Nghiệp
              </span>
            </div>

            <p className="font-serif-story italic text-sm text-[#6C9A4A]">
              "Những sản phẩm chỉ có một lần."
            </p>

            <p className="text-xs text-[#707766] max-w-md leading-relaxed">
              Sàn thương mại điện tử dành riêng cho các sản phẩm thủ công, độc bản do học sinh CLB Khởi Nghiệp tự tay thiết kế và sản xuất. Mỗi tác phẩm chỉ có duy nhất 1 chiếc.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#283124] mb-3">
              Liên kết nhanh
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavClick('home')}
                  className="text-[#707766] hover:text-[#6C9A4A] transition-colors cursor-pointer"
                >
                  Trang chủ
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('products')}
                  className="text-[#707766] hover:text-[#6C9A4A] transition-colors cursor-pointer"
                >
                  Sản phẩm độc bản
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('story')}
                  className="text-[#707766] hover:text-[#6C9A4A] transition-colors cursor-pointer"
                >
                  Câu chuyện CLB
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('guide')}
                  className="text-[#707766] hover:text-[#6C9A4A] transition-colors cursor-pointer"
                >
                  Hướng dẫn mua hàng
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Seller Portal */}
          <div>
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#283124] mb-3">
              Liên hệ & Quản trị
            </h4>
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-[#707766]">Hotline CLB:</p>
                <a
                  href={`tel:${sellerContactPhone.replace(/\s+/g, '')}`}
                  className="font-bold text-[#405B32] hover:text-[#6C9A4A] flex items-center gap-1.5 mt-0.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{formatPhoneDisplay(sellerContactPhone)}</span>
                </a>
              </div>

              <div>
                <p className="text-[#707766]">Giờ hoạt động:</p>
                <p className="font-semibold text-[#283124]">Thứ Hai → Thứ Sáu (Giờ học & Giờ ra chơi)</p>
              </div>

              <div className="pt-2 border-t border-[#DED8C5]/60">
                {currentUser?.role === 'SELLER' ? (
                  <button
                    onClick={() => onNavClick('seller-dashboard')}
                    className="text-xs font-bold text-[#405B32] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#6C9A4A]" />
                    <span>Vào Dashboard Ban Quản Trị</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenSellerLogin}
                    className="text-[11px] font-semibold text-[#707766] hover:text-[#283124] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <ShieldCheck className="w-3 h-3 text-[#707766]" />
                    <span>Dành cho Nhà bán hàng CLB</span>
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-[#DED8C5]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#707766]">
          <p>© 2026 CLB Khởi Nghiệp. Bản quyền thuộc về CLB.</p>
          <p className="flex items-center gap-1">
            <span>được phát triển bởi Phạm Thị Thuỳ Dương 11B7 THPT BHH</span>
            <Heart className="w-3.5 h-3.5 text-[#F28C38] fill-[#F28C38]" />
          </p>
        </div>
      </div>
    </footer>
  );
};

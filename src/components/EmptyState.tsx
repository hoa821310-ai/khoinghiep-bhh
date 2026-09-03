import React from 'react';
import { LeafIllustration, FlowerIllustration } from './BotanicalDecorations';
import { ShoppingBag, Package, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  type: 'products' | 'cart' | 'orders' | 'search';
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  isSeller?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  actionText,
  onAction,
  isSeller
}) => {
  let defaultTitle = '';
  let defaultDesc = '';
  let defaultBtn = '';
  let icon = <Sparkles className="w-8 h-8 text-[#6C9A4A]" />;

  switch (type) {
    case 'products':
      defaultTitle = 'Chưa có sản phẩm nào';
      defaultDesc = isSeller
        ? 'Hãy bắt đầu đăng các sản phẩm độc bản 1/1 đầu tiên của CLB để mở bán cho các bạn học sinh.'
        : 'Những sản phẩm độc bản đang được các thành viên CLB chuẩn bị và sẽ sớm mở bán!';
      defaultBtn = isSeller ? '+ Thêm sản phẩm mới' : 'Tìm hiểu về CLB';
      icon = <Package className="w-8 h-8 text-[#6C9A4A]" />;
      break;
    case 'cart':
      defaultTitle = 'Giỏ hàng đang trống';
      defaultDesc = 'Những sản phẩm độc bản đang chờ bạn khám phá.';
      defaultBtn = 'Khám phá sản phẩm';
      icon = <ShoppingBag className="w-8 h-8 text-[#F28C38]" />;
      break;
    case 'orders':
      defaultTitle = 'Bạn chưa có đơn hàng nào';
      defaultDesc = 'Hãy chọn cho mình một món đồ độc bản được làm thủ công bởi các thành viên CLB!';
      defaultBtn = 'Xem sản phẩm độc bản';
      icon = <Package className="w-8 h-8 text-[#6C9A4A]" />;
      break;
    case 'search':
      defaultTitle = 'Không tìm thấy sản phẩm phù hợp';
      defaultDesc = 'Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.';
      defaultBtn = 'Xem tất cả sản phẩm';
      icon = <Sparkles className="w-8 h-8 text-[#F4C542]" />;
      break;
  }

  return (
    <div className="relative py-16 px-6 text-center max-w-lg mx-auto bg-[#FFFDF7] rounded-3xl border border-[#DED8C5] shadow-xs my-8 overflow-hidden">
      {/* Decorative floral accents in corners */}
      <div className="absolute -top-3 -left-3 opacity-60">
        <LeafIllustration className="w-10 h-10 text-[#6C9A4A]" />
      </div>
      <div className="absolute -bottom-3 -right-3 opacity-60">
        <FlowerIllustration className="w-10 h-10 text-[#F4C542]" />
      </div>

      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#F8F1DF] border border-[#DED8C5] mb-4">
        {icon}
      </div>

      <h3 className="text-xl font-bold text-[#283124] mb-2 font-heading">
        {title || defaultTitle}
      </h3>
      <p className="text-sm text-[#707766] max-w-sm mx-auto mb-6 leading-relaxed">
        {description || defaultDesc}
      </p>

      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#6C9A4A] hover:bg-[#405B32] text-[#FFFDF7] font-semibold rounded-2xl transition-all duration-200 shadow-sm hover:shadow active:scale-95 text-sm cursor-pointer"
        >
          {actionText || defaultBtn}
        </button>
      )}
    </div>
  );
};

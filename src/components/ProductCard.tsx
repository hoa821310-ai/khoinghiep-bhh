import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatVND, getNextWorkingDay } from '../utils/dateUtils';
import { getProductSaleState, calculateRemainingTime, formatVietnamTime } from '../utils/timeUtils';
import { StampOneOfOne, SoldOutStamp } from './BotanicalDecorations';
import { ProductBadge } from './Badges';
import { ShoppingBag, Eye, Calendar, Clock, Sparkles, Timer, Edit, Trash2 } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onEdit?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToCart,
  onEdit
}) => {
  const { serverTime: clientLocalTime, currentUser, deleteProduct } = useStore();
  const isSeller = currentUser?.role === 'SELLER';
  const saleState = getProductSaleState(product, clientLocalTime);
  const isSoldOut = saleState === 'SOLD_OUT';
  const isUpcoming = saleState === 'UPCOMING';

  const { dayName } = getNextWorkingDay(new Date());

  const primaryImage = product.imageUrl || (product.images && product.images[0]) || '';
  const displayPeriod = product.deliveryPeriod || (product.deliveryPeriods && product.deliveryPeriods[0]) || 'Ra chơi chiều';

  const countdown = product.openSaleTimestamp
    ? calculateRemainingTime(product.openSaleTimestamp, clientLocalTime)
    : null;

  const openingVnTime = product.openSaleTimestamp
    ? formatVietnamTime(product.openSaleTimestamp)
    : null;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteProduct(product.id);
    setShowDeleteConfirm(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(product);
    }
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className={`group relative bg-[#FFFDF7] rounded-3xl border border-[#DED8C5] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden cursor-pointer ${
        isSoldOut ? 'opacity-90' : 'hover:-translate-y-1'
      }`}
    >
      {/* Product Image Area */}
      <div className="relative aspect-square w-full bg-[#F4EEDC] overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              isSoldOut ? 'grayscale-[50%] opacity-80' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#707766] p-4 text-center">
            <Sparkles className="w-8 h-8 text-[#C7DCAE] mb-2" />
            <span className="text-xs font-semibold">Ảnh sản phẩm thủ công</span>
          </div>
        )}

        {/* 1/1 Stamp on top left */}
        <div className="absolute top-3 left-3 z-10">
          <StampOneOfOne className="scale-90 sm:scale-100 origin-top-left" />
        </div>

        {/* Sold out overlay / Badge on top right */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          {isSoldOut ? (
            <SoldOutStamp />
          ) : (
            <ProductBadge saleState={saleState} />
          )}
          {isSeller && (
            <div className="flex items-center gap-1 bg-[#283124]/85 backdrop-blur-xs p-1 rounded-xl border border-[#DED8C5]/40 shadow-xs">
              <button
                type="button"
                onClick={handleEdit}
                title="Chỉnh sửa sản phẩm"
                className="w-6 h-6 rounded-lg bg-[#FFFDF7] hover:bg-[#F8F1DF] text-[#283124] flex items-center justify-center transition-colors cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5 text-[#6C9A4A]" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                title="Xóa sản phẩm"
                className="w-6 h-6 rounded-lg bg-[#F7B7C4]/50 hover:bg-[#F7B7C4] text-[#A03045] flex items-center justify-center transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Countdown Floating Banner for UPCOMING items */}
        {isUpcoming && countdown && countdown.isUpcoming && (
          <div className="absolute bottom-2 inset-x-2 z-10 bg-[#283124]/95 backdrop-blur-md rounded-2xl py-2 px-3 border border-[#F4C542]/60 shadow-lg text-white space-y-0.5">
            <div className="flex items-center justify-between gap-1 text-[11px]">
              <div className="flex items-center gap-1.5 min-w-0 text-[#F4C542] font-semibold">
                <Timer className="w-3.5 h-3.5 text-[#F4C542] shrink-0 animate-spin" />
                <span className="truncate">
                  Mở bán: <strong>{openingVnTime ? openingVnTime.saleScheduleDisplay : product.openingAt}</strong>
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#C7DCAE] pt-0.5 border-t border-[#405B32]/40">
              <span>Còn lại:</span>
              <span className="font-mono font-extrabold text-xs text-[#F4C542]">
                {countdown.formattedCountdown}
              </span>
            </div>
          </div>
        )}

        {/* Desktop Hover Quick Action */}
        {!isSoldOut && (
          <div className="absolute inset-0 bg-[#283124]/30 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:flex items-center justify-center gap-2 p-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(product);
              }}
              className="px-3.5 py-2 rounded-2xl bg-[#FFFDF7] text-[#283124] text-xs font-bold shadow-sm hover:bg-[#F8F1DF] flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className={`px-3.5 py-2 rounded-2xl text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 ${
                isUpcoming
                  ? 'bg-[#D06510] hover:bg-[#A03045]'
                  : 'bg-[#6C9A4A] hover:bg-[#405B32]'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isUpcoming ? '+ Giỏ' : '+ Giỏ'}</span>
            </button>
            {isSeller && (
              <button
                onClick={handleEdit}
                title="Chỉnh sửa sản phẩm"
                className="p-2 rounded-2xl bg-[#F4C542] hover:bg-[#d4a832] text-[#283124] text-xs font-bold shadow-sm flex items-center justify-center transition-transform active:scale-95"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-3.5 sm:p-4.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title & Price */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-heading font-bold text-sm sm:text-base text-[#283124] line-clamp-1 group-hover:text-[#6C9A4A] transition-colors">
              {product.name}
            </h3>
            <span className="font-heading font-extrabold text-sm sm:text-base text-[#405B32] whitespace-nowrap">
              {formatVND(product.price)}
            </span>
          </div>

          {/* Delivery Details */}
          <div className="space-y-1 text-[11px] sm:text-xs text-[#707766] mb-3">
            <div className="flex items-center gap-1.5 truncate">
              <Calendar className="w-3.5 h-3.5 text-[#6C9A4A] shrink-0" />
              <span>Nhận hàng: <strong className="text-[#283124] font-semibold">{dayName}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Clock className="w-3.5 h-3.5 text-[#F28C38] shrink-0" />
              <span className="truncate">{displayPeriod}</span>
            </div>
          </div>
        </div>

        {/* Action Button for Mobile or Sold Out label */}
        <div className="pt-2 border-t border-[#DED8C5]/50">
          {isSeller ? (
            showDeleteConfirm ? (
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-between gap-1 p-1 bg-[#F7B7C4]/30 rounded-xl border border-[#A03045]/40 animate-fade-in"
              >
                <span className="text-[10px] font-bold text-[#A03045] pl-1 truncate">Xóa vĩnh viễn?</span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-2 py-1 rounded-lg bg-[#A03045] hover:bg-[#802030] text-white text-[10px] font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    Xóa ngay
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(false);
                    }}
                    className="px-1.5 py-1 rounded-lg bg-[#FFFDF7] hover:bg-[#DED8C5] text-[#707766] text-[10px] font-bold transition-all cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleEdit}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-[#F8F1DF] hover:bg-[#DED8C5] text-[#283124] text-[11px] font-bold flex items-center justify-center gap-1 transition-colors border border-[#DED8C5] cursor-pointer"
                >
                  <Edit className="w-3 h-3 text-[#6C9A4A]" />
                  <span>Sửa</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                  }}
                  className="py-1.5 px-2.5 rounded-xl bg-[#F7B7C4]/30 hover:bg-[#F7B7C4] text-[#A03045] text-[11px] font-bold flex items-center justify-center gap-1 transition-colors border border-[#A03045]/20 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Xóa</span>
                </button>
              </div>
            )
          ) : isSoldOut ? (
            <div className="text-center py-1.5 px-2 rounded-xl bg-[#F8F1DF] text-[11px] font-bold text-[#707766]">
              Đã tìm được chủ nhân
            </div>
          ) : isUpcoming ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="sm:hidden w-full py-2 rounded-xl bg-[#F28C38] hover:bg-[#D06510] text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Thêm vào giỏ trước</span>
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="sm:hidden w-full py-2 rounded-xl bg-[#6C9A4A] text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Thêm vào giỏ</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

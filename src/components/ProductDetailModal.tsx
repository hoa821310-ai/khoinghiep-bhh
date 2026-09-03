import React, { useState } from 'react';
import { Product } from '../types';
import { formatVND, getNextWorkingDay, formatPhoneDisplay } from '../utils/dateUtils';
import { useStore } from '../context/StoreContext';
import { getProductSaleState, calculateRemainingTime, formatVietnamTime } from '../utils/timeUtils';
import { StampOneOfOne, SoldOutStamp, LeafIllustration } from './BotanicalDecorations';
import { ProductBadge } from './Badges';
import { X, ShoppingBag, Calendar, Clock, Phone, Heart, Share2, Sparkles, Check, Timer, Lock, ArrowRight, Edit, Trash2 } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
  onEditProduct?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  onEditProduct
}) => {
  const { sellerContactPhone, serverTime, currentUser, deleteProduct } = useStore();
  const isSeller = currentUser?.role === 'SELLER';
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!product) return null;

  const saleState = getProductSaleState(product, serverTime);
  const isSoldOut = saleState === 'SOLD_OUT';
  const isUpcoming = saleState === 'UPCOMING';
  const isAvailable = saleState === 'AVAILABLE';

  const { fullDescription: nextDeliveryDate } = getNextWorkingDay(new Date());

  const countdown = product.openSaleTimestamp
    ? calculateRemainingTime(product.openSaleTimestamp, serverTime)
    : null;

  const openingVnTime = product.openSaleTimestamp
    ? formatVietnamTime(product.openSaleTimestamp)
    : null;

  const handleDelete = () => {
    deleteProduct(product.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleEdit = () => {
    if (onEditProduct) {
      onEditProduct(product);
      onClose();
    }
  };

  const allImages = product.images && product.images.length > 0
    ? product.images
    : product.imageUrl
    ? [product.imageUrl]
    : [];

  const currentImage = allImages[selectedImageIndex] || product.imageUrl || '';
  const deliveryPeriods = product.deliveryPeriods && product.deliveryPeriods.length > 0
    ? product.deliveryPeriods
    : [product.deliveryPeriod || 'Ra chơi sáng'];

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#283124]/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-[#FFFDF7] rounded-3xl sm:rounded-[36px] border border-[#DED8C5] shadow-2xl overflow-hidden my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-[#FFFDF7]/90 hover:bg-[#F8F1DF] border border-[#DED8C5] flex items-center justify-center text-[#283124] transition-colors cursor-pointer shadow-xs"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          
          {/* Left Column: Image Gallery */}
          <div className="bg-[#F4EEDC] p-4 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#DED8C5]">
            <div className="relative aspect-square w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-[#FFFDF7] border border-[#DED8C5] shadow-inner mb-4">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover transition-transform duration-300 ${
                    isSoldOut ? 'grayscale-[40%] opacity-85' : ''
                  }`}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#707766]">
                  <Sparkles className="w-12 h-12 text-[#C7DCAE] mb-2" />
                  <span>Ảnh sản phẩm thủ công</span>
                </div>
              )}

              {/* 1/1 Stamp */}
              <div className="absolute top-3.5 left-3.5">
                <StampOneOfOne />
              </div>

              {/* Status Badge */}
              <div className="absolute top-3.5 right-3.5">
                {isSoldOut ? <SoldOutStamp /> : <ProductBadge saleState={saleState} />}
              </div>
            </div>

            {/* Thumbnail selector (if multiple images) */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      selectedImageIndex === idx
                        ? 'border-[#6C9A4A] ring-2 ring-[#6C9A4A]/30 scale-105'
                        : 'border-[#DED8C5] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Order Logic */}
          <div className="p-5 sm:p-8 flex flex-col justify-between max-h-[85vh] lg:max-h-none overflow-y-auto">
            <div>
              {/* Category & Sale State */}
              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                <span className="text-xs font-bold text-[#6C9A4A] uppercase tracking-wider">
                  {product.category || 'Thủ công mỹ nghệ'}
                </span>
                <span className="text-xs font-semibold text-[#707766]">
                  {product.openSaleTimestamp && openingVnTime
                    ? `Lịch mở bán: ${openingVnTime.saleScheduleDisplay}`
                    : product.openingAt
                    ? `Lịch mở bán: ${product.openingAt}`
                    : 'Đang mở bán'}
                </span>
              </div>

              {/* Product Name */}
              <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#283124] font-heading flex-1">
                  {product.name}
                </h1>
                {isSeller && (
                  showDeleteConfirm ? (
                    <div className="flex items-center gap-2 bg-[#F7B7C4]/30 border border-[#A03045]/40 px-3 py-1.5 rounded-2xl animate-fade-in">
                      <span className="text-xs font-bold text-[#A03045]">Xóa vĩnh viễn?</span>
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="px-2.5 py-1 rounded-xl bg-[#A03045] hover:bg-[#802030] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                      >
                        Xóa ngay
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-2 py-1 rounded-xl bg-[#FFFDF7] hover:bg-[#DED8C5] text-[#707766] text-xs font-bold transition-all cursor-pointer"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleEdit}
                        className="px-3 py-1.5 rounded-xl bg-[#F8F1DF] hover:bg-[#DED8C5] text-[#283124] text-xs font-bold flex items-center gap-1.5 transition-colors border border-[#DED8C5] cursor-pointer shadow-2xs"
                      >
                        <Edit className="w-3.5 h-3.5 text-[#6C9A4A]" />
                        <span>Sửa</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-3 py-1.5 rounded-xl bg-[#F7B7C4]/30 hover:bg-[#F7B7C4] text-[#A03045] text-xs font-bold flex items-center gap-1.5 transition-colors border border-[#A03045]/20 cursor-pointer shadow-2xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  )
                )}
              </div>

              {/* Price Display */}
              <div className="inline-flex items-baseline gap-2 px-4 py-2 rounded-2xl bg-[#F8F1DF] border border-[#DED8C5] mb-5">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#405B32] font-heading">
                  {formatVND(product.price)}
                </span>
                <span className="text-xs font-semibold text-[#707766]">
                  / 1 sản phẩm duy nhất
                </span>
              </div>

              {/* UPCOMING SALE COUNTDOWN CARD */}
              {isUpcoming && countdown && countdown.isUpcoming && (
                <div className="mb-5 p-4 rounded-3xl bg-[#283124] text-white border border-[#F4C542]/60 shadow-lg">
                  <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F4C542] animate-ping"></span>
                      <span className="font-heading font-extrabold text-xs sm:text-sm text-[#F4C542] uppercase tracking-wider">
                        CHƯA ĐẾN GIỜ MỞ BÁN
                      </span>
                    </div>
                    <span className="text-xs text-[#C7DCAE] font-medium">
                      {openingVnTime?.saleReadableDisplay || `Mở bán lúc ${product.openingAt}`}
                    </span>
                  </div>

                  {/* Countdown Digital Timer Box */}
                  <div className="bg-[#1D241A] p-3.5 rounded-2xl border border-[#405B32]/70 flex items-center justify-around text-center mb-3">
                    {countdown.days > 0 && (
                      <>
                        <div>
                          <span className="font-mono font-extrabold text-2xl sm:text-3xl text-[#F4C542] block">
                            {String(countdown.days).padStart(2, '0')}
                          </span>
                          <span className="text-[10px] text-[#F8F1DF]/70 uppercase font-semibold">Ngày</span>
                        </div>
                        <span className="text-xl font-mono text-[#F4C542]/60 font-bold">:</span>
                      </>
                    )}
                    <div>
                      <span className="font-mono font-extrabold text-2xl sm:text-3xl text-[#F4C542] block">
                        {String(countdown.hours).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] text-[#F8F1DF]/70 uppercase font-semibold">Giờ</span>
                    </div>
                    <span className="text-xl font-mono text-[#F4C542]/60 font-bold">:</span>
                    <div>
                      <span className="font-mono font-extrabold text-2xl sm:text-3xl text-[#F4C542] block">
                        {String(countdown.minutes).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] text-[#F8F1DF]/70 uppercase font-semibold">Phút</span>
                    </div>
                    <span className="text-xl font-mono text-[#F4C542]/60 font-bold">:</span>
                    <div>
                      <span className="font-mono font-extrabold text-2xl sm:text-3xl text-[#F4C542] block animate-pulse">
                        {String(countdown.seconds).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] text-[#F8F1DF]/70 uppercase font-semibold">Giây</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#C7DCAE] leading-relaxed">
                    💡 Bạn được phép bấm <strong>"Thêm vào giỏ trước"</strong> ngay lúc này. Khi đúng đến ngày và giờ mở bán (<strong>{openingVnTime ? openingVnTime.saleScheduleDisplay : product.openingAt}</strong>), hệ thống tự động cho phép đặt hàng và checkout!
                  </p>
                </div>
              )}

              {/* AVAILABLE SALE NOTICE */}
              {isAvailable && (
                <div className="mb-5 p-3 rounded-2xl bg-[#C7DCAE]/40 border border-[#6C9A4A]/40 flex items-center gap-2 text-xs font-bold text-[#405B32]">
                  <Check className="w-4 h-4 text-[#6C9A4A]" />
                  <span>Sản phẩm đang mở bán trực tiếp — Đặt hàng ngay trước khi hết!</span>
                </div>
              )}

              {/* Description */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#707766] mb-2">
                  Câu chuyện & Mô tả sản phẩm
                </h4>
                <p className="text-sm text-[#283124] leading-relaxed whitespace-pre-line bg-[#FFFDF7] p-3.5 rounded-2xl border border-[#DED8C5]/60">
                  {product.description || 'Sản phẩm được thiết kế độc quyền và chế tác tỉ mỉ bởi thành viên CLB Khởi Nghiệp.'}
                </p>
              </div>

              {/* Delivery Schedule Section (Key Business Logic) */}
              <div className="mb-6 p-4 rounded-2xl bg-[#F8F1DF]/70 border border-[#DED8C5]">
                <h4 className="text-xs font-bold text-[#283124] flex items-center gap-1.5 mb-2.5">
                  <Calendar className="w-4 h-4 text-[#6C9A4A]" />
                  <span>Lịch giao nhận hàng của CLB (Thứ 2 → Thứ 6)</span>
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#FFFDF7] border border-[#DED8C5]/60">
                    <span className="text-[#707766]">Ngày nhận dự kiến:</span>
                    <strong className="text-[#405B32] font-bold">{nextDeliveryDate}</strong>
                  </div>

                  <div>
                    <span className="text-[#707766] block mb-1.5 font-semibold">
                      Các khung giờ nhận hàng có thể chọn:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {deliveryPeriods.map((period, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFFDF7] border border-[#6C9A4A]/40 text-[#405B32] font-bold text-xs shadow-2xs"
                        >
                          <Clock className="w-3 h-3 text-[#F28C38]" />
                          {period}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Seller / Club Contact Info with tel: link */}
              <div className="mb-6 p-3.5 rounded-2xl bg-[#FFFDF7] border border-[#DED8C5] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#6C9A4A]/20 text-[#405B32] flex items-center justify-center font-bold text-xs">
                    CLB
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#283124]">CLB Khởi Nghiệp</p>
                    <p className="text-[11px] text-[#707766]">Hotline: {formatPhoneDisplay(sellerContactPhone)}</p>
                  </div>
                </div>
                <a
                  href={`tel:${sellerContactPhone.replace(/\s+/g, '')}`}
                  className="px-3 py-1.5 rounded-xl bg-[#6C9A4A]/15 hover:bg-[#6C9A4A]/25 text-[#405B32] text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Gọi cho CLB</span>
                </a>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#DED8C5] space-y-3">
              {isSoldOut ? (
                <div className="w-full text-center p-3 rounded-2xl bg-[#F8F1DF] border border-[#DED8C5]">
                  <p className="text-sm font-bold text-[#283124] mb-1">
                    SẢN PHẨM ĐÃ ĐƯỢC BÁN
                  </p>
                  <p className="text-xs text-[#707766] mb-3">
                    Sản phẩm độc bản này đã tìm được chủ nhân.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-[#6C9A4A] hover:bg-[#405B32] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Khám phá sản phẩm khác
                  </button>
                </div>
              ) : isUpcoming ? (
                /* UPCOMING STATE: Adding to cart is ALLOWED, Checkout button is LOCKED until release */
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onAddToCart(product);
                        onClose();
                      }}
                      className="flex-1 py-3.5 px-6 rounded-2xl bg-[#F28C38] hover:bg-[#D06510] text-[#FFFDF7] font-bold text-sm sm:text-base transition-all duration-200 shadow-sm hover:shadow active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Thêm vào giỏ hàng trước</span>
                    </button>

                    <button
                      onClick={handleShare}
                      className="w-12 h-12 rounded-2xl bg-[#F8F1DF] hover:bg-[#DED8C5] text-[#283124] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      title="Chia sẻ link"
                    >
                      {copied ? <Check className="w-5 h-5 text-[#6C9A4A]" /> : <Share2 className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#F8F1DF] border border-[#DED8C5] flex items-center justify-center gap-2 text-xs text-[#707766] font-semibold text-center">
                    <Lock className="w-3.5 h-3.5 text-[#D06510] shrink-0" />
                    <span>
                      Sản phẩm chưa mở bán – {openingVnTime ? openingVnTime.saleReadableDisplay : `mở bán lúc ${product.openingAt}`}
                    </span>
                  </div>
                </div>
              ) : (
                /* AVAILABLE STATE: Normal buy & add to cart */
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      onAddToCart(product);
                      onClose();
                    }}
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-[#6C9A4A] hover:bg-[#405B32] text-[#FFFDF7] font-bold text-sm sm:text-base transition-all duration-200 shadow-sm hover:shadow active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Thêm vào giỏ hàng</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="w-12 h-12 rounded-2xl bg-[#F8F1DF] hover:bg-[#DED8C5] text-[#283124] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    title="Chia sẻ link"
                  >
                    {copied ? <Check className="w-5 h-5 text-[#6C9A4A]" /> : <Share2 className="w-5 h-5" />}
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

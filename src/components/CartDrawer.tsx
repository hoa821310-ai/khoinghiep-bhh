import React from 'react';
import { useStore } from '../context/StoreContext';
import { formatVND, getNextWorkingDay } from '../utils/dateUtils';
import { getProductSaleState, calculateRemainingTime, formatVietnamTime } from '../utils/timeUtils';
import { X, Trash2, ShoppingBag, ArrowRight, Calendar, Clock, AlertCircle, Timer, Lock } from 'lucide-react';
import { StampOneOfOne } from './BotanicalDecorations';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout
}) => {
  const { cart, removeFromCart, clearCart, serverTime: clientLocalTime } = useStore();
  const { fullDescription: nextDeliveryDate } = getNextWorkingDay(new Date());

  if (!isOpen) return null;

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  // Check if any cart items are UPCOMING
  const upcomingItems = cart.filter(item => {
    return getProductSaleState(item, clientLocalTime) === 'UPCOMING';
  });

  const hasUpcomingItems = upcomingItems.length > 0;
  const earliestUpcoming = upcomingItems.length > 0
    ? upcomingItems.reduce((prev, curr) => (prev.openSaleTimestamp || 0) < (curr.openSaleTimestamp || 0) ? prev : curr)
    : null;

  const earliestCountdown = earliestUpcoming?.openSaleTimestamp
    ? calculateRemainingTime(earliestUpcoming.openSaleTimestamp, clientLocalTime)
    : null;

  const earliestVnTime = earliestUpcoming?.openSaleTimestamp
    ? formatVietnamTime(earliestUpcoming.openSaleTimestamp)
    : null;

  // Group items by delivery period to avoid confusion
  const groupedItems: Record<string, typeof cart> = {};
  cart.forEach(item => {
    const period = item.deliveryPeriod || (item.deliveryPeriods && item.deliveryPeriods[0]) || 'Ra chơi sáng';
    if (!groupedItems[period]) groupedItems[period] = [];
    groupedItems[period].push(item);
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#283124]/50 backdrop-blur-2xs animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FFFDF7] border-l border-[#DED8C5] shadow-2xl flex flex-col justify-between">
          
          {/* Drawer Header */}
          <div className="p-5 sm:p-6 border-b border-[#DED8C5] bg-[#F8F1DF]/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#F28C38]/20 text-[#D06510] flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-lg text-[#283124]">
                  Giỏ hàng của bạn
                </h3>
                <p className="text-xs text-[#707766]">
                  {cart.length} sản phẩm độc bản (1/1)
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#FFFDF7] hover:bg-[#DED8C5] border border-[#DED8C5] flex items-center justify-center text-[#707766] hover:text-[#283124] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-3xl bg-[#F8F1DF] border border-[#DED8C5] flex items-center justify-center mx-auto mb-4 text-[#707766]">
                  <ShoppingBag className="w-8 h-8 text-[#F28C38]" />
                </div>
                <h4 className="font-heading font-bold text-lg text-[#283124] mb-1">
                  Giỏ hàng đang trống
                </h4>
                <p className="text-xs text-[#707766] max-w-xs mx-auto mb-6">
                  "Những sản phẩm độc bản đang chờ bạn khám phá."
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#6C9A4A] hover:bg-[#405B32] text-white font-bold rounded-2xl text-xs transition-colors cursor-pointer"
                >
                  Khám phá sản phẩm
                </button>
              </div>
            ) : (
              <>
                {/* Pre-sale Alert if upcoming items exist */}
                {hasUpcomingItems && earliestCountdown && (
                  <div className="p-3.5 bg-[#283124] text-white border border-[#F4C542]/60 rounded-2xl space-y-2 shadow-sm">
                    <div className="flex items-center justify-between text-xs flex-wrap gap-1">
                      <span className="font-bold text-[#F4C542] flex items-center gap-1.5">
                        <Timer className="w-4 h-4 text-[#F4C542] animate-spin" />
                        Chờ mở bán: {earliestVnTime?.saleScheduleDisplay || earliestUpcoming?.openingAt}
                      </span>
                      <span className="font-mono font-extrabold text-[#F4C542] bg-[#1D241A] px-2 py-0.5 rounded-lg border border-[#405B32]/60">
                        {earliestCountdown.formattedCountdown}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#C7DCAE] leading-relaxed">
                      Sản phẩm trong giỏ chưa đến lịch mở bán thực tế ({earliestVnTime?.saleReadableDisplay || earliestUpcoming?.openingAt}). Nút Đặt hàng sẽ tự động kích hoạt ngay khi đồng hồ về 00:00:00!
                    </p>
                  </div>
                )}

                {/* 1/1 Policy Notice */}
                <div className="p-3 bg-[#F4C542]/15 border border-[#F4C542]/30 rounded-2xl flex items-start gap-2 text-xs text-[#8C5D00]">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Lưu ý độc bản:</strong> Thêm vào giỏ không giữ hàng. Sản phẩm chỉ thuộc về bạn khi đặt hàng thành công.
                  </span>
                </div>

                {/* Grouped items by delivery period */}
                {Object.entries(groupedItems).map(([period, items]) => (
                  <div key={period} className="space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#405B32] px-1">
                      <Clock className="w-3.5 h-3.5 text-[#F28C38]" />
                      <span>Nhận {nextDeliveryDate} — {period}</span>
                    </div>

                    {items.map(item => {
                      const itemSaleState = getProductSaleState(item, clientLocalTime);
                      const isItemUpcoming = itemSaleState === 'UPCOMING';
                      const itemCountdown = item.openSaleTimestamp
                        ? calculateRemainingTime(item.openSaleTimestamp, clientLocalTime)
                        : null;
                      const itemVnTime = item.openSaleTimestamp
                        ? formatVietnamTime(item.openSaleTimestamp)
                        : null;

                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 bg-[#F8F1DF]/50 border border-[#DED8C5] rounded-2xl relative"
                        >
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#FFFDF7] border border-[#DED8C5] shrink-0">
                            <img
                              src={item.imageUrl || (item.images && item.images[0]) || ''}
                              alt={item.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#C7DCAE]/60 text-[#405B32]">
                                1 of 1
                              </span>
                              {isItemUpcoming && itemCountdown && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#F4C542]/30 text-[#8C5D00] border border-[#F4C542]/40">
                                  ⏳ Chờ mở bán ({itemVnTime?.saleScheduleDisplay || item.openingAt} – Còn {itemCountdown.formattedCountdown})
                                </span>
                              )}
                              <h4 className="font-heading font-bold text-xs sm:text-sm text-[#283124] truncate w-full">
                                {item.name}
                              </h4>
                            </div>
                            <p className="font-heading font-extrabold text-sm text-[#405B32]">
                              {formatVND(item.price)}
                            </p>
                            <p className="text-[10px] text-[#707766]">
                              Số lượng: 1 (Độc bản)
                            </p>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-8 h-8 rounded-xl bg-[#FFFDF7] hover:bg-[#F7B7C4]/30 border border-[#DED8C5] flex items-center justify-center text-[#707766] hover:text-[#A03045] transition-colors cursor-pointer shrink-0"
                            title="Xóa khỏi giỏ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Drawer Footer / Checkout CTA */}
          {cart.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-[#DED8C5] bg-[#FFFDF7] space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#707766] font-semibold">Tổng cộng:</span>
                <span className="font-heading font-extrabold text-xl text-[#405B32]">
                  {formatVND(total)}
                </span>
              </div>

              {hasUpcomingItems && earliestCountdown ? (
                <div className="space-y-2">
                  <div className="w-full py-3 px-4 rounded-2xl bg-[#DED8C5] text-[#707766] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                    <Lock className="w-4 h-4 text-[#D06510]" />
                    <span>Chưa đến giờ mở bán ({earliestCountdown.formattedCountdown})</span>
                  </div>
                  <p className="text-[11px] text-center text-[#707766]">
                    Nút tiến hành đặt hàng sẽ mở tự động khi hết đếm ngược
                  </p>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={clearCart}
                    className="px-3 py-3 rounded-2xl bg-[#F8F1DF] hover:bg-[#DED8C5] text-xs font-bold text-[#707766] transition-colors cursor-pointer"
                  >
                    Xóa giỏ
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onProceedToCheckout();
                    }}
                    className="flex-1 py-3.5 px-4 rounded-2xl bg-[#6C9A4A] hover:bg-[#405B32] text-white font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <span>Tiến hành đặt hàng</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

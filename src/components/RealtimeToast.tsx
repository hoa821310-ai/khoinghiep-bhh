import React, { useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Bell, CheckCircle2, Clock, MapPin, X, ArrowRight, ShoppingBag } from 'lucide-react';
import { formatVND } from '../utils/dateUtils';

interface RealtimeToastProps {
  onNavigateToView?: (view: string) => void;
}

export const RealtimeToast: React.FC<RealtimeToastProps> = ({ onNavigateToView }) => {
  const { realtimeNotification, dismissRealtimeNotification, currentUser } = useStore();

  useEffect(() => {
    if (!realtimeNotification) return;

    // Auto-dismiss after 8 seconds
    const timer = setTimeout(() => {
      dismissRealtimeNotification();
    }, 8000);

    return () => clearTimeout(timer);
  }, [realtimeNotification, dismissRealtimeNotification]);

  if (!realtimeNotification) return null;

  const { type, title, message, details, timestamp } = realtimeNotification;
  const isSeller = currentUser?.role === 'SELLER';

  return (
    <aside
      id="realtime-toast-banner"
      aria-label="Thông báo thời gian thực"
      className="fixed bottom-5 right-4 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-full animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-[#FFFDF7] rounded-3xl border-2 border-[#6C9A4A] shadow-2xl p-4 sm:p-5 text-[#283124] relative overflow-hidden backdrop-blur-md">
        
        {/* Decorative Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#6C9A4A] via-[#F4C542] to-[#F28C38]" />

        {/* Close Button */}
        <button
          onClick={dismissRealtimeNotification}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#F8F1DF] hover:bg-[#DED8C5] text-[#707766] hover:text-[#283124] flex items-center justify-center transition-colors cursor-pointer"
          title="Đóng thông báo"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5 pr-6">
          {/* Icon Badge */}
          <div className="w-11 h-11 rounded-2xl bg-[#6C9A4A] text-white flex items-center justify-center shrink-0 shadow-xs animate-bounce">
            <Bell className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#6C9A4A]/20 text-[#405B32] border border-[#6C9A4A]/30">
                REALTIME ⚡
              </span>
              <span className="text-[11px] text-[#707766] font-semibold">
                {new Date(timestamp).toLocaleTimeString('vi-VN')}
              </span>
            </div>

            <h4 className="font-heading font-extrabold text-sm sm:text-base text-[#283124] leading-snug">
              {title}
            </h4>

            <p className="text-xs text-[#525B44] mt-0.5">
              {message}
            </p>

            {/* Additional Order Details if available */}
            {details && (
              <div className="mt-3 p-3 bg-[#F8F1DF]/70 rounded-2xl border border-[#DED8C5] text-xs space-y-1.5">
                {details.customerName && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#707766]">Người đặt:</span>
                    <span className="font-bold text-[#283124]">
                      {details.customerName} {details.className ? `(${details.className})` : ''}
                    </span>
                  </div>
                )}

                {details.productNames && details.productNames.length > 0 && (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[#707766] shrink-0">Sản phẩm:</span>
                    <span className="font-bold text-[#405B32] text-right truncate">
                      {details.productNames.join(', ')}
                    </span>
                  </div>
                )}

                {details.pickupLocation && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#707766] shrink-0">Nơi nhận:</span>
                    <span className="font-semibold text-[#283124] truncate">
                      📍 {details.pickupLocation}
                    </span>
                  </div>
                )}

                {details.total !== undefined && (
                  <div className="flex items-center justify-between pt-1 border-t border-[#DED8C5]/60 font-bold">
                    <span className="text-[#707766]">Tổng giá trị:</span>
                    <span className="text-[#405B32] font-heading font-extrabold text-sm">
                      {formatVND(details.total)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Quick Action Buttons */}
            <div className="mt-3 flex items-center gap-2">
              {isSeller ? (
                <button
                  onClick={() => {
                    dismissRealtimeNotification();
                    if (onNavigateToView) onNavigateToView('seller-dashboard');
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#6C9A4A] hover:bg-[#405B32] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <span>Mở Quản lý đơn hàng</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    dismissRealtimeNotification();
                    if (onNavigateToView) onNavigateToView('orders');
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#6C9A4A] hover:bg-[#405B32] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Xem Đơn hàng của tôi</span>
                </button>
              )}

              <button
                onClick={dismissRealtimeNotification}
                className="py-2 px-3 rounded-xl bg-[#F8F1DF] hover:bg-[#DED8C5] text-[#707766] font-bold text-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

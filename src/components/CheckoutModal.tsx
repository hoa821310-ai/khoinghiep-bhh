import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { PickupMethod, Order } from '../types';
import { formatVND, getNextWorkingDay, isValidPhoneNumber, formatPhoneDisplay } from '../utils/dateUtils';
import { getProductSaleState, calculateRemainingTime, formatVietnamTime } from '../utils/timeUtils';
import { X, CheckCircle2, AlertCircle, MapPin, Building, GraduationCap, Phone, User as UserIcon, Calendar, Clock, ShoppingBag, ArrowRight, ArrowLeft, Timer, Lock } from 'lucide-react';
import { LeafIllustration, FlowerIllustration } from './BotanicalDecorations';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess
}) => {
  const { currentUser, cart, createOrder, serverTime, clientLocalTime } = useStore();
  const currentTime = serverTime || clientLocalTime || Date.now();
  const { fullDescription: nextDeliveryDate } = getNextWorkingDay(new Date());

  // Steps: 'FORM' | 'REVIEW' | 'SUCCESS'
  const [step, setStep] = useState<'FORM' | 'REVIEW' | 'SUCCESS'>('FORM');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Form states
  const [buyerName, setBuyerName] = useState('');
  const [buyerClass, setBuyerClass] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [pickupMethod, setPickupMethod] = useState<PickupMethod>('CLASS');
  const [pickupClass, setPickupClass] = useState('');
  const [pickupOtherLocation, setPickupOtherLocation] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check upcoming items
  const upcomingInCart = cart.filter(item => getProductSaleState(item, currentTime) === 'UPCOMING');
  const hasUpcoming = upcomingInCart.length > 0;
  const earliestUpcoming = upcomingInCart.length > 0
    ? upcomingInCart.reduce((prev, curr) => (Number(prev.openSaleTimestamp) || 0) < (Number(curr.openSaleTimestamp) || 0) ? prev : curr)
    : null;
  const earliestCountdown = earliestUpcoming?.openSaleTimestamp
    ? calculateRemainingTime(Number(earliestUpcoming.openSaleTimestamp), currentTime)
    : null;
  const earliestVnTime = earliestUpcoming?.openSaleTimestamp
    ? formatVietnamTime(Number(earliestUpcoming.openSaleTimestamp))
    : null;

  // Initialize with current user data
  useEffect(() => {
    if (currentUser) {
      setBuyerName(currentUser.name || '');
      setBuyerClass(currentUser.className || '');
      setBuyerPhone(currentUser.phoneNumber || '');
      setPickupClass(currentUser.className || '');
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const getFinalPickupLocation = () => {
    if (pickupMethod === 'CLASS') {
      return `Lớp ${pickupClass.trim()}`;
    }
    return pickupOtherLocation.trim();
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!buyerName.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên người nhận.');
      return;
    }
    if (!buyerClass.trim()) {
      setErrorMessage('Vui lòng nhập lớp của bạn.');
      return;
    }
    if (!buyerPhone.trim()) {
      setErrorMessage('Vui lòng nhập số điện thoại.');
      return;
    }
    if (!isValidPhoneNumber(buyerPhone)) {
      setErrorMessage('Vui lòng nhập số điện thoại hợp lệ (10 chữ số, ví dụ: 0901234567).');
      return;
    }

    if (pickupMethod === 'CLASS' && !pickupClass.trim()) {
      setErrorMessage('Vui lòng nhập rõ Lớp nhận hàng (ví dụ: 10A1).');
      return;
    }
    if (pickupMethod === 'OTHER' && !pickupOtherLocation.trim()) {
      setErrorMessage('Vui lòng nhập rõ địa điểm nhận hàng cụ thể (ví dụ: Căn tin, Phòng Thư viện, Cổng trường).');
      return;
    }

    setStep('REVIEW');
  };

  const handleConfirmOrder = async () => {
    if (hasUpcoming && earliestCountdown) {
      setErrorMessage(`Sản phẩm "${earliestUpcoming?.name}" chưa đến lịch mở bán (${earliestVnTime ? earliestVnTime.saleScheduleDisplay : earliestUpcoming?.openingAt}).`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const finalLocation = getFinalPickupLocation();

    try {
      const res = await createOrder({
        pickupMethod,
        pickupLocation: finalLocation,
        orderNotes,
        overrideName: buyerName,
        overrideClass: buyerClass,
        overridePhone: buyerPhone
      });

      setIsSubmitting(false);

      if (res.success && res.order) {
        setConfirmedOrder(res.order);
        setStep('SUCCESS');
        onOrderSuccess(res.order);
      } else {
        setErrorMessage(res.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
        setStep('FORM');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Có lỗi xảy ra khi tạo đơn hàng.');
      setStep('FORM');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#283124]/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#FFFDF7] rounded-3xl sm:rounded-[36px] border border-[#DED8C5] shadow-2xl overflow-hidden my-auto p-6 sm:p-8">
        
        {/* Close Button */}
        {step !== 'SUCCESS' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#F8F1DF] hover:bg-[#DED8C5] border border-[#DED8C5] flex items-center justify-center text-[#707766] hover:text-[#283124] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* ================= STEP 1: FORM ================= */}
        {step === 'FORM' && (
          <div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C7DCAE]/60 text-[#405B32] text-xs font-bold mb-2">
                <span>Bước 1/2 — Thông tin nhận hàng</span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#283124] font-heading">
                Xác nhận thông tin đặt hàng
              </h2>
              <p className="text-xs text-[#707766]">
                CLB sẽ giao hàng trực tiếp đến bạn theo thông tin dưới đây.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3.5 bg-[#F7B7C4]/30 border border-[#F7B7C4] rounded-2xl flex items-center gap-2 text-xs text-[#A03045] font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleProceedToReview} className="space-y-4">
              
              {/* Buyer Contact Group */}
              <div className="p-4 rounded-2xl bg-[#F8F1DF]/60 border border-[#DED8C5] space-y-3">
                <h4 className="text-xs font-bold text-[#405B32] uppercase tracking-wider flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>1. Thông tin người mua</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#283124] mb-1">
                      Họ và tên <span className="text-[#A03045]">*</span>
                    </label>
                    <input
                      type="text"
                      value={buyerName}
                      onChange={e => setBuyerName(e.target.value)}
                      required
                      placeholder="Nguyễn Văn A"
                      className="w-full px-3.5 py-2.5 bg-[#FFFDF7] border border-[#DED8C5] rounded-xl text-xs sm:text-sm text-[#283124] focus:outline-none focus:border-[#6C9A4A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#283124] mb-1">
                      Lớp <span className="text-[#A03045]">*</span>
                    </label>
                    <input
                      type="text"
                      value={buyerClass}
                      onChange={e => setBuyerClass(e.target.value)}
                      required
                      placeholder="10A1"
                      className="w-full px-3.5 py-2.5 bg-[#FFFDF7] border border-[#DED8C5] rounded-xl text-xs sm:text-sm text-[#283124] focus:outline-none focus:border-[#6C9A4A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#283124] mb-1">
                    Số điện thoại nhận hàng <span className="text-[#A03045]">*</span>
                  </label>
                  <input
                    type="tel"
                    value={buyerPhone}
                    onChange={e => setBuyerPhone(e.target.value.replace(/[^\d\s]/g, ''))}
                    required
                    placeholder="09xxxxxxxx"
                    className="w-full px-3.5 py-2.5 bg-[#FFFDF7] border border-[#DED8C5] rounded-xl text-xs sm:text-sm text-[#283124] focus:outline-none focus:border-[#6C9A4A]"
                  />
                  <p className="text-[10px] text-[#707766] mt-1">
                    Số điện thoại này sẽ được lưu cố định trong đơn hàng để CLB liên hệ khi giao hàng.
                  </p>
                </div>
              </div>

              {/* Pickup Location Group */}
              <div className="p-4 rounded-2xl bg-[#F8F1DF]/60 border border-[#DED8C5] space-y-3">
                <h4 className="text-xs font-bold text-[#405B32] uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>2. Bắt buộc chọn nơi nhận hàng</span>
                </h4>

                {/* Pickup Method Radios */}
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`p-3 rounded-2xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      pickupMethod === 'CLASS'
                        ? 'bg-[#FFFDF7] border-[#6C9A4A] ring-2 ring-[#6C9A4A]/20'
                        : 'bg-[#FFFDF7]/60 border-[#DED8C5] opacity-75'
                    }`}
                  >
                    <input
                      type="radio"
                      name="pickupMethod"
                      checked={pickupMethod === 'CLASS'}
                      onChange={() => setPickupMethod('CLASS')}
                      className="text-[#6C9A4A] focus:ring-0"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#283124] block">Nhận tại lớp</span>
                      <span className="text-[10px] text-[#707766]">Giao tận phòng học</span>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-2xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      pickupMethod === 'OTHER'
                        ? 'bg-[#FFFDF7] border-[#6C9A4A] ring-2 ring-[#6C9A4A]/20'
                        : 'bg-[#FFFDF7]/60 border-[#DED8C5] opacity-75'
                    }`}
                  >
                    <input
                      type="radio"
                      name="pickupMethod"
                      checked={pickupMethod === 'OTHER'}
                      onChange={() => setPickupMethod('OTHER')}
                      className="text-[#6C9A4A] focus:ring-0"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#283124] block">Địa điểm khác</span>
                      <span className="text-[10px] text-[#707766]">Căn tin, Thư viện, Cổng...</span>
                    </div>
                  </label>
                </div>

                {/* Dynamic Input based on Pickup Method */}
                {pickupMethod === 'CLASS' ? (
                  <div>
                    <label className="block text-xs font-bold text-[#283124] mb-1">
                      Lớp nhận hàng cụ thể <span className="text-[#A03045]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 10A1 (Dãy nhà B, Tầng 2)"
                      value={pickupClass}
                      onChange={e => setPickupClass(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-[#FFFDF7] border border-[#DED8C5] rounded-xl text-xs sm:text-sm text-[#283124] focus:outline-none focus:border-[#6C9A4A]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-[#283124] mb-1">
                      Địa điểm nhận hàng cụ thể <span className="text-[#A03045]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Bàn 3 Căn tin, Phòng Thư viện, Cổng số 1, Phòng CLB..."
                      value={pickupOtherLocation}
                      onChange={e => setPickupOtherLocation(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-[#FFFDF7] border border-[#DED8C5] rounded-xl text-xs sm:text-sm text-[#283124] focus:outline-none focus:border-[#6C9A4A]"
                    />
                  </div>
                )}
              </div>

              {/* Order Notes */}
              <div>
                <label className="block text-xs font-bold text-[#283124] mb-1">
                  Ghi chú cho đơn hàng (không bắt buộc)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Giao vào giờ ra chơi chiều; Gọi cho tôi trước khi đến..."
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#F8F1DF] border border-[#DED8C5] rounded-2xl text-xs sm:text-sm text-[#283124] placeholder-[#707766]/70 focus:outline-none focus:border-[#6C9A4A]"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-2xl bg-[#F8F1DF] hover:bg-[#DED8C5] text-xs font-bold text-[#283124] transition-colors cursor-pointer"
                >
                  Quay lại giỏ hàng
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-[#6C9A4A] hover:bg-[#405B32] text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>Kiểm tra & Xem tóm tắt đơn</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          </div>
        )}

        {/* ================= STEP 2: REVIEW ================= */}
        {step === 'REVIEW' && (
          <div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4C542]/30 text-[#8C5D00] text-xs font-bold mb-2">
                <span>Bước 2/2 — Kiểm tra lại thông tin</span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#283124] font-heading">
                Tóm tắt đơn hàng trước khi đặt
              </h2>
              <p className="text-xs text-[#707766]">
                Vui lòng rà soát lại thông tin chính xác để CLB chuẩn bị giao hàng chu đáo.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3.5 bg-[#F7B7C4]/30 border border-[#F7B7C4] rounded-2xl flex items-center gap-2 text-xs text-[#A03045] font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-4 mb-6">
              
              {/* Customer summary */}
              <div className="p-4 rounded-2xl bg-[#F8F1DF]/70 border border-[#DED8C5] space-y-2 text-xs">
                <div className="flex justify-between border-b border-[#DED8C5]/60 pb-2">
                  <span className="text-[#707766]">Người nhận:</span>
                  <span className="font-bold text-[#283124]">{buyerName} — Lớp {buyerClass}</span>
                </div>
                <div className="flex justify-between border-b border-[#DED8C5]/60 pb-2">
                  <span className="text-[#707766]">Số điện thoại liên hệ:</span>
                  <span className="font-bold text-[#405B32]">{formatPhoneDisplay(buyerPhone)}</span>
                </div>
                <div className="flex justify-between border-b border-[#DED8C5]/60 pb-2">
                  <span className="text-[#707766]">Nơi nhận hàng:</span>
                  <span className="font-bold text-[#283124]">{getFinalPickupLocation()}</span>
                </div>
                {orderNotes && (
                  <div className="flex justify-between border-b border-[#DED8C5]/60 pb-2">
                    <span className="text-[#707766]">Ghi chú:</span>
                    <span className="font-semibold text-[#283124] italic">"{orderNotes}"</span>
                  </div>
                )}
                <div className="flex justify-between pt-1">
                  <span className="text-[#707766]">Ngày giao dự kiến:</span>
                  <span className="font-extrabold text-[#6C9A4A]">{nextDeliveryDate}</span>
                </div>
              </div>

              {/* Items summary */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {cart.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#FFFDF7] border border-[#DED8C5]"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imageUrl || (item.images && item.images[0]) || ''}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover border border-[#DED8C5]"
                      />
                      <div>
                        <h4 className="font-heading font-bold text-xs sm:text-sm text-[#283124]">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-[#707766]">
                          Khung giờ: {item.deliveryPeriod || (item.deliveryPeriods && item.deliveryPeriods[0]) || 'Ra chơi sáng'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-heading font-extrabold text-sm text-[#405B32]">
                        {formatVND(item.price)}
                      </span>
                      <p className="text-[10px] text-[#707766]">1 bản duy nhất</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total summary */}
              <div className="p-4 rounded-2xl bg-[#283124] text-white flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#C7DCAE]">Tổng thanh toán khi nhận hàng:</span>
                  <p className="text-[10px] text-[#FFFDF7]/70">Thanh toán trực tiếp cho thành viên CLB</p>
                </div>
                <span className="font-heading font-extrabold text-xl sm:text-2xl text-[#F4C542]">
                  {formatVND(total)}
                </span>
              </div>

            </div>

            {/* Confirmation actions */}
            {hasUpcoming && earliestCountdown ? (
              <div className="space-y-2">
                <div className="p-3.5 rounded-2xl bg-[#283124] text-white border border-[#F4C542]/60 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-[#F4C542] animate-spin" />
                    <span className="text-xs text-[#C7DCAE]">
                      Chờ mở bán ({earliestVnTime?.saleScheduleDisplay || earliestUpcoming?.openingAt}):
                    </span>
                  </div>
                  <span className="font-mono font-bold text-sm text-[#F4C542] bg-[#1D241A] px-2 py-0.5 rounded-lg border border-[#405B32]/60">
                    {earliestCountdown.formattedCountdown}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('FORM')}
                    className="px-5 py-3.5 rounded-2xl bg-[#F8F1DF] hover:bg-[#DED8C5] text-xs font-bold text-[#283124] transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Quay lại</span>
                  </button>
                  <button
                    type="button"
                    disabled={true}
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-[#DED8C5] text-[#707766] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <Lock className="w-4 h-4 text-[#D06510]" />
                    <span>Chưa đến lịch mở bán ({earliestCountdown.formattedCountdown})</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep('FORM')}
                  className="px-5 py-3.5 rounded-2xl bg-[#F8F1DF] hover:bg-[#DED8C5] text-xs font-bold text-[#283124] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Chỉnh sửa lại</span>
                </button>
                <button
                  type="button"
                  onClick={handleConfirmOrder}
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-[#6C9A4A] hover:bg-[#405B32] text-white font-bold text-sm sm:text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{isSubmitting ? 'Đang tạo đơn...' : 'Xác nhận đặt hàng ngay'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 3: SUCCESS ================= */}
        {step === 'SUCCESS' && confirmedOrder && (
          <div className="text-center py-4 sm:py-6 animate-in zoom-in-95">
            
            <div className="w-16 h-16 rounded-full bg-[#C7DCAE]/60 text-[#405B32] flex items-center justify-center mx-auto mb-4 border-2 border-[#6C9A4A]">
              <CheckCircle2 className="w-10 h-10 text-[#6C9A4A]" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#283124] font-heading mb-2">
              Đặt hàng thành công!
            </h2>
            <p className="text-xs sm:text-sm text-[#707766] max-w-md mx-auto mb-6 leading-relaxed">
              Cảm ơn bạn <strong className="text-[#283124]">{confirmedOrder.customerName}</strong>! Sản phẩm độc bản đã được khóa riêng cho bạn và chuyển sang trạng thái <strong>SOLD OUT</strong>.
            </p>

            {/* Order receipt details */}
            <div className="text-left bg-[#F8F1DF]/70 border border-[#DED8C5] rounded-3xl p-4 sm:p-6 mb-6 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 border-b border-[#DED8C5]/60 pb-2.5">
                <div>
                  <span className="text-[#707766] block">Người nhận:</span>
                  <strong className="text-[#283124] font-bold">{confirmedOrder.customerName} ({confirmedOrder.className})</strong>
                </div>
                <div>
                  <span className="text-[#707766] block">Số điện thoại:</span>
                  <strong className="text-[#405B32] font-bold">{formatPhoneDisplay(confirmedOrder.customerPhone)}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-b border-[#DED8C5]/60 pb-2.5">
                <div>
                  <span className="text-[#707766] block">Địa điểm nhận hàng:</span>
                  <strong className="text-[#283124] font-bold">{confirmedOrder.pickupLocation}</strong>
                </div>
                <div>
                  <span className="text-[#707766] block">Ngày nhận dự kiến:</span>
                  <strong className="text-[#6C9A4A] font-bold">{confirmedOrder.expectedDeliveryDate}</strong>
                </div>
              </div>

              {confirmedOrder.orderNotes && (
                <div className="border-b border-[#DED8C5]/60 pb-2.5">
                  <span className="text-[#707766] block">Ghi chú:</span>
                  <span className="text-[#283124] italic">"{confirmedOrder.orderNotes}"</span>
                </div>
              )}

              {/* Items in receipt */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[#707766] block font-semibold">Sản phẩm đã đặt:</span>
                {confirmedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1">
                    <span>• {item.productName} ({item.deliveryPeriod})</span>
                    <strong className="text-[#405B32]">{formatVND(item.price)}</strong>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-[#DED8C5] text-sm">
                <span className="font-bold text-[#283124]">Tổng tiền thanh toán:</span>
                <span className="font-heading font-extrabold text-[#405B32] text-lg">
                  {formatVND(confirmedOrder.total)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                setStep('FORM');
              }}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#6C9A4A] hover:bg-[#405B32] text-white font-bold rounded-2xl text-sm transition-all shadow-xs cursor-pointer active:scale-95"
            >
              Xem đơn hàng trong tài khoản của bạn
            </button>

          </div>
        )}

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { AlertTriangle, Trash2, CheckCircle2, ShieldAlert, X, Loader2, RefreshCw } from 'lucide-react';

interface ResetTestDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ResetTestDataModal: React.FC<ResetTestDataModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { products, orders, resetTestData, currentUser } = useStore();
  const [confirmInput, setConfirmInput] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resetResult, setResetResult] = useState<{
    deletedProducts: number;
    deletedOrders: number;
  } | null>(null);

  if (!isOpen) return null;

  const isSeller = currentUser?.role === 'SELLER';
  const CONFIRM_PHRASE = 'RESET TEST';
  const isMatch = confirmInput.trim().toUpperCase() === CONFIRM_PHRASE;

  const handleReset = async () => {
    if (!isMatch || !isSeller || isResetting) return;

    setIsResetting(true);
    setErrorMsg('');

    try {
      const res = await resetTestData();
      if (res.success) {
        setResetResult({
          deletedProducts: res.deletedProducts,
          deletedOrders: res.deletedOrders
        });
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.message || 'Không thể reset dữ liệu.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi hệ thống khi reset dữ liệu.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleClose = () => {
    if (isResetting) return;
    setConfirmInput('');
    setErrorMsg('');
    setResetResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#283124]/70 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#FFFDF7] rounded-3xl sm:rounded-[32px] border border-[#DED8C5] shadow-2xl overflow-hidden my-auto p-6 sm:p-8">
        
        {/* Close Button */}
        {!isResetting && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#F8F1DF] hover:bg-[#DED8C5] border border-[#DED8C5] flex items-center justify-center text-[#707766] hover:text-[#283124] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {resetResult ? (
          /* ================= SUCCESS STATE ================= */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#6C9A4A]/20 border border-[#6C9A4A]/40 text-[#405B32] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-[#6C9A4A]" />
            </div>

            <div>
              <h3 className="font-heading font-extrabold text-2xl text-[#283124] mb-1">
                Reset dữ liệu thành công!
              </h3>
              <p className="text-xs text-[#707766] max-w-sm mx-auto">
                Toàn bộ dữ liệu giao dịch giai đoạn test đã được xóa sạch khỏi cơ sở dữ liệu Firestore.
              </p>
            </div>

            <div className="p-4 bg-[#F8F1DF]/70 rounded-2xl border border-[#DED8C5] text-left text-xs space-y-2">
              <div className="flex justify-between items-center text-[#283124]">
                <span>📦 Sản phẩm đã xóa:</span>
                <strong className="font-bold text-[#A03045]">{resetResult.deletedProducts} sản phẩm</strong>
              </div>
              <div className="flex justify-between items-center text-[#283124]">
                <span>🛍️ Đơn hàng đã xóa:</span>
                <strong className="font-bold text-[#A03045]">{resetResult.deletedOrders} đơn hàng</strong>
              </div>
              <div className="flex justify-between items-center text-[#283124] pt-2 border-t border-[#DED8C5]">
                <span>👤 Tài khoản người dùng:</span>
                <strong className="font-bold text-[#405B32]">Được giữ nguyên</strong>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3 bg-[#6C9A4A] hover:bg-[#405B32] text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
            >
              Hoàn tất & Đóng
            </button>
          </div>
        ) : (
          /* ================= CONFIRMATION FORM ================= */
          <div className="space-y-4">
            
            {/* Header / Badge */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#A03045]/15 border border-[#A03045]/30 text-[#A03045] flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 text-[#A03045]" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#A03045]/15 text-[#A03045] border border-[#A03045]/30">
                  CHỨC NĂNG DÀNH RIÊNG CHO NGƯỜI BÁN
                </span>
                <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-[#283124] mt-0.5">
                  RESET TOÀN BỘ DỮ LIỆU TEST
                </h3>
              </div>
            </div>

            {/* MANDATORY WARNING BOX */}
            <div className="p-4 bg-[#A03045]/10 border border-[#A03045]/30 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-[#A03045] font-bold text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>CẢNH BÁO QUAN TRỌNG:</span>
              </div>
              <p className="text-xs text-[#802030] leading-relaxed font-semibold">
                CẢNH BÁO: Thao tác này sẽ xóa toàn bộ sản phẩm, đơn hàng, lịch sử đơn hàng và dữ liệu giao dịch hiện tại. Tài khoản người mua và người bán sẽ được giữ lại. Thao tác này không thể hoàn tác.
              </p>
            </div>

            {/* Current Data Summary */}
            <div className="p-3.5 bg-[#F8F1DF]/70 rounded-2xl border border-[#DED8C5] text-xs space-y-1.5">
              <p className="font-bold text-[#283124]">Dữ liệu sẽ bị xóa vĩnh viễn khỏi Firestore:</p>
              <ul className="list-disc list-inside text-[#707766] space-y-0.5 pl-1">
                <li><strong className="text-[#283124]">{products.length} sản phẩm</strong> (cả đang mở bán & đã bán)</li>
                <li><strong className="text-[#283124]">{orders.length} đơn hàng</strong> và lịch sử giao dịch</li>
                <li>Giỏ hàng và thông báo trạng thái</li>
              </ul>
              <div className="pt-2 border-t border-[#DED8C5] text-[11px] text-[#405B32] font-semibold">
                ✓ Giữ lại: Tất cả tài khoản đăng nhập (học sinh / người bán) & cấu hình Hotline.
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-[#F7B7C4]/30 border border-[#A03045]/40 rounded-2xl text-xs text-[#A03045] font-bold">
                {errorMsg}
              </div>
            )}

            {/* Confirm phrase input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#283124]">
                Nhập chữ <span className="font-mono text-[#A03045] font-extrabold bg-[#A03045]/10 px-1.5 py-0.5 rounded border border-[#A03045]/30">RESET TEST</span> để xác nhận:
              </label>
              <input
                type="text"
                disabled={isResetting}
                value={confirmInput}
                onChange={e => setConfirmInput(e.target.value)}
                placeholder="Nhập RESET TEST..."
                className="w-full px-3.5 py-2.5 bg-[#F8F1DF] border border-[#DED8C5] rounded-xl text-xs sm:text-sm text-[#283124] font-mono focus:outline-none focus:border-[#A03045]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={isResetting}
                onClick={handleClose}
                className="flex-1 py-3 rounded-2xl bg-[#F8F1DF] hover:bg-[#DED8C5] text-xs sm:text-sm font-bold text-[#707766] transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={!isMatch || isResetting}
                onClick={handleReset}
                className={`flex-1 py-3 rounded-2xl text-xs sm:text-sm font-bold text-white transition-all shadow-xs flex items-center justify-center gap-2 ${
                  isMatch && !isResetting
                    ? 'bg-[#A03045] hover:bg-[#802030] cursor-pointer active:scale-98'
                    : 'bg-[#DED8C5] text-[#707766] cursor-not-allowed opacity-70'
                }`}
              >
                {isResetting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xóa Firestore...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Xác nhận Reset sạch</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

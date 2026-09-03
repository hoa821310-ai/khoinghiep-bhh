import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { isValidPhoneNumber } from '../utils/dateUtils';
import { X, Lock, Mail, User as UserIcon, Phone, GraduationCap, ShieldCheck, HelpCircle, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { LeafIllustration, FlowerIllustration } from './BotanicalDecorations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'buyer-login' | 'buyer-register' | 'seller-login';
  customNotice?: string; // e.g. "Vui lòng đăng ký hoặc đăng nhập trước khi đặt hàng."
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'buyer-login',
  customNotice,
  onSuccess
}) => {
  const { loginBuyer, registerBuyer, verifySellerStep1, verifySellerStep2 } = useStore();

  // Active Tab: 'BUYER' or 'SELLER'
  const [accountType, setAccountType] = useState<'BUYER' | 'SELLER'>(
    initialMode === 'seller-login' ? 'SELLER' : 'BUYER'
  );

  // Buyer sub-mode: 'login' | 'register'
  const [buyerMode, setBuyerMode] = useState<'login' | 'register'>(
    initialMode === 'buyer-register' ? 'register' : 'login'
  );

  // Seller 2-step verification state
  const [sellerStep, setSellerStep] = useState<1 | 2>(1);
  const [sellerEmail, setSellerEmail] = useState('');
  const [sellerPassword, setSellerPassword] = useState('');
  const [sellerSecurityAnswer, setSellerSecurityAnswer] = useState('');

  // Buyer Form fields
  const [buyerName, setBuyerName] = useState('');
  const [buyerClass, setBuyerClass] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPassword, setBuyerPassword] = useState('');
  const [showBuyerPassword, setShowBuyerPassword] = useState(false);
  const [showSellerPassword, setShowSellerPassword] = useState(false);

  // Error & Status message
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setSellerStep(1);
    setSellerEmail('');
    setSellerPassword('');
    setSellerSecurityAnswer('');
  };

  const handleBuyerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (buyerMode === 'login') {
      if (!buyerEmail || !buyerPassword) {
        setErrorMessage('Vui lòng nhập đầy đủ Email và Mật khẩu.');
        return;
      }
      const res = await loginBuyer(buyerEmail, buyerPassword);
      if (res.success) {
        setSuccessMessage('Đăng nhập thành công!');
        setTimeout(() => {
          onClose();
          onSuccess?.();
          resetForm();
        }, 600);
      } else {
        setErrorMessage(res.message || 'Đăng nhập không thành công.');
      }
    } else {
      // Register validation
      if (!buyerName.trim()) {
        setErrorMessage('Vui lòng nhập Họ và tên.');
        return;
      }
      if (!buyerClass.trim()) {
        setErrorMessage('Vui lòng nhập Lớp học.');
        return;
      }
      if (!buyerPhone.trim()) {
        setErrorMessage('Vui lòng nhập Số điện thoại.');
        return;
      }
      if (!isValidPhoneNumber(buyerPhone)) {
        setErrorMessage('Vui lòng nhập số điện thoại hợp lệ (10 chữ số, ví dụ 0901234567).');
        return;
      }
      if (!buyerEmail.trim() || !buyerPassword) {
        setErrorMessage('Vui lòng nhập đầy đủ Email và Mật khẩu.');
        return;
      }
      if (buyerPassword.length < 6) {
        setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự.');
        return;
      }

      const res = await registerBuyer({
        name: buyerName,
        className: buyerClass,
        phoneNumber: buyerPhone,
        email: buyerEmail,
        password: buyerPassword
      });

      if (res.success) {
        setSuccessMessage('Đăng ký tài khoản thành công! Đang đăng nhập...');
        setTimeout(() => {
          onClose();
          onSuccess?.();
          resetForm();
        }, 800);
      } else {
        setErrorMessage(res.message || 'Đăng ký không thành công.');
      }
    }
  };

  const handleSellerStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!sellerEmail || !sellerPassword) {
      setErrorMessage('Vui lòng nhập email và mật khẩu nhà bán hàng.');
      return;
    }

    const res = verifySellerStep1(sellerEmail, sellerPassword);
    if (res.success) {
      // Proceed to Step 2
      setSellerStep(2);
      setErrorMessage('');
    } else {
      setErrorMessage(res.message || 'Đăng nhập không thành công. Thông tin không chính xác.');
    }
  };

  const handleSellerStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!sellerSecurityAnswer.trim()) {
      setErrorMessage('Vui lòng nhập câu trả lời xác thực.');
      return;
    }

    const res = verifySellerStep2(sellerSecurityAnswer);
    if (res.success) {
      setSuccessMessage('Xác thực 2 lớp thành công! Đang chuyển đến Dashboard CLB...');
      setTimeout(() => {
        onClose();
        onSuccess?.();
        resetForm();
      }, 700);
    } else {
      setErrorMessage(res.message || 'Câu trả lời xác thực không chính xác.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#283124]/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#FFFDF7] rounded-3xl border border-[#DED8C5] shadow-2xl overflow-hidden p-6 sm:p-8">
        
        {/* Decorative corner leaves */}
        <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-30 pointer-events-none">
          <LeafIllustration className="w-16 h-16 text-[#6C9A4A]" />
        </div>
        <div className="absolute bottom-0 left-0 -ml-4 -mb-4 opacity-30 pointer-events-none">
          <FlowerIllustration className="w-16 h-16 text-[#F4C542]" />
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            onClose();
            resetForm();
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#F8F1DF] hover:bg-[#DED8C5] flex items-center justify-center text-[#707766] hover:text-[#283124] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Custom Notice Banner (if triggered by checkout/order action) */}
        {customNotice && (
          <div className="mb-5 p-3.5 bg-[#F28C38]/15 border border-[#F28C38]/30 rounded-2xl flex items-start gap-2.5 text-xs text-[#D06510] font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{customNotice}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#283124] font-heading">
            {accountType === 'BUYER'
              ? buyerMode === 'login'
                ? 'Đăng nhập Người mua'
                : 'Đăng ký tài khoản'
              : 'Xác thực Nhà bán hàng'}
          </h2>
          <p className="text-xs text-[#707766] mt-1">
            {accountType === 'BUYER'
              ? 'Dành cho học sinh tham gia mua sắm các sản phẩm độc bản của CLB'
              : 'Dành riêng cho Ban Quản trị CLB Khởi Nghiệp (Chỉ 1 tài khoản chủ)'}
          </p>
        </div>

        {/* Role Segmented Selector */}
        <div className="flex bg-[#F8F1DF] p-1 rounded-2xl border border-[#DED8C5] mb-6">
          <button
            type="button"
            onClick={() => {
              setAccountType('BUYER');
              resetForm();
            }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              accountType === 'BUYER'
                ? 'bg-[#6C9A4A] text-white shadow-xs'
                : 'text-[#707766] hover:text-[#283124]'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Người mua / Học sinh</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAccountType('SELLER');
              resetForm();
            }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              accountType === 'SELLER'
                ? 'bg-[#405B32] text-white shadow-xs'
                : 'text-[#707766] hover:text-[#283124]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Nhà bán hàng (CLB)</span>
          </button>
        </div>

        {/* Error / Success Feedback */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-[#F7B7C4]/30 border border-[#F7B7C4] rounded-2xl flex items-center gap-2 text-xs text-[#A03045] font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-[#C7DCAE]/50 border border-[#6C9A4A]/50 rounded-2xl flex items-center gap-2 text-xs text-[#405B32] font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ----------------- BUYER FLOW ----------------- */}
        {accountType === 'BUYER' && (
          <div>
            {/* Login / Register Toggle for Buyer */}
            <div className="flex justify-center gap-6 mb-4 text-xs border-b border-[#DED8C5]/60 pb-2">
              <button
                type="button"
                onClick={() => {
                  setBuyerMode('login');
                  setErrorMessage('');
                }}
                className={`font-bold transition-colors pb-1 cursor-pointer ${
                  buyerMode === 'login'
                    ? 'text-[#6C9A4A] border-b-2 border-[#6C9A4A]'
                    : 'text-[#707766] hover:text-[#283124]'
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => {
                  setBuyerMode('register');
                  setErrorMessage('');
                }}
                className={`font-bold transition-colors pb-1 cursor-pointer ${
                  buyerMode === 'register'
                    ? 'text-[#6C9A4A] border-b-2 border-[#6C9A4A]'
                    : 'text-[#707766] hover:text-[#283124]'
                }`}
              >
                Đăng ký tài khoản mới
              </button>
            </div>

            <form onSubmit={handleBuyerSubmit} className="space-y-3.5">
              {buyerMode === 'register' && (
                <>
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-[#283124] mb-1">
                      Họ và tên <span className="text-[#A03045]">*</span>
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-[#707766] absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Ví dụ: Nguyễn Văn A"
                        value={buyerName}
                        onChange={e => setBuyerName(e.target.value)}
                        required
                        className="w-full pl-9 pr-3 py-2.5 bg-[#F8F1DF] border border-[#DED8C5] rounded-2xl text-xs sm:text-sm text-[#283124] placeholder-[#707766]/70 focus:outline-none focus:border-[#6C9A4A]"
                      />
                    </div>
                  </div>

                  {/* Class */}
                  <div>
                    <label className="block text-xs font-bold text-[#283124] mb-1">
                      Lớp học <span className="text-[#A03045]">*</span>
                    </label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 text-[#707766] absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Ví dụ: 10C1, 11B1, 12A1..."
                        value={buyerClass}
                        onChange={e => setBuyerClass(e.target.value)}
                        required
                        className="w-full pl-9 pr-3 py-2.5 bg-[#F8F1DF] border border-[#DED8C5] rounded-2xl text-xs sm:text-sm text-[#283124] placeholder-[#707766]/70 focus:outline-none focus:border-[#6C9A4A]"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-[#283124] mb-1">
                      Số điện thoại <span className="text-[#A03045]">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#707766] absolute left-3 top-3" />
                      <input
                        type="tel"
                        placeholder="09xxxxxxxx"
                        value={buyerPhone}
                        onChange={e => setBuyerPhone(e.target.value.replace(/[^\d\s]/g, ''))}
                        required
                        className="w-full pl-9 pr-3 py-2.5 bg-[#F8F1DF] border border-[#DED8C5] rounded-2xl text-xs sm:text-sm text-[#283124] placeholder-[#707766]/70 focus:outline-none focus:border-[#6C9A4A]"
                      />
                    </div>
                    <p className="text-[10px] text-[#707766] mt-0.5">
                      Dùng để CLB liên hệ khi giao nhận hàng
                    </p>
                  </div>
                </>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-[#283124] mb-1">
                  Email <span className="text-[#A03045]">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#707766] absolute left-3 top-3" />
                  <input
                    type="email"
                    placeholder="email@vidu.com"
                    value={buyerEmail}
                    onChange={e => setBuyerEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-[#F8F1DF] border border-[#DED8C5] rounded-2xl text-xs sm:text-sm text-[#283124] placeholder-[#707766]/70 focus:outline-none focus:border-[#6C9A4A]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-[#283124] mb-1">
                  Mật khẩu <span className="text-[#A03045]">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#707766] absolute left-3 top-3" />
                  <input
                    type={showBuyerPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={buyerPassword}
                    onChange={e => setBuyerPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-10 py-2.5 bg-[#F8F1DF] border border-[#DED8C5] rounded-2xl text-xs sm:text-sm text-[#283124] placeholder-[#707766]/70 focus:outline-none focus:border-[#6C9A4A]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowBuyerPassword(!showBuyerPassword)}
                    className="absolute right-3 top-2.5 text-[#707766] hover:text-[#283124] transition-colors focus:outline-none"
                  >
                    {showBuyerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-2 bg-[#6C9A4A] hover:bg-[#405B32] text-white font-bold rounded-2xl text-sm transition-all shadow-xs active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{buyerMode === 'login' ? 'Đăng nhập ngay' : 'Tạo tài khoản người mua'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ----------------- SELLER 2-LAYER AUTH FLOW ----------------- */}
        {accountType === 'SELLER' && (
          <div>
            <div className="mb-4 p-3 bg-[#F8F1DF] border border-[#DED8C5] rounded-2xl text-xs text-[#707766]">
              <div className="flex items-center gap-2 font-bold text-[#405B32] mb-1">
                <ShieldCheck className="w-4 h-4 text-[#6C9A4A]" />
                <span>Xác thực 2 lớp bảo mật Ban Quản Trị</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Tài khoản nhà bán hàng được thiết lập cố định cho CLB Khởi Nghiệp. Không cho phép đăng ký mới.
              </p>
            </div>

            {/* Step 1: Email & Password */}
            {sellerStep === 1 && (
              <form onSubmit={handleSellerStep1Submit} className="space-y-3.5">
                <div className="text-xs font-bold text-[#405B32] flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded-full bg-[#6C9A4A] text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Lớp 1 — Email & Mật khẩu CLB</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#283124] mb-1">
                    Email Nhà bán hàng
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#707766] absolute left-3 top-3" />
                    <input
                      type="email"
                      value={sellerEmail}
                      onChange={e => setSellerEmail(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-[#F8F1DF] border border-[#DED8C5] rounded-2xl text-xs sm:text-sm text-[#283124] focus:outline-none focus:border-[#405B32]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#283124] mb-1">
                    Mật khẩu Lớp 1
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#707766] absolute left-3 top-3" />
                    <input
                      type={showSellerPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      value={sellerPassword}
                      onChange={e => setSellerPassword(e.target.value)}
                      required
                      className="w-full pl-9 pr-10 py-2.5 bg-[#F8F1DF] border border-[#DED8C5] rounded-2xl text-xs sm:text-sm text-[#283124] focus:outline-none focus:border-[#405B32]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSellerPassword(!showSellerPassword)}
                      className="absolute right-3 top-2.5 text-[#707766] hover:text-[#283124] transition-colors focus:outline-none"
                    >
                      {showSellerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 mt-3 bg-[#405B32] hover:bg-[#283124] text-white font-bold rounded-2xl text-sm transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Tiếp tục sang Lớp 2</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Step 2: Secret Question */}
            {sellerStep === 2 && (
              <form onSubmit={handleSellerStep2Submit} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div className="text-xs font-bold text-[#405B32] flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded-full bg-[#6C9A4A] text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Lớp 2 — Câu hỏi xác thực nội bộ CLB</span>
                </div>

                <div className="p-3.5 bg-[#F4C542]/20 border border-[#F4C542]/40 rounded-2xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#8C5D00] mb-1">
                    <HelpCircle className="w-4 h-4" />
                    <span>Câu hỏi bảo mật:</span>
                  </div>
                  <p className="text-sm font-extrabold text-[#283124] font-heading">
                    “Ngọc Hân thích ăn gì?”
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#283124] mb-1">
                    Nhập câu trả lời chính xác <span className="text-[#A03045]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập câu trả lời..."
                    value={sellerSecurityAnswer}
                    onChange={e => setSellerSecurityAnswer(e.target.value)}
                    required
                    autoFocus
                    className="w-full px-3.5 py-2.5 bg-[#F8F1DF] border border-[#DED8C5] rounded-2xl text-xs sm:text-sm text-[#283124] focus:outline-none focus:border-[#405B32]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSellerStep(1);
                      setErrorMessage('');
                    }}
                    className="w-1/3 py-2.5 bg-[#F8F1DF] hover:bg-[#DED8C5] text-[#283124] font-bold rounded-2xl text-xs transition-colors cursor-pointer"
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2.5 bg-[#405B32] hover:bg-[#283124] text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Xác thực & Vào Dashboard</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

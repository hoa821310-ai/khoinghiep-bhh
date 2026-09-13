import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, Search, User as UserIcon, Menu, X, Sparkles, LogOut, Package, ShieldCheck, ChevronDown, Clock, CheckCircle2, Radio } from 'lucide-react';
import { LeafIllustration } from './BotanicalDecorations';
import { formatVietnamTime } from '../utils/timeUtils';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  openAuthModal: () => void;
  openCartDrawer: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  openAuthModal,
  openCartDrawer,
  searchQuery,
  setSearchQuery
}) => {
  const { currentUser, cart, logout, serverTime: clientLocalTime, isTimeSynced, realtimeStatus, orders } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const vnTime = formatVietnamTime(clientLocalTime);

  const pendingOrdersCount = orders.filter(o => o.status === 'PENDING').length;

  const navLinks = [
    { id: 'home', label: 'Trang chủ' },
    { id: 'products', label: 'Sản phẩm' },
    { id: 'story', label: 'Câu chuyện CLB' },
    { id: 'guide', label: 'Hướng dẫn' },
    ...(currentUser ? [{ id: 'orders', label: 'Lịch sử mua hàng' }] : [])
  ];

  const handleNavClick = (viewId: string) => {
    setCurrentView(viewId);
    setMobileMenuOpen(false);
    setShowUserDropdown(false);
  };

  return (
    <header className="sticky top-0 z-40 px-3 sm:px-6 pt-2 pb-2 transition-all space-y-1.5">
      
      {/* Top Synchronized Time & Realtime Status Bar (GMT+7 Asia/Ho_Chi_Minh) */}
      <div className="max-w-7xl mx-auto bg-[#283124] text-[#F8F1DF] text-[11px] sm:text-xs py-1 px-4 rounded-xl sm:rounded-2xl flex items-center justify-between shadow-xs border border-[#405B32]/40">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#6C9A4A] animate-pulse"></span>
          <span className="font-semibold text-[#C7DCAE] hidden xs:inline">
            Giờ hệ thống mở bán (GMT+7):
          </span>
          <span className="font-mono font-bold text-[#F4C542] tracking-wider text-xs sm:text-sm">
            {vnTime.timeStr}
          </span>
          <span className="text-[#FFFDF7]/70 hidden sm:inline">
            • {vnTime.dayOfWeekStr}, {vnTime.dateStr}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Realtime Live Indicator */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
              realtimeStatus === 'connected'
                ? 'bg-[#405B32]/80 text-[#C7DCAE] border-[#6C9A4A]/50'
                : 'bg-[#8C5D00]/60 text-[#F4C542] border-[#F4C542]/40'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                realtimeStatus === 'connected' ? 'bg-[#6C9A4A] animate-ping' : 'bg-[#F4C542]'
              }`}
            />
            <span>{realtimeStatus === 'connected' ? 'REALTIME LIVE' : 'Đang kết nối lại...'}</span>
          </span>

          <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#405B32]/60 text-[#C7DCAE] text-[10px] font-medium border border-[#6C9A4A]/30">
            <Clock className="w-3 h-3 text-[#6C9A4A]" />
            <span>Đồng bộ máy chủ</span>
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto bg-[#FFFDF7]/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-[#DED8C5] shadow-xs px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
        
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#6C9A4A]/15 border border-[#6C9A4A]/30 flex items-center justify-center text-[#405B32] group-hover:bg-[#6C9A4A] group-hover:text-white transition-colors duration-200">
            <LeafIllustration className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-extrabold text-lg sm:text-xl text-[#283124] tracking-tight">
                CLB Khởi Nghiệp
              </span>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F4C542]/30 text-[#8C5D00] border border-[#F4C542]/50">
                1/1 MARKET
              </span>
            </div>
            <p className="text-[11px] text-[#707766] hidden md:block font-medium">
              Mỗi sản phẩm là một bản duy nhất
            </p>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#F8F1DF]/70 px-3 py-1.5 rounded-full border border-[#DED8C5]/60">
          {navLinks.map(link => {
            const isActive = currentView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#6C9A4A] text-[#FFFDF7] shadow-xs'
                    : 'text-[#283124] hover:text-[#405B32] hover:bg-[#FFFDF7]'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions (Search, Cart, User) */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Search Toggle / Input */}
          <div className="relative">
            {showSearchInput ? (
              <div className="flex items-center bg-[#F8F1DF] border border-[#DED8C5] rounded-full px-3 py-1.5 w-44 sm:w-60 shadow-xs">
                <Search className="w-4 h-4 text-[#707766] mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Tìm sản phẩm..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                  className="bg-transparent text-xs sm:text-sm text-[#283124] placeholder-[#707766] outline-none w-full"
                />
                <button
                  onClick={() => {
                    setShowSearchInput(false);
                    setSearchQuery('');
                  }}
                  className="text-[#707766] hover:text-[#283124] text-xs font-bold px-1"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setShowSearchInput(true);
                  if (currentView !== 'products') setCurrentView('products');
                }}
                className="w-10 h-10 rounded-2xl bg-[#F8F1DF] hover:bg-[#C7DCAE]/40 border border-[#DED8C5] flex items-center justify-center text-[#283124] transition-colors cursor-pointer"
                title="Tìm kiếm"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Cart Button */}
          <button
            onClick={openCartDrawer}
            className="relative w-10 h-10 rounded-2xl bg-[#F8F1DF] hover:bg-[#C7DCAE]/40 border border-[#DED8C5] flex items-center justify-center text-[#283124] transition-colors cursor-pointer"
            title="Giỏ hàng"
          >
            <ShoppingBag className="w-4 h-4" />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#F28C38] text-white text-[11px] font-bold flex items-center justify-center border-2 border-[#FFFDF7] shadow-xs">
                {cart.length}
              </span>
            )}
          </button>

          {/* User Account / Login */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-2xl bg-[#C7DCAE]/30 hover:bg-[#C7DCAE]/60 border border-[#6C9A4A]/30 text-[#283124] text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-xl bg-[#6C9A4A] text-white flex items-center justify-center text-xs font-bold">
                  {currentUser.role === 'SELLER' ? (
                    <ShieldCheck className="w-4 h-4" />
                  ) : (
                    currentUser.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="hidden sm:inline-block max-w-[110px] truncate text-left">
                  Xin chào, {currentUser.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#707766]" />
              </button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-[#FFFDF7] rounded-2xl border border-[#DED8C5] shadow-lg py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-[#DED8C5]/60 mb-1">
                    <p className="text-xs text-[#707766]">Đang đăng nhập với tư cách</p>
                    <p className="text-sm font-bold text-[#283124] truncate">{currentUser.name}</p>
                    <span className={`inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-bold ${
                      currentUser.role === 'SELLER'
                        ? 'bg-[#F28C38]/20 text-[#D06510]'
                        : 'bg-[#6C9A4A]/20 text-[#405B32]'
                    }`}>
                      {currentUser.role === 'SELLER' ? '👑 Chủ CLB (Nhà bán hàng)' : `🎓 Học sinh ${currentUser.className || ''}`}
                    </span>
                  </div>

                  {currentUser.role === 'SELLER' && (
                    <button
                      onClick={() => handleNavClick('seller-dashboard')}
                      className="w-full px-4 py-2 text-left text-xs sm:text-sm font-bold text-[#405B32] hover:bg-[#C7DCAE]/30 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#6C9A4A]" />
                        <span>Dashboard Nhà bán hàng</span>
                      </div>
                      {pendingOrdersCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-[#F28C38] text-white text-[10px] font-extrabold animate-pulse">
                          {pendingOrdersCount} mới
                        </span>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => handleNavClick('orders')}
                    className="w-full px-4 py-2 text-left text-xs sm:text-sm font-semibold text-[#283124] hover:bg-[#F8F1DF] flex items-center gap-2 cursor-pointer"
                  >
                    <Package className="w-4 h-4 text-[#707766]" />
                    {currentUser.role === 'SELLER' ? 'Tất cả đơn hàng CLB' : 'Đơn hàng của tôi'}
                  </button>

                  <button
                    onClick={() => handleNavClick('profile')}
                    className="w-full px-4 py-2 text-left text-xs sm:text-sm font-semibold text-[#283124] hover:bg-[#F8F1DF] flex items-center gap-2 cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 text-[#707766]" />
                    Thông tin cá nhân
                  </button>

                  <div className="my-1 border-t border-[#DED8C5]/60"></div>

                  <button
                    onClick={() => {
                      logout();
                      setShowUserDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs sm:text-sm font-semibold text-[#C53030] hover:bg-[#F7B7C4]/30 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="px-3.5 sm:px-4 py-2 rounded-2xl bg-[#6C9A4A] hover:bg-[#405B32] text-[#FFFDF7] text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <UserIcon className="w-4 h-4" />
              <span>Đăng nhập</span>
            </button>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 rounded-2xl bg-[#F8F1DF] hover:bg-[#C7DCAE]/40 border border-[#DED8C5] flex items-center justify-center text-[#283124] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-3 top-20 bg-[#FFFDF7] rounded-3xl border border-[#DED8C5] shadow-2xl p-5 z-50 animate-in fade-in slide-in-from-top-4">
          <div className="flex flex-col gap-2">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full text-left px-4 py-3 rounded-2xl font-bold text-sm transition-colors cursor-pointer flex items-center justify-between ${
                  currentView === link.id
                    ? 'bg-[#6C9A4A] text-white'
                    : 'text-[#283124] hover:bg-[#F8F1DF]'
                }`}
              >
                <span>{link.label}</span>
                {currentView === link.id && <Sparkles className="w-4 h-4" />}
              </button>
            ))}

            {currentUser?.role === 'SELLER' && (
              <button
                onClick={() => handleNavClick('seller-dashboard')}
                className="w-full text-left px-4 py-3 rounded-2xl font-bold text-sm bg-[#F28C38]/15 text-[#D06510] hover:bg-[#F28C38]/25 transition-colors cursor-pointer flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Dashboard Nhà bán hàng CLB</span>
              </button>
            )}

            <div className="pt-2 mt-2 border-t border-[#DED8C5]">
              {currentUser ? (
                <div className="flex items-center justify-between px-2 pt-2">
                  <div>
                    <p className="text-xs text-[#707766]">Đã đăng nhập:</p>
                    <p className="text-sm font-bold text-[#283124]">{currentUser.name}</p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#F7B7C4]/30 text-[#A03045] text-xs font-bold cursor-pointer"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal();
                  }}
                  className="w-full py-3 rounded-2xl bg-[#6C9A4A] text-white font-bold text-sm text-center shadow-xs cursor-pointer"
                >
                  Đăng nhập / Đăng ký
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

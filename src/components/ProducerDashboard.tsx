import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Order, OrderStatus } from '../types';
import { formatVND, formatPhoneDisplay } from '../utils/dateUtils';
import { getProductSaleState, calculateRemainingTime, formatVietnamTime } from '../utils/timeUtils';
import { OrderStatusBadge, ProductBadge } from './Badges';
import { StampOneOfOne } from './BotanicalDecorations';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  History,
  Phone,
  Plus,
  Search,
  Edit,
  Trash2,
  PhoneCall,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck,
  Filter,
  DollarSign,
  Timer
} from 'lucide-react';
import { EmptyState } from './EmptyState';

interface ProducerDashboardProps {
  onOpenAddProductModal: () => void;
  onEditProduct: (product: Product) => void;
}

export const ProducerDashboard: React.FC<ProducerDashboardProps> = ({
  onOpenAddProductModal,
  onEditProduct
}) => {
  const {
    products,
    orders,
    currentUser,
    deleteProduct,
    updateOrderStatus,
    hotline,
    updateHotline,
    clientLocalTime,
    realtimeStatus
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'history' | 'settings'>('overview');
  const [buyerSearchQuery, setBuyerSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');

  // Seller phone edit
  const [phoneInput, setPhoneInput] = useState(hotline);
  const [phoneSuccess, setPhoneSuccess] = useState('');
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Sync phoneInput whenever hotline changes
  useEffect(() => {
    if (hotline) {
      setPhoneInput(hotline);
    }
  }, [hotline]);

  // Protect route
  if (!currentUser || currentUser.role !== 'SELLER') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="p-8 bg-[#FFFDF7] rounded-3xl border border-[#DED8C5] max-w-md mx-auto">
          <ShieldCheck className="w-12 h-12 text-[#A03045] mx-auto mb-3" />
          <h3 className="font-heading font-bold text-xl text-[#283124] mb-2">
            Khu vực Quản trị CLB Khởi Nghiệp
          </h3>
          <p className="text-xs text-[#707766] mb-4">
            Trang này chỉ dành riêng cho tài khoản Nhà bán hàng chính thức của CLB Khởi Nghiệp.
          </p>
        </div>
      </div>
    );
  }

  // KPIs
  const availableProducts = products.filter(p => p && p.status === 'AVAILABLE');
  const soldProducts = products.filter(p => p && (p.status === 'SOLD_OUT' || p.status === 'HIDDEN'));
  const pendingOrders = orders.filter(o => o && (o.status === 'PENDING' || o.status === 'PREPARING'));
  const totalRevenue = orders
    .filter(o => o && o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  // Orders filtered by Buyer Name and Status
  const filteredOrders = orders.filter(order => {
    if (!order) return false;
    if (buyerSearchQuery.trim()) {
      const q = buyerSearchQuery.toLowerCase().trim();
      const matchName = (order.customerName || '').toLowerCase().includes(q);
      const matchClass = (order.className || '').toLowerCase().includes(q);
      const matchPhone = (order.customerPhone || '').includes(q);
      if (!matchName && !matchClass && !matchPhone) return false;
    }
    if (orderStatusFilter !== 'ALL') {
      return order.status === orderStatusFilter;
    }
    return true;
  });

  const handleUpdatePhone = (e: React.FormEvent) => {
    e.preventDefault();
    updateHotline(phoneInput);
    setPhoneSuccess('Đã cập nhật số điện thoại liên hệ của CLB!');
    setTimeout(() => setPhoneSuccess(''), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
      
      {/* Top Header */}
      <div className="bg-[#FFFDF7] rounded-3xl border border-[#DED8C5] p-5 sm:p-8 shadow-xs mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#F28C38]/20 text-[#D06510] border border-[#F28C38]/40">
              👑 BAN QUẢN TRỊ CLB
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                realtimeStatus === 'connected'
                  ? 'bg-[#6C9A4A]/20 text-[#405B32] border-[#6C9A4A]/40'
                  : 'bg-[#F4C542]/20 text-[#8C5D00] border-[#F4C542]/40'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  realtimeStatus === 'connected' ? 'bg-[#6C9A4A] animate-ping' : 'bg-[#F4C542]'
                }`}
              />
              <span>{realtimeStatus === 'connected' ? 'Realtime Live (Tự động nhận đơn mới)' : 'Đang kết nối lại...'}</span>
            </span>
            <span className="text-xs text-[#707766]">
              Hotline CLB: <strong>{formatPhoneDisplay(hotline)}</strong>
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#283124]">
            Dashboard Nhà bán hàng CLB Khởi Nghiệp
          </h1>
        </div>

        <button
          onClick={onOpenAddProductModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#6C9A4A] hover:bg-[#405B32] text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Đăng sản phẩm độc bản mới</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-[#F8F1DF] p-1.5 rounded-2xl sm:rounded-3xl border border-[#DED8C5] mb-6 sm:mb-8 overflow-x-auto scrollbar-none no-scrollbar">
        {[
          { id: 'overview', label: 'Tổng quan', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'products', label: `Sản phẩm (${products.length})`, icon: <Package className="w-4 h-4" /> },
          { id: 'orders', label: `Đơn hàng (${orders.length})`, icon: <ShoppingBag className="w-4 h-4" /> },
          { id: 'history', label: `Đã bán / Sold Out (${soldProducts.length})`, icon: <History className="w-4 h-4" /> },
          { id: 'settings', label: 'Cấu hình CLB', icon: <Phone className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#6C9A4A] text-white shadow-xs'
                : 'text-[#707766] hover:text-[#283124] hover:bg-[#FFFDF7]/60'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ================= TAB 1: OVERVIEW ================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* KPI Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            
            <div className="bg-[#FFFDF7] p-5 rounded-3xl border border-[#DED8C5] shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-[#C7DCAE]/60 text-[#405B32] flex items-center justify-center mb-3">
                <Package className="w-5 h-5" />
              </div>
              <p className="text-xs text-[#707766] font-semibold">Đang mở bán</p>
              <h3 className="font-heading font-extrabold text-2xl text-[#283124]">
                {availableProducts.length} <span className="text-xs font-normal text-[#707766]">món</span>
              </h3>
            </div>

            <div className="bg-[#FFFDF7] p-5 rounded-3xl border border-[#DED8C5] shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-[#707766]/20 text-[#283124] flex items-center justify-center mb-3">
                <History className="w-5 h-5" />
              </div>
              <p className="text-xs text-[#707766] font-semibold">Đã bán (Sold Out)</p>
              <h3 className="font-heading font-extrabold text-2xl text-[#283124]">
                {soldProducts.length} <span className="text-xs font-normal text-[#707766]">món</span>
              </h3>
            </div>

            <div className="bg-[#FFFDF7] p-5 rounded-3xl border border-[#DED8C5] shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-[#F4C542]/30 text-[#8C5D00] flex items-center justify-center mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <p className="text-xs text-[#707766] font-semibold">Đơn hàng cần giao</p>
              <h3 className="font-heading font-extrabold text-2xl text-[#8C5D00]">
                {pendingOrders.length} <span className="text-xs font-normal text-[#707766]">đơn</span>
              </h3>
            </div>

            <div className="bg-[#FFFDF7] p-5 rounded-3xl border border-[#DED8C5] shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-[#6C9A4A]/20 text-[#405B32] flex items-center justify-center mb-3">
                <DollarSign className="w-5 h-5" />
              </div>
              <p className="text-xs text-[#707766] font-semibold">Tổng doanh thu</p>
              <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-[#405B32]">
                {formatVND(totalRevenue)}
              </h3>
            </div>

          </div>

          {/* Recent Orders Overview */}
          <div className="bg-[#FFFDF7] rounded-3xl border border-[#DED8C5] p-5 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-lg text-[#283124]">
                Đơn hàng gần đây
              </h3>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-bold text-[#6C9A4A] hover:underline cursor-pointer"
              >
                Xem tất cả ({orders.length}) →
              </button>
            </div>

            {orders.length === 0 ? (
              <p className="text-xs text-[#707766] text-center py-8">
                Chưa có đơn hàng nào từ người mua.
              </p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map(order => (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-[#F8F1DF]/50 border border-[#DED8C5] gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-xs sm:text-sm font-bold text-[#283124]">
                          {order.customerName} ({order.className})
                        </strong>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="text-[11px] text-[#707766] mt-0.5">
                        📍 {order.pickupLocation} • 📞 {formatPhoneDisplay(order.customerPhone)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <span className="font-heading font-extrabold text-sm text-[#405B32]">
                        {formatVND(order.total)}
                      </span>
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="px-3 py-1.5 bg-[#6C9A4A]/15 hover:bg-[#6C9A4A]/25 text-[#405B32] text-xs font-bold rounded-xl flex items-center gap-1"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Gọi</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ================= TAB 2: PRODUCTS MANAGEMENT ================= */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-lg text-[#283124]">
              Danh sách sản phẩm của CLB ({products.length})
            </h3>
            <button
              onClick={onOpenAddProductModal}
              className="px-4 py-2 bg-[#6C9A4A] hover:bg-[#405B32] text-white text-xs font-bold rounded-2xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm sản phẩm</span>
            </button>
          </div>

          {products.length === 0 ? (
            <EmptyState
              type="products"
              isSeller={true}
              onAction={onOpenAddProductModal}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => {
                const saleState = getProductSaleState(product, clientLocalTime);
                const isUpcoming = saleState === 'UPCOMING';
                const countdown = product.openSaleTimestamp
                  ? calculateRemainingTime(product.openSaleTimestamp, clientLocalTime)
                  : null;
                const vnTime = product.openSaleTimestamp
                  ? formatVietnamTime(product.openSaleTimestamp)
                  : null;

                return (
                  <div
                    key={product.id}
                    className="bg-[#FFFDF7] rounded-3xl border border-[#DED8C5] p-4 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#F4EEDC] mb-3">
                        <img
                          src={product.imageUrl || (product.images && product.images[0]) || ''}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2">
                          <StampOneOfOne className="scale-90 origin-top-left" />
                        </div>
                        <div className="absolute top-2 right-2">
                          <ProductBadge saleState={saleState} />
                        </div>
                      </div>

                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-heading font-bold text-base text-[#283124] line-clamp-1">
                          {product.name}
                        </h4>
                        <span className="font-heading font-extrabold text-sm text-[#405B32] whitespace-nowrap">
                          {formatVND(product.price)}
                        </span>
                      </div>

                      {/* Opening Sale Timing Info Box for Seller */}
                      {isUpcoming && countdown && (
                        <div className="mb-2.5 p-2 rounded-xl bg-[#283124] text-white border border-[#F4C542]/40 text-[11px] flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[#F4C542] min-w-0">
                            <Timer className="w-3.5 h-3.5 animate-spin shrink-0" />
                            <span className="truncate">Lịch: {vnTime?.saleScheduleDisplay || product.openingAt}</span>
                          </div>
                          <span className="font-mono font-bold text-[#F4C542] shrink-0 pl-1">
                            {countdown.formattedCountdown}
                          </span>
                        </div>
                      )}

                      {product.status === 'AVAILABLE' && !isUpcoming && product.openSaleTimestamp && (
                        <div className="mb-2.5 px-2 py-1 rounded-xl bg-[#C7DCAE]/40 border border-[#6C9A4A]/30 text-[10px] font-bold text-[#405B32] flex items-center gap-1">
                          <span>🟢 Đang mở bán công khai</span>
                        </div>
                      )}

                      <p className="text-xs text-[#707766] line-clamp-2 mb-3">
                        {product.description || 'Không có mô tả.'}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {product.deliveryPeriods?.map((slot, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full bg-[#F8F1DF] text-[10px] font-semibold text-[#707766] border border-[#DED8C5]">
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#DED8C5]/60">
                      {deletingProductId === product.id ? (
                        <div className="flex items-center justify-between gap-2 p-1.5 bg-[#F7B7C4]/30 rounded-xl border border-[#A03045]/40 animate-fade-in">
                          <span className="text-xs font-bold text-[#A03045] pl-1">Xác nhận xóa vĩnh viễn?</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                deleteProduct(product.id);
                                setDeletingProductId(null);
                              }}
                              className="px-3 py-1 rounded-lg bg-[#A03045] hover:bg-[#802030] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                            >
                              Xóa ngay
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingProductId(null)}
                              className="px-2 py-1 rounded-lg bg-[#FFFDF7] hover:bg-[#DED8C5] text-[#707766] text-xs font-bold transition-all cursor-pointer"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onEditProduct(product)}
                            className="flex-1 py-2 rounded-xl bg-[#F8F1DF] hover:bg-[#DED8C5] text-xs font-bold text-[#283124] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5 text-[#6C9A4A]" />
                            <span>Chỉnh sửa & Giờ mở bán</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingProductId(product.id)}
                            className="w-9 h-9 rounded-xl bg-[#F7B7C4]/30 hover:bg-[#F7B7C4] text-[#A03045] flex items-center justify-center transition-colors cursor-pointer"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: ORDERS MANAGEMENT (Desktop Table + Mobile Cards) ================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          
          {/* Orders Filter & Search by Buyer Name */}
          <div className="bg-[#FFFDF7] p-4 rounded-3xl border border-[#DED8C5] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
            {/* Search Buyer Name */}
            <div className="flex items-center bg-[#F8F1DF] border border-[#DED8C5] rounded-2xl px-3 py-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#707766] mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Tìm người mua theo tên, lớp hoặc số điện thoại..."
                value={buyerSearchQuery}
                onChange={e => setBuyerSearchQuery(e.target.value)}
                className="bg-transparent text-xs sm:text-sm text-[#283124] placeholder-[#707766] outline-none w-full"
              />
              {buyerSearchQuery && (
                <button
                  onClick={() => setBuyerSearchQuery('')}
                  className="text-xs font-bold text-[#707766] hover:text-[#283124] px-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              {['ALL', 'PENDING', 'PREPARING', 'COMPLETED', 'CANCELLED'].map(st => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    orderStatusFilter === st
                      ? 'bg-[#6C9A4A] text-white shadow-xs'
                      : 'bg-[#F8F1DF] text-[#707766] hover:text-[#283124]'
                  }`}
                >
                  {st === 'ALL' && 'Tất cả'}
                  {st === 'PENDING' && 'Chờ giao'}
                  {st === 'PREPARING' && 'Đang chuẩn bị'}
                  {st === 'COMPLETED' && 'Đã giao'}
                  {st === 'CANCELLED' && 'Đã hủy'}
                </button>
              ))}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <EmptyState
              type="orders"
              title="Không tìm thấy đơn hàng nào"
              description="Thử tìm kiếm với tên người mua khác hoặc chọn bộ lọc trạng thái khác."
            />
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block bg-[#FFFDF7] rounded-3xl border border-[#DED8C5] shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F1DF] text-[#283124] font-bold border-b border-[#DED8C5]">
                    <tr>
                      <th className="py-3.5 px-4">Người mua</th>
                      <th className="py-3.5 px-3">Lớp</th>
                      <th className="py-3.5 px-3">Số điện thoại</th>
                      <th className="py-3.5 px-4">Sản phẩm</th>
                      <th className="py-3.5 px-3">Địa điểm nhận</th>
                      <th className="py-3.5 px-3">Ngày & Khung giờ</th>
                      <th className="py-3.5 px-3">Tổng tiền</th>
                      <th className="py-3.5 px-3">Trạng thái</th>
                      <th className="py-3.5 px-3 text-right">Xử lý</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DED8C5]/60">
                    {filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-[#F8F1DF]/30 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#283124]">
                          {order.customerName}
                        </td>
                        <td className="py-3 px-3 font-semibold text-[#707766]">
                          {order.className}
                        </td>
                        <td className="py-3 px-3">
                          <a
                            href={`tel:${order.customerPhone}`}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#6C9A4A]/10 hover:bg-[#6C9A4A]/25 text-[#405B32] font-bold transition-colors"
                          >
                            <PhoneCall className="w-3 h-3" />
                            <span>{formatPhoneDisplay(order.customerPhone)}</span>
                          </a>
                        </td>
                        <td className="py-3 px-4 max-w-[160px]">
                          {order.items.map((it, i) => (
                            <div key={i} className="truncate font-semibold text-[#283124]">
                              • {it.productName}
                            </div>
                          ))}
                        </td>
                        <td className="py-3 px-3 font-medium text-[#283124] max-w-[140px]">
                          <span className="block truncate font-bold text-[#405B32]">
                            📍 {order.pickupLocation}
                          </span>
                          {order.orderNotes && (
                            <span className="text-[10px] text-[#707766] block truncate italic">
                              "{order.orderNotes}"
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-[#707766]">
                          <span className="block font-bold text-[#283124]">{order.expectedDeliveryDate}</span>
                          <span className="text-[10px]">{order.items[0]?.deliveryPeriod}</span>
                        </td>
                        <td className="py-3 px-3 font-extrabold text-[#405B32]">
                          {formatVND(order.total)}
                        </td>
                        <td className="py-3 px-3">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="py-3 px-3 text-right">
                          <select
                            value={order.status}
                            onChange={e => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="px-2 py-1 bg-[#F8F1DF] border border-[#DED8C5] rounded-lg text-[11px] font-bold text-[#283124] focus:outline-none"
                          >
                            <option value="PENDING">Chờ giao</option>
                            <option value="PREPARING">Đang chuẩn bị</option>
                            <option value="COMPLETED">Đã giao xong</option>
                            <option value="CANCELLED">Hủy đơn</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                {filteredOrders.map(order => (
                  <div
                    key={order.id}
                    className="bg-[#FFFDF7] rounded-3xl border border-[#DED8C5] p-4 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-[#DED8C5]/60 pb-2">
                      <div>
                        <h4 className="font-heading font-extrabold text-base text-[#283124]">
                          {order.customerName}
                        </h4>
                        <span className="text-xs text-[#707766] font-semibold">
                          Lớp: {order.className}
                        </span>
                      </div>
                      <OrderStatusBadge status={order.status} />
                    </div>

                    {/* Direct phone call button on mobile */}
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="w-full py-2.5 px-4 bg-[#6C9A4A]/15 hover:bg-[#6C9A4A]/25 text-[#405B32] font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-colors"
                    >
                      <PhoneCall className="w-4 h-4 text-[#6C9A4A]" />
                      <span>Gọi khách hàng: {formatPhoneDisplay(order.customerPhone)}</span>
                    </a>

                    {/* Delivery & notes */}
                    <div className="p-3 bg-[#F8F1DF]/50 rounded-2xl text-xs space-y-1">
                      <p className="font-bold text-[#283124]">
                        📍 Nơi nhận: {order.pickupLocation}
                      </p>
                      <p className="text-[#707766]">
                        🕐 Thời gian: {order.expectedDeliveryDate} — {order.items[0]?.deliveryPeriod}
                      </p>
                      {order.orderNotes && (
                        <p className="text-[#707766] italic">
                          Ghi chú: "{order.orderNotes}"
                        </p>
                      )}
                    </div>

                    {/* Items */}
                    <div className="space-y-1 text-xs">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="font-semibold text-[#283124]">• {it.productName}</span>
                          <span className="font-bold text-[#405B32]">{formatVND(it.price)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Actions on Mobile */}
                    <div className="pt-2 border-t border-[#DED8C5]/60 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-[#707766] block">Tổng tiền:</span>
                        <strong className="font-heading font-extrabold text-sm text-[#405B32]">
                          {formatVND(order.total)}
                        </strong>
                      </div>

                      <select
                        value={order.status}
                        onChange={e => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className="px-3 py-1.5 bg-[#F8F1DF] border border-[#DED8C5] rounded-xl text-xs font-bold text-[#283124] focus:outline-none"
                      >
                        <option value="PENDING">Chờ giao</option>
                        <option value="PREPARING">Đang chuẩn bị</option>
                        <option value="COMPLETED">Đã giao xong</option>
                        <option value="CANCELLED">Hủy đơn</option>
                      </select>
                    </div>

                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ================= TAB 4: SOLD OUT & HISTORY ================= */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-lg text-[#283124]">
              Lịch sử các sản phẩm Độc bản đã bán ({soldProducts.length})
            </h3>
            <span className="text-xs text-[#707766]">
              Dữ liệu được lưu vĩnh viễn trong kho lưu trữ của CLB
            </span>
          </div>

          {soldProducts.length === 0 ? (
            <EmptyState
              type="products"
              title="Chưa có sản phẩm nào bán xong"
              description="Khi học sinh đặt mua thành công một món đồ độc bản 1/1, sản phẩm sẽ được lưu vào danh sách này."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {soldProducts.map(product => (
                <div
                  key={product.id}
                  className="bg-[#FFFDF7] rounded-3xl border border-[#DED8C5] p-4 shadow-xs flex items-center gap-3.5"
                >
                  <img
                    src={product.imageUrl || (product.images && product.images[0]) || ''}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl object-cover grayscale-[40%] border border-[#DED8C5] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="px-2 py-0.2 rounded-full bg-[#283124] text-white text-[9px] font-bold">
                        SOLD OUT
                      </span>
                      <h4 className="font-heading font-bold text-xs sm:text-sm text-[#283124] truncate">
                        {product.name}
                      </h4>
                    </div>
                    <p className="font-heading font-extrabold text-sm text-[#405B32]">
                      {formatVND(product.price)}
                    </p>
                    <p className="text-[10px] text-[#707766]">
                      {product.soldOutAt
                        ? `Bán lúc: ${new Date(product.soldOutAt).toLocaleString('vi-VN')}`
                        : 'Đã hoàn tất giao dịch'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 5: SETTINGS & HOTLINE ================= */}
      {activeTab === 'settings' && (
        <div className="max-w-xl mx-auto bg-[#FFFDF7] rounded-3xl border border-[#DED8C5] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-[#6C9A4A]/20 text-[#405B32] flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-xl text-[#283124]">
                Cấu hình thông tin liên hệ CLB
              </h3>
              <p className="text-xs text-[#707766]">
                Số điện thoại hotline sẽ hiển thị cho học sinh trên trang sản phẩm để gọi khi cần hỗ trợ.
              </p>
            </div>
          </div>

          {phoneSuccess && (
            <div className="mb-4 p-3 bg-[#C7DCAE]/60 border border-[#6C9A4A]/40 rounded-2xl text-xs font-bold text-[#405B32]">
              {phoneSuccess}
            </div>
          )}

          <form onSubmit={handleUpdatePhone} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#283124] mb-1">
                Tên đại diện CLB
              </label>
              <input
                type="text"
                disabled
                value="CLB Khởi Nghiệp"
                className="w-full px-3.5 py-2.5 bg-[#F8F1DF]/60 border border-[#DED8C5] rounded-xl text-xs sm:text-sm text-[#707766]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#283124] mb-1">
                Số điện thoại liên hệ CLB (Hotline)
              </label>
              <input
                type="tel"
                value={phoneInput}
                onChange={e => setPhoneInput(e.target.value)}
                placeholder="0974 900 849"
                required
                className="w-full px-3.5 py-2.5 bg-[#F8F1DF] border border-[#DED8C5] rounded-xl text-xs sm:text-sm text-[#283124] focus:outline-none focus:border-[#6C9A4A]"
              />
              <p className="text-[11px] text-[#707766] mt-1">
                Khách hàng trên điện thoại có thể bấm nút "Gọi cho CLB" để liên hệ số này qua `tel:`.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#6C9A4A] hover:bg-[#405B32] text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
            >
              Lưu thay đổi Hotline
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

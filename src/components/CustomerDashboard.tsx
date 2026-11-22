import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatVND, isValidPhoneNumber, formatPhoneDisplay } from '../utils/dateUtils';
import { OrderStatusBadge } from './Badges';
import { User, Package, Calendar, Clock, MapPin, Phone, GraduationCap, Edit3, Check, AlertCircle, ShoppingBag } from 'lucide-react';
import { EmptyState } from './EmptyState';

interface CustomerDashboardProps {
  onExploreProducts: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ onExploreProducts }) => {
  const { currentUser, getUserOrders, updateUserProfile } = useStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');

  // Edit Profile States
  const [name, setName] = useState(currentUser?.name || '');
  const [className, setClassName] = useState(currentUser?.className || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phoneNumber || '');
  const [isEditing, setIsEditing] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <EmptyState
          type="orders"
          title="Vui lòng đăng nhập"
          description="Đăng nhập để xem thông tin cá nhân và lịch sử đơn hàng của bạn."
          actionText="Khám phá sản phẩm"
          onAction={onExploreProducts}
        />
      </div>
    );
  }

  const userOrders = getUserOrders(currentUser.id);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!name.trim() || !className.trim() || !phoneNumber.trim()) {
      setProfileError('Vui lòng điền đầy đủ tất cả các trường.');
      return;
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      setProfileError('Số điện thoại không hợp lệ (10 chữ số, ví dụ: 0901234567).');
      return;
    }

    updateUserProfile({ name, className, phoneNumber });
    setProfileSuccess('Cập nhật thông tin thành công!');
    setIsEditing(false);
    setTimeout(() => setProfileSuccess(''), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
      
      {/* Top Banner */}
      <div className="bg-[#FFFDF7] rounded-3xl border border-[#DED8C5] p-6 sm:p-8 shadow-xs mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#6C9A4A] text-white flex items-center justify-center font-heading font-extrabold text-2xl shadow-xs">
            {(currentUser.name || 'H').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-[#283124]">
                {currentUser.name || 'Học sinh'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C7DCAE]/60 text-[#405B32] border border-[#6C9A4A]/30">
                {currentUser.className || 'Học sinh'}
              </span>
            </div>
            <p className="text-xs text-[#707766] mt-0.5 flex items-center gap-2">
              <span>SĐT: <strong className="text-[#283124]">{formatPhoneDisplay(currentUser.phoneNumber || '')}</strong></span>
              <span>•</span>
              <span>{currentUser.email}</span>
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-[#F8F1DF] p-1 rounded-2xl border border-[#DED8C5] w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-[#6C9A4A] text-white shadow-xs'
                : 'text-[#707766] hover:text-[#283124]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Đơn hàng ({userOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-[#6C9A4A] text-white shadow-xs'
                : 'text-[#707766] hover:text-[#283124]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Hồ sơ cá nhân</span>
          </button>
        </div>
      </div>

      {/* Profile Feedback */}
      {profileSuccess && (
        <div className="mb-6 p-3.5 bg-[#C7DCAE]/50 border border-[#6C9A4A]/50 rounded-2xl flex items-center gap-2 text-xs text-[#405B32] font-bold">
          <Check className="w-4 h-4 shrink-0" />
          <span>{profileSuccess}</span>
        </div>
      )}

      {/* ================= TAB 1: ORDERS HISTORY ================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-extrabold text-lg sm:text-xl text-[#283124]">
              Lịch sử mua hàng & Đơn hàng của bạn
            </h2>
            <span className="text-xs text-[#707766]">
              Lưu giữ vĩnh viễn mọi sản phẩm độc bản bạn từng mua
            </span>
          </div>

          {userOrders.length === 0 ? (
            <EmptyState
              type="orders"
              title="Bạn chưa có đơn hàng nào"
              description="Những món đồ độc bản 1 of 1 đang chờ bạn khám phá tại Marketplace."
              actionText="Khám phá sản phẩm ngay"
              onAction={onExploreProducts}
            />
          ) : (
            <div className="space-y-4">
              {userOrders.map(order => (
                <div
                  key={order.id}
                  className="bg-[#FFFDF7] rounded-3xl border border-[#DED8C5] p-5 sm:p-6 shadow-xs space-y-4"
                >
                  {/* Order Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DED8C5]/60 pb-3">
                    <div>
                      <span className="text-[11px] text-[#707766]">Thời gian đặt:</span>
                      <p className="text-xs font-bold text-[#283124]">
                        {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2.5">
                    {(order.items || []).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F1DF]/60 border border-[#DED8C5]/60"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.imageUrl || ''}
                            alt={item.productName || 'Sản phẩm'}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-xl object-cover border border-[#DED8C5]"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#C7DCAE]/60 text-[#405B32]">
                                1 of 1
                              </span>
                              <h4 className="font-heading font-bold text-xs sm:text-sm text-[#283124]">
                                {item.productName}
                              </h4>
                            </div>
                            <p className="text-[11px] text-[#707766] flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-[#F28C38]" />
                              <span>Khung giờ: {item.deliveryPeriod || 'Ra chơi'}</span>
                            </p>
                          </div>
                        </div>

                        <span className="font-heading font-extrabold text-sm text-[#405B32]">
                          {formatVND(Number(item.price) || 0)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Location & Notes Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs bg-[#F8F1DF]/30 p-3 rounded-2xl border border-[#DED8C5]/50">
                    <div className="space-y-1">
                      <p className="text-[#707766] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#6C9A4A]" />
                        <span>Nơi nhận: <strong className="text-[#283124]">{order.pickupLocation || 'Chưa cập nhật'}</strong></span>
                      </p>
                      <p className="text-[#707766] flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#6C9A4A]" />
                        <span>SĐT nhận đơn: <strong className="text-[#283124]">{formatPhoneDisplay(order.customerPhone || '')}</strong></span>
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[#707766] flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#6C9A4A]" />
                        <span>Ngày nhận dự kiến: <strong className="text-[#405B32]">{order.expectedDeliveryDate || 'Ngày làm việc tiếp theo'}</strong></span>
                      </p>
                      {order.orderNotes && (
                        <p className="text-[#707766] italic">
                          Ghi chú: "{order.orderNotes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Total footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#DED8C5]/60 text-sm">
                    <span className="text-xs font-bold text-[#707766]">Tổng giá trị đơn hàng:</span>
                    <span className="font-heading font-extrabold text-base sm:text-lg text-[#405B32]">
                      {formatVND(Number(order.total) || 0)}
                    </span>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: PROFILE ================= */}
      {activeTab === 'profile' && (
        <div className="bg-[#FFFDF7] rounded-3xl border border-[#DED8C5] p-6 sm:p-8 shadow-xs max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading font-extrabold text-xl text-[#283124]">
                Thông tin tài khoản học sinh
              </h2>
              <p className="text-xs text-[#707766]">
                Dữ liệu được dùng tự động khi bạn đặt hàng các sản phẩm của CLB.
              </p>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#F8F1DF] hover:bg-[#DED8C5] border border-[#DED8C5] text-xs font-bold text-[#283124] flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Chỉnh sửa</span>
              </button>
            )}
          </div>

          {profileError && (
            <div className="mb-4 p-3 bg-[#F7B7C4]/30 border border-[#F7B7C4] rounded-2xl flex items-center gap-2 text-xs text-[#A03045] font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#283124] mb-1">
                Họ và tên
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8F1DF] border border-[#DED8C5] rounded-xl text-xs sm:text-sm text-[#283124] disabled:opacity-75 focus:outline-none focus:border-[#6C9A4A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#283124] mb-1">
                Lớp học
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={className}
                onChange={e => setClassName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8F1DF] border border-[#DED8C5] rounded-xl text-xs sm:text-sm text-[#283124] disabled:opacity-75 focus:outline-none focus:border-[#6C9A4A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#283124] mb-1">
                Số điện thoại liên hệ
              </label>
              <input
                type="tel"
                disabled={!isEditing}
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value.replace(/[^\d\s]/g, ''))}
                className="w-full px-3.5 py-2.5 bg-[#F8F1DF] border border-[#DED8C5] rounded-xl text-xs sm:text-sm text-[#283124] disabled:opacity-75 focus:outline-none focus:border-[#6C9A4A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#707766] mb-1">
                Email đăng nhập (Cố định)
              </label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full px-3.5 py-2.5 bg-[#F8F1DF]/50 border border-[#DED8C5]/50 rounded-xl text-xs sm:text-sm text-[#707766]"
              />
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setName(currentUser.name);
                    setClassName(currentUser.className);
                    setPhoneNumber(currentUser.phoneNumber);
                    setIsEditing(false);
                    setProfileError('');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#F8F1DF] text-xs font-bold text-[#707766] cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#6C9A4A] hover:bg-[#405B32] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            )}
          </form>
        </div>
      )}

    </div>
  );
};

import React from 'react';
import { ShoppingBag, UserCheck, Calendar, PackageCheck, PhoneCall } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatPhoneDisplay } from '../utils/dateUtils';

export const HowItWorks: React.FC = () => {
  const { sellerContactPhone } = useStore();

  const steps = [
    {
      num: '01',
      title: 'Khám phá sản phẩm 1/1',
      desc: 'Mỗi món đồ chỉ có 1 bản duy nhất. Hãy chọn món đồ yêu thích trước khi người khác mua.',
      icon: <ShoppingBag className="w-5 h-5 text-[#6C9A4A]" />
    },
    {
      num: '02',
      title: 'Đăng ký & Chọn nơi nhận',
      desc: 'Đăng ký tài khoản học sinh nhanh chóng. Chọn nhận tại Lớp học hoặc điểm hẹn CLB (Căn tin, Thư viện...).',
      icon: <UserCheck className="w-5 h-5 text-[#F28C38]" />
    },
    {
      num: '03',
      title: 'Tự tính ngày nhận hàng',
      desc: 'CLB hoạt động từ Thứ 2 → Thứ 6. Hệ thống tự động tính ngày làm việc kế tiếp và hiển thị khung giờ cụ thể.',
      icon: <Calendar className="w-5 h-5 text-[#F4C542]" />
    },
    {
      num: '04',
      title: 'Giao tận nơi & Thanh toán',
      desc: 'Thành viên CLB sẽ giao hàng theo đúng khung giờ đã hẹn và nhận tiền mặt trực tiếp.',
      icon: <PackageCheck className="w-5 h-5 text-[#405B32]" />
    }
  ];

  return (
    <section className="px-3 sm:px-6 py-10 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-[#6C9A4A]">
          HƯỚNG DẪN MUA SẮM
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#283124] font-heading mt-1">
          Cách thức mua & nhận hàng từ CLB
        </h2>
        <p className="text-xs sm:text-sm text-[#707766] mt-2">
          Đơn giản, tiện lợi và an tâm cho toàn thể học sinh trong trường.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map(step => (
          <div
            key={step.num}
            className="p-5 rounded-3xl bg-[#FFFDF7] border border-[#DED8C5] shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-heading font-extrabold text-[#C7DCAE]">
                  {step.num}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-[#F8F1DF] border border-[#DED8C5] flex items-center justify-center">
                  {step.icon}
                </div>
              </div>

              <h4 className="font-heading font-bold text-sm sm:text-base text-[#283124] mb-1.5">
                {step.title}
              </h4>
              <p className="text-xs text-[#707766] leading-relaxed">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Hotline Support Banner */}
      <div className="mt-8 p-5 rounded-3xl bg-[#F8F1DF] border border-[#DED8C5] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h4 className="font-heading font-bold text-sm text-[#283124]">
            Bạn cần hỗ trợ đặt hàng hoặc thắc mắc về sản phẩm?
          </h4>
          <p className="text-xs text-[#707766] mt-0.5">
            Liên hệ trực tiếp với Ban Quản trị CLB Khởi Nghiệp qua Hotline.
          </p>
        </div>

        <a
          href={`tel:${sellerContactPhone.replace(/\s+/g, '')}`}
          className="px-5 py-2.5 rounded-2xl bg-[#6C9A4A] hover:bg-[#405B32] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-colors"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Hotline: {formatPhoneDisplay(sellerContactPhone)}</span>
        </a>
      </div>
    </section>
  );
};

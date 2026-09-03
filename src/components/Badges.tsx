import React from 'react';
import { ProductStatus, OrderStatus, ProductSaleState } from '../types';
import { Clock } from 'lucide-react';

export const ProductBadge: React.FC<{
  status?: ProductStatus;
  saleState?: ProductSaleState;
  countdownStr?: string;
}> = ({ status = 'AVAILABLE', saleState, countdownStr }) => {
  const state = saleState || (status as ProductSaleState);

  if (state === 'SOLD_OUT') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#707766]/20 text-[#283124] border border-[#707766]/30 backdrop-blur-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-[#707766]"></span>
        SOLD OUT
      </span>
    );
  }

  if (state === 'UPCOMING') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F4C542]/30 text-[#8C5D00] border border-[#F4C542]/60 shadow-xs backdrop-blur-xs animate-pulse">
        <Clock className="w-3 h-3 text-[#D06510]" />
        <span>CHƯA MỞ BÁN</span>
      </span>
    );
  }

  if (state === 'AVAILABLE') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#C7DCAE]/80 text-[#405B32] border border-[#6C9A4A]/40 shadow-xs backdrop-blur-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-[#6C9A4A] animate-ping"></span>
        ĐANG MỞ BÁN
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#DED8C5] text-[#707766]">
      ẨN / ĐÃ ĐÓNG
    </span>
  );
};

export const OrderStatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  switch (status) {
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F4C542]/20 text-[#B87A00] border border-[#F4C542]/40">
          <span className="w-2 h-2 rounded-full bg-[#F4C542]"></span>
          Chờ giao
        </span>
      );
    case 'PREPARING':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F28C38]/20 text-[#D06510] border border-[#F28C38]/40">
          <span className="w-2 h-2 rounded-full bg-[#F28C38]"></span>
          Đang chuẩn bị
        </span>
      );
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#C7DCAE]/60 text-[#405B32] border border-[#6C9A4A]/30">
          <span className="w-2 h-2 rounded-full bg-[#6C9A4A]"></span>
          Đã giao xong
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F7B7C4]/30 text-[#A03045] border border-[#F7B7C4]/50">
          <span className="w-2 h-2 rounded-full bg-[#E05A70]"></span>
          Đã hủy
        </span>
      );
    default:
      return null;
  }
};

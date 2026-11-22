import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatVND } from '../utils/dateUtils';
import {
  formatVietnamTime,
  buildVietnamTimestamp,
  getTodayVietnamDateStr,
  getTomorrowVietnamDateStr,
  calculateRemainingTime,
  parseProductOpeningValues
} from '../utils/timeUtils';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Check,
  Sparkles,
  Image,
  Clock,
  AlertCircle,
  Eye,
  Calendar as CalendarIcon,
  Timer,
  Zap,
  Loader2
} from 'lucide-react';
import { StampOneOfOne } from './BotanicalDecorations';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

const DEFAULT_TIME_SLOTS = [
  'Ra chơi sáng',
  'Ra chơi chiều',
  'Ra về sáng',
  'Ra về chiều',
  'Giờ học sáng',
  'Giờ học chiều'
];

interface FormImageItem {
  id: string;
  previewUrl: string;
  base64: string;
  needsRecompression: boolean;
  status: 'processing' | 'ready' | 'error';
  errorMsg?: string;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit
}) => {
  const { addProduct, updateProduct, deleteProduct, serverTime: clientLocalTime } = useStore();

  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | string>('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Thủ công mỹ nghệ');
  
  // Date & Time Scheduling States
  const [openingDate, setOpeningDate] = useState<string>(getTodayVietnamDateStr(Date.now()));
  const [openingHour, setOpeningHour] = useState<number>(9);
  const [openingMinute, setOpeningMinute] = useState<number>(0);
  const [isImmediateSale, setIsImmediateSale] = useState<boolean>(false);

  const [formImages, setFormImages] = useState<FormImageItem[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);

  // Delivery periods (multiple selection)
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>(['Ra chơi chiều']);
  const [customSlot, setCustomSlot] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Track the ID of the product currently loaded in the form
  // to only initialize state when opening the modal or switching products
  const prevOpenRef = useRef<boolean>(false);
  const prevEditIdRef = useRef<string | null | undefined>(undefined);

  // Memory leak prevention for object URLs
  useEffect(() => {
    return () => {
      formImages.forEach(item => {
        if (item.previewUrl.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(item.previewUrl);
          } catch (e) {}
        }
      });
    };
  }, [formImages]);

  useEffect(() => {
    if (!isOpen) {
      prevOpenRef.current = false;
      prevEditIdRef.current = undefined;
      return;
    }

    const editId = productToEdit ? productToEdit.id : null;
    const isOpeningNow = !prevOpenRef.current && isOpen;
    const isChangingProduct = prevEditIdRef.current !== editId;

    if (isOpeningNow || isChangingProduct) {
      prevOpenRef.current = true;
      prevEditIdRef.current = editId;
      setShowDeleteConfirm(false);
      setErrorMessage('');

      if (productToEdit) {
        setName(productToEdit.name || '');
        setPrice(productToEdit.price || '');
        setDescription(productToEdit.description || '');
        setCategory(productToEdit.category || 'Thủ công mỹ nghệ');
        
        // Parse opening schedule
        const parsed = parseProductOpeningValues(productToEdit, clientLocalTime);
        setOpeningDate(parsed.dateStr);
        setOpeningHour(parsed.hour);
        setOpeningMinute(parsed.minute);
        setIsImmediateSale(!productToEdit.openSaleTimestamp || productToEdit.openSaleTimestamp <= clientLocalTime);

        const existingImgs = productToEdit.images && productToEdit.images.length > 0
          ? productToEdit.images
          : productToEdit.imageUrl ? [productToEdit.imageUrl] : [];
        
        setFormImages(existingImgs.map((imgStr, i) => ({
          id: `existing_${i}_${Date.now()}`,
          previewUrl: imgStr,
          base64: imgStr,
          needsRecompression: imgStr.startsWith('data:image/'),
          status: 'ready'
        })));
        setPrimaryImageIndex(0);
        setSelectedPeriods(
          productToEdit.deliveryPeriods && productToEdit.deliveryPeriods.length > 0
            ? productToEdit.deliveryPeriods
            : [productToEdit.deliveryPeriod || 'Ra chơi chiều']
        );
      } else {
        // Defaults for new product
        setName('');
        setPrice('');
        setDescription('');
        setCategory('Thủ công mỹ nghệ');
        
        const today = getTodayVietnamDateStr(clientLocalTime);
        setOpeningDate(today);
        setOpeningHour(9);
        setOpeningMinute(0);
        setIsImmediateSale(false);

        setFormImages([]);
        setPrimaryImageIndex(0);
        setSelectedPeriods(['Ra chơi chiều']);
        setCustomSlot('');
      }
    }
  }, [isOpen, productToEdit]); // CRITICAL: NEVER put clientLocalTime here!

  if (!isOpen) return null;

  // Today and Tomorrow strings for quick buttons
  const todayIso = getTodayVietnamDateStr(clientLocalTime);
  const tomorrowIso = getTomorrowVietnamDateStr(clientLocalTime);
  const dayAfterTomorrowIso = getTomorrowVietnamDateStr(clientLocalTime + 24 * 60 * 60 * 1000);

  // Calculate live preview timestamp based on selected date + hour + minute
  const computedTimestamp = isImmediateSale
    ? clientLocalTime - 1000
    : buildVietnamTimestamp(openingDate, openingHour, openingMinute);

  const previewVnTime = formatVietnamTime(computedTimestamp);
  const previewCountdown = calculateRemainingTime(computedTimestamp, clientLocalTime);

  // Process File to lightweight permanent Base64 Data URL
  const processFileToBase64 = (
    file: File,
    maxDimension = 600,
    maxBytes = 100 * 1024
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const originalDataUrl = e.target?.result as string;
        if (!originalDataUrl) {
          return reject(new Error('Không đọc được nội dung tệp.'));
        }

        const img = new window.Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
              } else {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              return reject(new Error('Trình duyệt không hỗ trợ Canvas nén ảnh.'));
            }

            for (const scale of [1, 0.8, 0.6]) {
              canvas.width = Math.max(1, Math.round(width * scale));
              canvas.height = Math.max(1, Math.round(height * scale));
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              for (const quality of [0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1]) {
                const resultBase64 = canvas.toDataURL('image/jpeg', quality);
                const encoded = resultBase64.split(',')[1] || '';
                const padding = encoded.endsWith('==') ? 2 : encoded.endsWith('=') ? 1 : 0;
                const imageBytes = Math.floor(encoded.length * 3 / 4) - padding;
                if (resultBase64.startsWith('data:image/jpeg') && imageBytes < maxBytes) {
                  return resolve(resultBase64);
                }
              }
            }

            reject(new Error(`Không thể nén ảnh xuống dưới ${Math.floor(maxBytes / 1024)} KB. Vui lòng chọn ảnh khác.`));
          } catch (err: any) {
            reject(new Error(err.message || 'Lỗi khi xử lý nén ảnh.'));
          }
        };

        img.onerror = () => {
          reject(new Error('Không thể tải hình ảnh vào bộ nhớ.'));
        };

        img.src = originalDataUrl;
      };

      reader.onerror = () => reject(new Error('Lỗi khi đọc tệp từ thiết bị.'));
      reader.readAsDataURL(file);
    });
  };

  const compressImageSource = async (imageSource: string, maxDimension: number, maxBytes: number) => {
    let blob: Blob;
    try {
      const response = await fetch(imageSource);
      if (!response.ok) throw new Error('Image fetch failed');
      blob = await response.blob();
    } catch {
      throw new Error('Không thể đọc ảnh để nén lại. Vui lòng chọn ảnh mới.');
    }
    return processFileToBase64(new File([blob], 'product-image', { type: blob.type }), maxDimension, maxBytes);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (formImages.length + files.length > 3) {
      setErrorMessage('Mỗi sản phẩm chỉ được tải tối đa 3 ảnh.');
      e.target.value = '';
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');

    const fileList: File[] = Array.from(files);

    // Validate file types
    const nonImageFiles = fileList.filter(f => !['image/png', 'image/jpeg', 'image/webp'].includes(f.type));
    if (nonImageFiles.length > 0) {
      setErrorMessage('Chỉ hỗ trợ tệp định dạng hình ảnh (PNG, JPG, JPEG, WEBP).');
      e.target.value = '';
      return;
    }

    // Validate file size limit
    const tooLargeFiles = fileList.filter(f => f.size > 10 * 1024 * 1024);
    if (tooLargeFiles.length > 0) {
      setErrorMessage('Dung lượng tệp quá lớn (> 10MB). Vui lòng chọn ảnh nhẹ hơn.');
      e.target.value = '';
      return;
    }

    // 1. Instantly create Object URLs for immediate 0ms UI preview
    const newItems: { id: string; file: File; previewUrl: string }[] = fileList.map((file: File) => ({
      id: `img_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`,
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    // 2. Add to state immediately so preview appears on screen with zero latency
    setFormImages(prev => [
      ...prev,
      ...newItems.map(item => ({
        id: item.id,
        previewUrl: item.previewUrl,
        base64: '',
        needsRecompression: false,
        status: 'processing' as const
      }))
    ]);

    // Reset input value so same files can be re-selected if deleted
    e.target.value = '';

    // 3. Process each image in background for permanent Base64 storage
    newItems.forEach(async (item) => {
      try {
        const base64 = await processFileToBase64(item.file);
        
        // Revoke the temporary blob URL now that Base64 is ready
        if (item.previewUrl.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(item.previewUrl);
          } catch (e) {}
        }

        setFormImages(prev => prev.map(it => {
          if (it.id === item.id) {
            return {
              ...it,
              previewUrl: base64, // replace blob with permanent base64 preview
              base64,
              status: 'ready' as const
            };
          }
          return it;
        }));
      } catch (err: any) {
        console.error(`[Image Processing Error] ${item.file.name}:`, err);
        // Clean up blob URL on error too
        if (item.previewUrl.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(item.previewUrl);
          } catch (e) {}
        }
        setFormImages(prev => prev.map(it => {
          if (it.id === item.id) {
            return {
              ...it,
              status: 'error' as const,
              errorMsg: err.message || 'Lỗi xử lý ảnh'
            };
          }
          return it;
        }));
      }
    });
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const itemToRemove = formImages[indexToRemove];
    if (itemToRemove && itemToRemove.previewUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(itemToRemove.previewUrl);
      } catch (e) {}
    }

    setFormImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
    if (primaryImageIndex >= indexToRemove && primaryImageIndex > 0) {
      setPrimaryImageIndex(prev => prev - 1);
    }
  };

  const togglePeriod = (slot: string) => {
    if (selectedPeriods.includes(slot)) {
      if (selectedPeriods.length === 1) {
        setErrorMessage('Sản phẩm phải có ít nhất 1 khung giờ nhận hàng.');
        return;
      }
      setSelectedPeriods(prev => prev.filter(s => s !== slot));
    } else {
      setSelectedPeriods(prev => [...prev, slot]);
    }
    setErrorMessage('');
  };

  const handleAddCustomSlot = () => {
    if (!customSlot.trim()) return;
    if (!selectedPeriods.includes(customSlot.trim())) {
      setSelectedPeriods(prev => [...prev, customSlot.trim()]);
    }
    setCustomSlot('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || name.trim().length > 200) {
      setErrorMessage('Tên sản phẩm bắt buộc và không được vượt quá 200 ký tự.');
      return;
    }
    if (description.trim().length > 2000) {
      setErrorMessage('Mô tả sản phẩm không được vượt quá 2.000 ký tự.');
      return;
    }

    if (formImages.length === 0) {
      setErrorMessage('Vui lòng tải lên ít nhất 1 ảnh.');
      return;
    }
    if (formImages.length > 3) {
      setErrorMessage('Mỗi sản phẩm chỉ được lưu tối đa 3 ảnh. Vui lòng xóa bớt ảnh.');
      return;
    }
    if (formImages.length > 3) {
      setErrorMessage('Mỗi sản phẩm chỉ được lưu tối đa 3 ảnh. Vui lòng xóa bớt ảnh.');
      return;
    }

    // Check if any image is still being compressed
    const processingItems = formImages.filter(it => it.status === 'processing');
    if (processingItems.length > 0) {
      setErrorMessage('Ảnh đang được tối ưu, vui lòng chờ trong giây lát...');
      return;
    }

    // Check if any image encountered an error
    const errorItems = formImages.filter(it => it.status === 'error');
    if (errorItems.length > 0) {
      setErrorMessage('Có ảnh bị lỗi. Vui lòng bấm (✕) trên ảnh lỗi để loại bỏ trước khi đăng.');
      return;
    }

    // Extract all ready Base64 strings
    const readyBase64List = formImages
      .filter(it => it.status === 'ready' && it.base64)
      .map(it => it.base64);

    if (readyBase64List.length === 0) {
      setErrorMessage('Không tìm thấy dữ liệu ảnh hợp lệ để lưu.');
      return;
    }

    // CRITICAL SAFETY: Verify NO blob URLs are ever sent to Firestore for persistent storage
    const hasBlob = readyBase64List.some(img => img.startsWith('blob:'));
    if (hasBlob) {
      setErrorMessage('Dữ liệu ảnh chưa sẵn sàng cho lưu trữ bền vững. Vui lòng thử lại.');
      return;
    }

    if (selectedPeriods.length === 0) {
      setErrorMessage('Vui lòng chọn hoặc thêm ít nhất 1 khung giờ nhận hàng.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    const numPrice = parseInt(price.toString().replace(/\D/g, ''), 10) || 0;
    const finalTimestamp = isImmediateSale ? clientLocalTime : computedTimestamp;
    const finalVnTime = formatVietnamTime(finalTimestamp);
    
    const finalOpeningAt = isImmediateSale 
      ? 'Đang mở bán'
      : `${finalVnTime.dateStr} – ${finalVnTime.hourMinuteStr}`;

    try {
      const imagesToSave = await Promise.all(formImages
        .filter(item => item.status === 'ready' && item.base64)
        .map(item =>
          item.needsRecompression && item.base64.startsWith('data:image/')
            ? compressImageSource(item.base64, 600, 100 * 1024)
            : item.base64
        )
      );
      const primaryImage = imagesToSave[primaryImageIndex] || imagesToSave[0];
      const primaryImg = await compressImageSource(primaryImage, 300, 30 * 1024);

      if (productToEdit) {
        await updateProduct(productToEdit.id, {
          name: name.trim(),
          price: numPrice,
          description: description.trim(),
          category,
          openingAt: finalOpeningAt,
          openSaleTimestamp: finalTimestamp,
          images: imagesToSave,
          imageUrl: primaryImg,
          deliveryPeriods: selectedPeriods,
          deliveryPeriod: selectedPeriods[0]
        });
      } else {
        await addProduct({
          name: name.trim(),
          price: numPrice,
          description: description.trim(),
          category,
          openingAt: finalOpeningAt,
          openSaleTimestamp: finalTimestamp,
          images: imagesToSave,
          imageUrl: primaryImg,
          deliveryPeriods: selectedPeriods,
          deliveryPeriod: selectedPeriods[0]
        });
      }
      setSuccessMessage('Đăng sản phẩm thành công.');
      setTimeout(() => {
        onClose();
        setIsSubmitting(false);
      }, 1000);
    } catch (err: any) {
      console.error("Lỗi Firestore:", err);
      setIsSubmitting(false);
      if (err.message && (
        err.message.includes('payload') ||
        err.message.includes('dung lượng') ||
        err.message.includes('700 KB') ||
        err.message.includes('nén') ||
        err.message.includes('ảnh để nén')
      )) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Không thể lưu sản phẩm. Vui lòng kiểm tra kết nối và thử lại.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#283124]/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-[#FFFDF7] rounded-3xl sm:rounded-[36px] border border-[#DED8C5] shadow-2xl overflow-hidden my-auto p-6 sm:p-8">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#F8F1DF] hover:bg-[#DED8C5] border border-[#DED8C5] flex items-center justify-center text-[#707766] hover:text-[#283124] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C7DCAE]/60 text-[#405B32] text-xs font-bold mb-1.5">
            <span>CLB Khởi Nghiệp • Quản lý sản phẩm</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#283124] font-heading">
            {productToEdit ? 'Chỉnh sửa sản phẩm & Lịch mở bán' : 'Đăng sản phẩm & Lên lịch mở bán'}
          </h2>
          <p className="text-xs text-[#707766]">
            Mỗi sản phẩm là độc bản (số lượng duy nhất = 1) và có lịch mở bán độc lập.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-[#F7B7C4]/30 border border-[#F7B7C4] rounded-2xl flex items-center gap-2 text-xs text-[#A03045] font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 bg-[#C7DCAE]/30 border border-[#6C9A4A] rounded-2xl flex items-center gap-2 text-xs text-[#405B32] font-bold">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
          
          {/* Images Upload Section */}
          <div className="p-4 rounded-2xl bg-[#F8F1DF]/70 border border-[#DED8C5] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#283124] flex items-center gap-1.5">
                <Image className="w-4 h-4 text-[#6C9A4A]" />
                <span>Hình ảnh sản phẩm (Tải từ máy tính / điện thoại / tablet)</span>
              </label>
              <span className="text-[11px] text-[#707766]">
                {formImages.length}/3 ảnh đã chọn
              </span>
            </div>

            {/* Image Preview & Thumbnails */}
            {formImages.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-1">
                {formImages.map((item, idx) => {
                  const isProcessing = item.status === 'processing';
                  const isError = item.status === 'error';
                  const errorMsg = item.errorMsg;

                  return (
                  <div
                    key={item.id}
                    onClick={() => { if (!isProcessing && !isError) setPrimaryImageIndex(idx); }}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                      primaryImageIndex === idx
                        ? 'border-[#6C9A4A] ring-2 ring-[#6C9A4A]/30'
                        : isError ? 'border-[#A03045]' : 'border-[#DED8C5] opacity-85 hover:opacity-100 cursor-pointer'
                    }`}
                  >
                    <img
                      src={item.previewUrl}
                      alt={`Ảnh sản phẩm ${idx + 1}`}
                      className={`w-full h-full object-cover ${isProcessing ? 'opacity-60' : ''} ${isError ? 'opacity-30 grayscale' : ''}`}
                    />
                    
                    {isProcessing && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-10 p-1">
                         <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mb-1"></div>
                         <span className="text-[9px] text-white font-bold text-center leading-tight">Đang tối ưu...</span>
                      </div>
                    )}

                    {isError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-1.5 bg-black/70 text-center z-10">
                         <span className="text-[10px] text-[#F7B7C4] font-bold leading-tight line-clamp-3">{errorMsg || 'Lỗi xử lý'}</span>
                      </div>
                    )}
                    
                    {/* Primary Badge */}
                    {primaryImageIndex === idx && !isProcessing && !isError && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-[#6C9A4A] text-white text-[9px] font-bold z-20 shadow-xs">
                        Ảnh bìa
                      </span>
                    )}

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(idx);
                      }}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 hover:bg-[#A03045] text-white flex items-center justify-center text-xs z-20 cursor-pointer transition-colors"
                      title="Xóa ảnh"
                    >
                      ✕
                    </button>
                  </div>
                );})}
              </div>
            )}

            {/* Upload Button */}
            <label className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 transition-colors text-center ${
              formImages.length >= 3
                ? 'border-[#DED8C5] bg-[#F8F1DF]/40 cursor-not-allowed opacity-60'
                : 'border-[#6C9A4A]/40 hover:border-[#6C9A4A] bg-[#FFFDF7] cursor-pointer'
            }`}>
              <Upload className="w-6 h-6 text-[#6C9A4A]" />
              <span className="text-xs font-bold text-[#283124]">
                {formImages.length >= 3 ? 'Đã đạt tối đa 3 ảnh' : 'Bấm để chọn hoặc kéo thả ảnh từ thiết bị'}
              </span>
              <span className="text-[10px] text-[#707766]">
                Hỗ trợ PNG, JPG, JPEG, WEBP (Tối đa 3 ảnh / sản phẩm)
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                disabled={formImages.length >= 3}
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Name & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#283124] mb-1">
                Tên sản phẩm <span className="text-[#A03045]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={200}
                required
                placeholder="Ví dụ: Vòng tay handmade thạch anh"
                className="w-full px-3.5 py-2.5 bg-[#F8F1DF] border border-[#DED8C5] rounded-xl text-xs sm:text-sm text-[#283124] focus:outline-none focus:border-[#6C9A4A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#283124] mb-1">
                Giá bán (VND) <span className="text-[#A03045]">*</span>
              </label>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                required
                min={1000}
                step={1000}
                placeholder="Ví dụ: 85000"
                className="w-full px-3.5 py-2.5 bg-[#F8F1DF] border border-[#DED8C5] rounded-xl text-xs sm:text-sm text-[#283124] focus:outline-none focus:border-[#6C9A4A]"
              />
            </div>
          </div>

          {/* Fixed Quantity Indicator (1/1 Policy) */}
          <div className="p-3 bg-[#C7DCAE]/30 border border-[#6C9A4A]/30 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StampOneOfOne />
              <span className="text-xs font-bold text-[#405B32]">
                Số lượng: 1 sản phẩm duy nhất (Độc bản)
              </span>
            </div>
            <span className="text-[11px] text-[#707766]">
              Quy tắc hệ thống CLB
            </span>
          </div>

          {/* ========================================================= */}
          {/* SPECIAL SECTION: LỊCH MỞ BÁN THEO NGÀY + GIỜ THỰC TẾ     */}
          {/* ========================================================= */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#283124] text-white border border-[#405B32] shadow-md space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#405B32]/70 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#F4C542]/20 border border-[#F4C542]/40 flex items-center justify-center text-[#F4C542]">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-sm sm:text-base text-[#F4C542]">
                    Lịch mở bán theo Ngày + Giờ thực tế
                  </h3>
                  <p className="text-[11px] text-[#C7DCAE]">
                    Thiết lập chính xác ngày và giờ mở bán cho sản phẩm này
                  </p>
                </div>
              </div>

              {/* Mode Toggle: Mở bán ngay vs Lên lịch */}
              <div className="flex items-center gap-1.5 bg-[#1D241A] p-1 rounded-xl border border-[#405B32]">
                <button
                  type="button"
                  onClick={() => setIsImmediateSale(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    !isImmediateSale
                      ? 'bg-[#6C9A4A] text-white shadow-xs'
                      : 'text-[#C7DCAE] hover:text-white'
                  }`}
                >
                  <Clock className="w-3 h-3 inline mr-1" />
                  Đặt lịch mở bán
                </button>
                <button
                  type="button"
                  onClick={() => setIsImmediateSale(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    isImmediateSale
                      ? 'bg-[#F28C38] text-white shadow-xs'
                      : 'text-[#C7DCAE] hover:text-white'
                  }`}
                >
                  <Zap className="w-3 h-3 inline mr-1" />
                  Mở bán ngay
                </button>
              </div>
            </div>

            {!isImmediateSale ? (
              <div className="space-y-4">
                
                {/* 1. NGÀY MỞ BÁN (Date Picker & Quick Buttons) */}
                <div>
                  <label className="block text-xs font-bold text-[#F8F1DF] mb-2 flex items-center justify-between">
                    <span>1. Chọn Ngày mở bán:</span>
                    <span className="text-[11px] text-[#F4C542] font-mono">
                      {previewVnTime.dayOfWeekStr}, {previewVnTime.dateStr}
                    </span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div className="sm:col-span-2">
                      <input
                        type="date"
                        value={openingDate}
                        onChange={e => setOpeningDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#1D241A] border border-[#405B32] rounded-xl text-xs sm:text-sm text-white font-medium focus:outline-none focus:border-[#F4C542]"
                      />
                    </div>

                    <div className="sm:col-span-2 flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setOpeningDate(todayIso)}
                        className={`flex-1 py-2 px-2 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${
                          openingDate === todayIso
                            ? 'bg-[#405B32] text-[#F4C542] border-[#F4C542]'
                            : 'bg-[#1D241A] text-[#C7DCAE] border-[#405B32] hover:bg-[#334229]'
                        }`}
                      >
                        Hôm nay
                      </button>
                      <button
                        type="button"
                        onClick={() => setOpeningDate(tomorrowIso)}
                        className={`flex-1 py-2 px-2 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${
                          openingDate === tomorrowIso
                            ? 'bg-[#405B32] text-[#F4C542] border-[#F4C542]'
                            : 'bg-[#1D241A] text-[#C7DCAE] border-[#405B32] hover:bg-[#334229]'
                        }`}
                      >
                        Ngày mai
                      </button>
                      <button
                        type="button"
                        onClick={() => setOpeningDate(dayAfterTomorrowIso)}
                        className={`flex-1 py-2 px-2 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${
                          openingDate === dayAfterTomorrowIso
                            ? 'bg-[#405B32] text-[#F4C542] border-[#F4C542]'
                            : 'bg-[#1D241A] text-[#C7DCAE] border-[#405B32] hover:bg-[#334229]'
                        }`}
                      >
                        Ngày kia
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. GIỜ & PHÚT MỞ BÁN (Sliders & Presets) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#405B32]/50">
                  
                  {/* GIỜ (0 - 23) */}
                  <div className="bg-[#1D241A] p-3.5 rounded-2xl border border-[#405B32] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#F8F1DF]">2. Giờ mở bán (0 - 23h):</span>
                      <span className="font-mono font-extrabold text-base text-[#F4C542] bg-[#283124] px-2.5 py-0.5 rounded-lg border border-[#405B32]">
                        {String(openingHour).padStart(2, '0')} giờ
                      </span>
                    </div>

                    {/* Range Slider */}
                    <input
                      type="range"
                      min={0}
                      max={23}
                      value={openingHour}
                      onChange={e => setOpeningHour(Number(e.target.value))}
                      className="w-full accent-[#F4C542] cursor-pointer"
                    />

                    {/* Quick Hour Shortcuts */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {[8, 9, 10, 13, 15, 20].map(h => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setOpeningHour(h)}
                          className={`px-2 py-1 rounded-md text-[10px] font-bold border cursor-pointer ${
                            openingHour === h
                              ? 'bg-[#F4C542] text-[#283124] border-[#F4C542]'
                              : 'bg-[#283124] text-[#C7DCAE] border-[#405B32] hover:text-white'
                          }`}
                        >
                          {h}:00
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* PHÚT (0 - 59) */}
                  <div className="bg-[#1D241A] p-3.5 rounded-2xl border border-[#405B32] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#F8F1DF]">3. Phút mở bán (0 - 59p):</span>
                      <span className="font-mono font-extrabold text-base text-[#F4C542] bg-[#283124] px-2.5 py-0.5 rounded-lg border border-[#405B32]">
                        {String(openingMinute).padStart(2, '0')} phút
                      </span>
                    </div>

                    {/* Range Slider */}
                    <input
                      type="range"
                      min={0}
                      max={59}
                      value={openingMinute}
                      onChange={e => setOpeningMinute(Number(e.target.value))}
                      className="w-full accent-[#F4C542] cursor-pointer"
                    />

                    {/* Quick Minute Shortcuts */}
                    <div className="flex gap-1 pt-1">
                      {[0, 15, 30, 45].map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setOpeningMinute(m)}
                          className={`flex-1 py-1 rounded-md text-[10px] font-bold border cursor-pointer ${
                            openingMinute === m
                              ? 'bg-[#F4C542] text-[#283124] border-[#F4C542]'
                              : 'bg-[#283124] text-[#C7DCAE] border-[#405B32] hover:text-white'
                          }`}
                        >
                          :{String(m).padStart(2, '0')}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* LIVE PREVIEW OF THE SCHEDULED TIME */}
                <div className="p-3.5 rounded-2xl bg-[#1D241A] border border-[#F4C542]/40 space-y-1.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-[#F4C542] animate-spin" />
                      <span className="text-xs font-bold text-[#F8F1DF]">
                        Lịch mở bán sẽ hiển thị:
                      </span>
                    </div>
                    <span className="font-mono font-extrabold text-xs sm:text-sm text-[#F4C542]">
                      {previewVnTime.saleScheduleDisplay}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#405B32]/40 text-[#C7DCAE]">
                    <span>{previewVnTime.saleReadableDisplay}</span>
                    <span className="font-bold text-[#F4C542]">
                      {previewCountdown.isUpcoming
                        ? `⏳ ${previewCountdown.detailedText}`
                        : '🟢 Đã đến giờ (Sẽ mở bán ngay)'}
                    </span>
                  </div>
                </div>

              </div>
            ) : (
              /* IMMEDIATE SALE NOTICE */
              <div className="p-4 rounded-2xl bg-[#1D241A] border border-[#6C9A4A]/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#6C9A4A]/30 border border-[#6C9A4A] flex items-center justify-center text-[#6C9A4A] shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-[#F8F1DF]">
                    Mở bán ngay lập tức
                  </h4>
                  <p className="text-xs text-[#C7DCAE]">
                    Sản phẩm sẽ có trạng thái <strong>"ĐANG MỞ BÁN"</strong> và khách hàng có thể đặt mua ngay sau khi đăng.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-[#283124] mb-1">
              Danh mục / Thể loại
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F8F1DF] border border-[#DED8C5] rounded-xl text-xs sm:text-sm text-[#283124] focus:outline-none focus:border-[#6C9A4A]"
            >
              <option value="Thủ công mỹ nghệ">Thủ công mỹ nghệ</option>
              <option value="Trang sức & Phụ kiện">Trang sức & Phụ kiện</option>
              <option value="Văn phòng phẩm">Văn phòng phẩm</option>
              <option value="Nghệ thuật & Tranh vẽ">Nghệ thuật & Tranh vẽ</option>
              <option value="Quà tặng kỷ niệm">Quà tặng kỷ niệm</option>
            </select>
          </div>

          {/* Multiple Delivery Time Slots */}
          <div className="p-4 rounded-2xl bg-[#F8F1DF]/70 border border-[#DED8C5] space-y-2.5">
            <label className="block text-xs font-bold text-[#283124]">
              Chọn các khung giờ nhận hàng tại trường <span className="text-[#A03045]">*</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DEFAULT_TIME_SLOTS.map(slot => {
                const isSelected = selectedPeriods.includes(slot);
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => togglePeriod(slot)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#6C9A4A] text-white border-[#405B32] shadow-xs'
                        : 'bg-[#FFFDF7] text-[#283124] border-[#DED8C5] hover:bg-[#F8F1DF]'
                    }`}
                  >
                    <span>{slot}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Time Slot Input */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Thêm khung giờ khác (ví dụ: 16:45 cổng chính)..."
                value={customSlot}
                onChange={e => setCustomSlot(e.target.value)}
                className="flex-1 px-3 py-2 bg-[#FFFDF7] border border-[#DED8C5] rounded-xl text-xs text-[#283124] focus:outline-none focus:border-[#6C9A4A]"
              />
              <button
                type="button"
                onClick={handleAddCustomSlot}
                className="px-3.5 py-2 bg-[#F8F1DF] hover:bg-[#DED8C5] border border-[#DED8C5] text-xs font-bold text-[#283124] rounded-xl cursor-pointer"
              >
                + Thêm
              </button>
            </div>
          </div>

          {/* Description & Story */}
          <div>
            <label className="block text-xs font-bold text-[#283124] mb-1">
              Mô tả & Câu chuyện sản phẩm
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={2000}
              placeholder="Chia sẻ chất liệu, kỹ thuật làm thủ công hoặc ý nghĩa độc bản của tác phẩm..."
              className="w-full px-3.5 py-2.5 bg-[#F8F1DF] border border-[#DED8C5] rounded-xl text-xs sm:text-sm text-[#283124] focus:outline-none focus:border-[#6C9A4A]"
            ></textarea>
          </div>

          {/* Submit CTA & Delete Product (if editing) */}
          <div className="pt-3 flex items-center justify-between gap-3 border-t border-[#DED8C5] flex-wrap">
            {productToEdit ? (
              showDeleteConfirm ? (
                <div className="flex items-center gap-2 bg-[#F7B7C4]/30 border border-[#A03045]/40 px-3 py-2 rounded-2xl animate-fade-in">
                  <span className="text-xs font-bold text-[#A03045]">Xác nhận xóa vĩnh viễn?</span>
                  <button
                    type="button"
                    onClick={() => {
                      deleteProduct(productToEdit.id);
                      setShowDeleteConfirm(false);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#A03045] hover:bg-[#802030] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    Xóa ngay
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2.5 py-1.5 rounded-xl bg-[#FFFDF7] text-[#707766] hover:bg-[#DED8C5] text-xs font-bold transition-all cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2.5 rounded-2xl bg-[#F7B7C4]/40 hover:bg-[#F7B7C4] text-[#A03045] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 border border-[#A03045]/20 active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Xóa sản phẩm này</span>
                </button>
              )
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-2xl bg-[#F8F1DF] hover:bg-[#DED8C5] text-xs font-bold text-[#707766] transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-2xl bg-[#6C9A4A] hover:bg-[#405B32] disabled:bg-[#6C9A4A]/50 disabled:cursor-wait text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer active:scale-98"
              >
                {isSubmitting ? 'Đang đăng sản phẩm...' : (productToEdit ? 'Lưu thay đổi' : 'Đăng sản phẩm độc bản')}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

const fs = require('fs');
let code = fs.readFileSync('src/components/ProductFormModal.tsx', 'utf8');

// 1. Add imageStatuses state
if (!code.includes("const [imageStatuses")) {
  code = code.replace(
    "const [images, setImages] = useState<string[]>([]);",
    "const [images, setImages] = useState<string[]>([]);\n  const [imageStatuses, setImageStatuses] = useState<Record<string, { status: 'processing' | 'ready' | 'error', errorMsg?: string }>>({});"
  );
}

// 2. Replace handleImageUpload
const startUpload = code.indexOf("const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {");
let endUpload = -1;
if (startUpload !== -1) {
  let braceCount = 0;
  let started = false;
  for (let i = startUpload; i < code.length; i++) {
    if (code[i] === '{') {
      braceCount++;
      started = true;
    } else if (code[i] === '}') {
      braceCount--;
    }
    if (started && braceCount === 0) {
      endUpload = i + 1;
      break;
    }
  }
}

if (startUpload !== -1 && endUpload !== -1) {
  const newUploadFn = `const processImage = (file: File, previewUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const originalBase64 = e.target?.result as string;
        
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const MAX_DIM = 2000;
            let width = img.width;
            let height = img.height;

            if (width > MAX_DIM || height > MAX_DIM) {
              if (width > height) {
                height = Math.round((height * MAX_DIM) / width);
                width = MAX_DIM;
              } else {
                width = Math.round((width * MAX_DIM) / height);
                height = MAX_DIM;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              throw new Error('Canvas không hỗ trợ.');
            }

            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, width, height);

            // Tầng 1: WebP
            let dataUrl = canvas.toDataURL('image/webp', 0.85);
            if (dataUrl && dataUrl.startsWith('data:image/webp')) {
               return resolve(dataUrl);
            }

            // Tầng 2: JPEG
            dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            if (dataUrl && dataUrl.startsWith('data:image/jpeg')) {
               return resolve(dataUrl);
            }

            throw new Error('Không thể nén ảnh tự động');
          } catch (err) {
             // Tầng 3: Ảnh gốc
             if (originalBase64.length > 850000) {
                reject(new Error('Ảnh gốc quá lớn (> 1MB), vui lòng chọn ảnh khác.'));
             } else {
                resolve(originalBase64); // Fallback
             }
          }
        };
        img.onerror = () => {
           if (originalBase64.length > 850000) {
              reject(new Error('Lỗi tải ảnh & dung lượng quá lớn.'));
           } else {
              resolve(originalBase64);
           }
        };
        // Use previewUrl for Image source to skip Base64 loading bottleneck
        img.src = previewUrl; 
      };
      reader.onerror = () => reject(new Error('Lỗi đọc file.'));
      // Only fallback to reader if Image src fails, but here we preload it to get original Base64 just in case.
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 4) {
      setErrorMessage('Mỗi sản phẩm chỉ được tải tối đa 4 ảnh.');
      e.target.value = '';
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    
    const fileList = Array.from(files);
    
    const newItems = fileList.map(file => {
       const preview = URL.createObjectURL(file);
       return { file, preview };
    });
    
    // 1. Thêm ảnh vào state để hiện Preview ngay lập tức
    setImages(prev => [...prev, ...newItems.map(item => item.preview)]);
    
    // 2. Đánh dấu trạng thái là processing
    setImageStatuses(prev => {
       const updated = { ...prev };
       newItems.forEach(item => {
          updated[item.preview] = { status: 'processing' };
       });
       return updated;
    });

    // 3. Xử lý bất đồng bộ từng file, nếu lỗi thì mark as error nhưng GIỮ preview
    newItems.forEach(async (item) => {
       try {
          if (!item.file.type.startsWith('image/')) {
             throw new Error('Tệp không phải hình ảnh.');
          }

          const base64 = await processImage(item.file, item.preview);
          
          setImages(prev => {
             const idx = prev.indexOf(item.preview);
             if (idx !== -1) {
                const updated = [...prev];
                updated[idx] = base64;
                return updated;
             }
             return prev;
          });

          setImageStatuses(prev => {
             const updated = { ...prev };
             delete updated[item.preview];
             updated[base64] = { status: 'ready' };
             return updated;
          });

       } catch (err: any) {
          // Bắt lỗi tại đây, nhưng KHÔNG xóa ảnh khỏi preview
          setImageStatuses(prev => ({
             ...prev,
             [item.preview]: { status: 'error', errorMsg: err.message || 'Lỗi xử lý ảnh' }
          }));
       }
    });

    e.target.value = ''; // Reset input
  };`;
  
  code = code.substring(0, startUpload) + newUploadFn + code.substring(endUpload);
}

// 3. Replace handleSubmit
const startSubmit = code.indexOf("const handleSubmit = async (e: React.FormEvent) => {");
let endSubmit = -1;
if (startSubmit !== -1) {
  let braceCount = 0;
  let started = false;
  for (let i = startSubmit; i < code.length; i++) {
    if (code[i] === '{') {
      braceCount++;
      started = true;
    } else if (code[i] === '}') {
      braceCount--;
    }
    if (started && braceCount === 0) {
      endSubmit = i + 1;
      break;
    }
  }
}

if (startSubmit !== -1 && endSubmit !== -1) {
  const newSubmit = `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      setErrorMessage('Vui lòng tải lên ít nhất 1 ảnh.');
      return;
    }
    
    for (const img of images) {
       const statusObj = imageStatuses[img];
       if (statusObj?.status === 'processing') {
          setErrorMessage('Vui lòng chờ ảnh xử lý xong...');
          return;
       }
       if (statusObj?.status === 'error') {
          setErrorMessage('Có ảnh bị lỗi. Vui lòng xóa ảnh bị lỗi và thử lại.');
          return;
       }
    }

    if (selectedPeriods.length === 0) {
      setErrorMessage('Vui lòng chọn hoặc thêm ít nhất 1 khung giờ nhận hàng.');
      return;
    }

    let totalLength = 0;
    images.forEach(img => {
      // Don't count blob URLs length against firestore limits, but they shouldn't reach here anyway
      if (!img.startsWith('blob:')) totalLength += img.length;
    });
    if (totalLength > 900000) {
      setErrorMessage('Tổng dung lượng ảnh quá lớn. Vui lòng xóa bớt ảnh.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    const numPrice = parseInt(price.replace(/\\D/g, ''), 10);
    const primaryImg = images[0];

    const finalTimestamp = isImmediateSale ? serverTime : computedTimestamp;
    const finalVnTime = formatVietnamTime(finalTimestamp);
    
    const finalOpeningAt = isImmediateSale 
      ? 'Đang mở bán'
      : \`\${finalVnTime.dateStr} – \${finalVnTime.hourMinuteStr}\`;

    try {
      if (productToEdit) {
        await updateProduct(productToEdit.id, {
          name: name.trim(),
          price: numPrice,
          description: description.trim(),
          category,
          openingAt: finalOpeningAt,
          openSaleTimestamp: finalTimestamp,
          images,
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
          images,
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
      console.error(err);
      setIsSubmitting(false);
      if (err.message && err.message.includes('payload')) {
         setErrorMessage('Dung lượng ảnh quá lớn. Firestore từ chối lưu dữ liệu.');
      } else {
         setErrorMessage('Lỗi khi lưu sản phẩm: ' + err.message);
      }
    }
  };`;
  code = code.substring(0, startSubmit) + newSubmit + code.substring(endSubmit);
}

// 4. Update JSX Rendering
const mapStart = code.indexOf("{images.map((img, idx) => (");
const mapEndStr = "</div>\n                ))}";
const mapEnd = code.indexOf(mapEndStr, mapStart) + mapEndStr.length;

if (mapStart !== -1 && mapEnd > mapStart) {
  const newMap = `{images.map((img, idx) => {
                  const statusObj = imageStatuses[img];
                  const isProcessing = statusObj?.status === 'processing';
                  const isError = statusObj?.status === 'error';
                  const errorMsg = statusObj?.errorMsg;

                  return (
                  <div
                    key={idx}
                    onClick={() => { if (!isProcessing && !isError) setPrimaryImageIndex(idx) }}
                    className={\`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all \${
                      primaryImageIndex === idx
                        ? 'border-[#6C9A4A] ring-2 ring-[#6C9A4A]/30'
                        : isError ? 'border-[#A03045]' : 'border-[#DED8C5] opacity-80 hover:opacity-100 cursor-pointer'
                    }\`}
                  >
                    <img src={img} alt="" className={\`w-full h-full object-cover \${isProcessing ? 'opacity-50 blur-sm' : ''} \${isError ? 'opacity-30 grayscale' : ''}\`} />
                    
                    {isProcessing && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-10">
                         <Loader2 className="w-5 h-5 text-white animate-spin mb-1" />
                         <span className="text-[9px] text-white font-bold text-center leading-tight px-1">Đang xử lý...</span>
                      </div>
                    )}

                    {isError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-1.5 bg-black/60 text-center z-10">
                         <span className="text-[10px] text-[#F7B7C4] font-bold leading-tight line-clamp-3">\${errorMsg || 'Lỗi'}</span>
                      </div>
                    )}
                    
                    {/* Primary Badge */}
                    {primaryImageIndex === idx && !isProcessing && !isError && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-[#6C9A4A] text-white text-[9px] font-bold z-20">
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
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 hover:bg-[#A03045] text-white flex items-center justify-center text-xs z-30"
                      title="Xóa ảnh"
                    >
                      ✕
                    </button>
                  </div>
                ) })}`;
  code = code.substring(0, mapStart) + newMap + code.substring(mapEnd);
}

// Write back
fs.writeFileSync('src/components/ProductFormModal.tsx', code);
console.log("Successfully patched ProductFormModal.tsx with braces parser!");

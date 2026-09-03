const fs = require('fs');
let code = fs.readFileSync('src/components/ProductFormModal.tsx', 'utf8');

// 1. Add imageStatuses state
const imageStateCode = "const [images, setImages] = useState<string[]>([]);";
if (!code.includes("const [imageStatuses")) {
  code = code.replace(
    imageStateCode,
    imageStateCode + "\n  const [imageStatuses, setImageStatuses] = useState<Record<string, { status: 'processing' | 'ready' | 'error', errorMsg?: string }>>({});"
  );
}

// 2. Rewrite handleImageUpload
const uploadStart = "const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {";
const uploadEnd = "e.target.value = ''; // Reset input\n    }\n  };";
const uIdx1 = code.indexOf(uploadStart);
const uIdx2 = code.indexOf(uploadEnd) + uploadEnd.length;

if (uIdx1 !== -1 && uIdx2 !== -1) {
  const newUploadFn = `const processImage = (file: File): Promise<string> => {
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
              throw new Error('Canvas context null');
            }

            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, width, height);

            // Tầng 1: Thử WebP
            let dataUrl = canvas.toDataURL('image/webp', 0.85);
            if (dataUrl && dataUrl.startsWith('data:image/webp')) {
               return resolve(dataUrl);
            }

            // Tầng 2: Thử JPEG
            dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            if (dataUrl && dataUrl.startsWith('data:image/jpeg')) {
               return resolve(dataUrl);
            }

            throw new Error('Tối ưu thất bại');
          } catch (err) {
             // Tầng 3: Fallback
             if (originalBase64.length > 850000) {
                reject(new Error('Ảnh gốc quá lớn, không thể sử dụng.'));
             } else {
                resolve(originalBase64);
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
        img.src = originalBase64;
      };
      reader.onerror = () => reject(new Error('Lỗi đọc file.'));
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
    
    const newItems = fileList.map(file => ({
       file,
       preview: URL.createObjectURL(file)
    }));
    
    // Thêm preview ngay lập tức
    setImages(prev => [...prev, ...newItems.map(item => item.preview)]);
    
    setImageStatuses(prev => {
       const updated = { ...prev };
       newItems.forEach(item => {
          updated[item.preview] = { status: 'processing' };
       });
       return updated;
    });

    // Chạy bất đồng bộ từng file, không block UI
    newItems.forEach(async (item) => {
       try {
          if (!item.file.type.startsWith('image/')) {
             throw new Error('Tệp không phải hình ảnh.');
          }

          const base64 = await processImage(item.file);
          
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
          setImageStatuses(prev => ({
             ...prev,
             [item.preview]: { status: 'error', errorMsg: err.message || 'Lỗi xử lý ảnh.' }
          }));
       }
    });

    e.target.value = ''; // Reset input
  };`;
  code = code.substring(0, uIdx1) + newUploadFn + code.substring(uIdx2);
}

// 3. Rewrite handleSubmit validation
const submitStart = "const handleSubmit = async (e: React.FormEvent) => {";
const submitBlobCheckStart = "// Kiểm tra xem có ảnh nào chưa nén xong hoặc nén thất bại không";
const submitBlobCheckEnd = "return;\n    }";
const sIdx1 = code.indexOf(submitBlobCheckStart);
const sIdx2 = code.indexOf(submitBlobCheckEnd) + submitBlobCheckEnd.length;

if (sIdx1 !== -1 && sIdx2 !== -1) {
  const newSubmitCheck = `// Kiểm tra trạng thái các ảnh
    for (const img of images) {
       const statusObj = imageStatuses[img];
       if (statusObj?.status === 'processing') {
          setErrorMessage('Vui lòng chờ ảnh xử lý xong...');
          return;
       }
       if (statusObj?.status === 'error') {
          setErrorMessage('Có ảnh bị lỗi. Vui lòng xóa ảnh bị lỗi trước khi đăng.');
          return;
       }
    }`;
  code = code.substring(0, sIdx1) + newSubmitCheck + code.substring(sIdx2);
}

// 4. Update JSX Rendering
const mapStart = "{images.map((img, idx) => (";
const mapEnd = "</div>\n                ))}";

const mapIdx1 = code.indexOf(mapStart);
const mapIdx2 = code.indexOf(mapEnd) + mapEnd.length;

if (mapIdx1 !== -1 && mapIdx2 !== -1) {
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
                         <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mb-1"></div>
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
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 hover:bg-[#A03045] text-white flex items-center justify-center text-xs z-20"
                      title="Xóa ảnh"
                    >
                      ✕
                    </button>
                  </div>
                )})}`;
  code = code.substring(0, mapIdx1) + newMap + code.substring(mapIdx2);
}

// Write back
fs.writeFileSync('src/components/ProductFormModal.tsx', code);
console.log("Successfully patched ProductFormModal.tsx");

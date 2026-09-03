const fs = require('fs');
let code = fs.readFileSync('src/components/ProductFormModal.tsx', 'utf8');

const oldHandleImageUploadStart = "const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {";
const oldHandleImageUploadEnd = "e.target.value = ''; // Reset input\n    }\n  };";

const startUploadIdx = code.indexOf(oldHandleImageUploadStart);
const endUploadIdx = code.indexOf(oldHandleImageUploadEnd) + oldHandleImageUploadEnd.length;

if (startUploadIdx !== -1 && endUploadIdx !== -1) {
  const newHandleImageUpload = `const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 4) {
      setErrorMessage('Bạn chỉ có thể tải lên tối đa 4 ảnh cho mỗi sản phẩm.');
      e.target.value = '';
      return;
    }

    setIsUploadingImage(true);
    setErrorMessage('');
    setSuccessMessage('');
    const fileList = Array.from(files);

    try {
      const compressedImages = await Promise.all(
        fileList.map((file) => {
          return new Promise<string>((resolve, reject) => {
            if (!file.type.startsWith('image/')) {
               reject(new Error('File không phải định dạng ảnh.'));
               return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
              const img = new Image();
              img.src = event.target?.result as string;
              img.onload = () => {
                const canvas = document.createElement('canvas');
                // Tối đa 2000px, giữ nguyên tỷ lệ, không phóng to
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
                if (ctx) {
                  // Đổ nền trắng (trường hợp ảnh PNG trong suốt)
                  ctx.fillStyle = '#FFFFFF';
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                  ctx.drawImage(img, 0, 0, width, height);
                  
                  // Ưu tiên WebP, chất lượng 85%
                  const dataUrl = canvas.toDataURL('image/webp', 0.85);
                  resolve(dataUrl);
                } else {
                  reject(new Error('Không thể tạo canvas để xử lý ảnh.'));
                }
              };
              img.onerror = () => reject(new Error('Lỗi không thể đọc file ảnh.'));
            };
            reader.onerror = () => reject(new Error('Lỗi đọc file.'));
          });
        })
      );
      
      const newImages = [...images, ...compressedImages];
      // Kiểm tra tổng dung lượng sau khi nén
      let totalLength = 0;
      newImages.forEach(img => totalLength += img.length);
      
      // Giới hạn 1MB = ~1,048,576 bytes. Để an toàn ta giới hạn tổng string length = 850,000 (~630KB)
      if (totalLength > 850000) {
         setErrorMessage('Tổng dung lượng ảnh vẫn quá lớn (sắp vượt 1MB). Vui lòng chọn ảnh nhẹ hơn.');
      } else {
         setImages(newImages);
         setSuccessMessage('Đã tối ưu ảnh thành công.');
      }
      
    } catch (error: any) {
      setErrorMessage(error.message || 'Lỗi xử lý ảnh.');
    } finally {
      setIsUploadingImage(false);
      e.target.value = ''; // Reset input
    }
  };`;
  
  code = code.substring(0, startUploadIdx) + newHandleImageUpload + code.substring(endUploadIdx);
}

const oldHandleSubmitStart = "const handleSubmit = async (e: React.FormEvent) => {";
const oldHandleSubmitEnd = "setErrorMessage('Lỗi khi lưu sản phẩm: ' + err.message);\n      }\n    }\n  };";

const submitStartIdx = code.indexOf(oldHandleSubmitStart);
const submitEndIdx = code.indexOf(oldHandleSubmitEnd) + oldHandleSubmitEnd.length;

if (submitStartIdx !== -1 && submitEndIdx !== -1) {
  const newHandleSubmit = `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      setErrorMessage('Vui lòng tải lên ít nhất 1 ảnh.');
      return;
    }
    if (selectedPeriods.length === 0) {
      setErrorMessage('Vui lòng chọn hoặc thêm ít nhất 1 khung giờ nhận hàng.');
      return;
    }

    let totalLength = 0;
    images.forEach(img => totalLength += img.length);
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
  
  code = code.substring(0, submitStartIdx) + newHandleSubmit + code.substring(submitEndIdx);
}

fs.writeFileSync('src/components/ProductFormModal.tsx', code);
console.log("Updated both functions successfully.");

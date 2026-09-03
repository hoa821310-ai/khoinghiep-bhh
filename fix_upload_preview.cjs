const fs = require('fs');
let code = fs.readFileSync('src/components/ProductFormModal.tsx', 'utf8');

const startUploadIdx = code.indexOf("const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {");
const endUploadString = "e.target.value = ''; // Reset input\n    }\n  };";
const endUploadIdx = code.indexOf(endUploadString) + endUploadString.length;

if (startUploadIdx !== -1 && endUploadIdx !== -1) {
  const newFunction = `const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 4) {
      setErrorMessage('Mỗi sản phẩm chỉ được tải tối đa 4 ảnh.');
      e.target.value = '';
      return;
    }

    setIsUploadingImage(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    const fileList = Array.from(files);
    
    // Tạo preview URL ngay lập tức
    const newPreviewUrls = fileList.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...newPreviewUrls]);

    try {
      const compressedImages = await Promise.all(
        fileList.map((file, index) => {
          return new Promise<{ preview: string, base64: string }>((resolve, reject) => {
            if (!file.type.startsWith('image/')) {
               reject(new Error('File không phải định dạng ảnh.'));
               return;
            }
            
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
                  throw new Error('Trình duyệt không hỗ trợ xử lý ảnh.');
                }

                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, width, height);
                
                let dataUrl = canvas.toDataURL('image/webp', 0.85);
                if (!dataUrl.startsWith('data:image/webp')) {
                  dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                }
                
                if (!dataUrl || dataUrl === 'data:,' || !dataUrl.startsWith('data:image/')) {
                   throw new Error('Lỗi chuyển đổi ảnh.');
                }

                resolve({ preview: newPreviewUrls[index], base64: dataUrl });
              } catch (err) {
                reject(err);
              }
            };
            img.onerror = () => {
              reject(new Error('Không thể đọc file ảnh này.'));
            };
            // Sử dụng luôn preview URL làm source cho Image, nhanh hơn rất nhiều so với FileReader
            img.src = newPreviewUrls[index];
          });
        })
      );
      
      // Cập nhật lại state images bằng các base64 đã xử lý xong
      setImages(prev => {
         const updated = [...prev];
         compressedImages.forEach(item => {
            const idx = updated.indexOf(item.preview);
            if (idx !== -1) {
               updated[idx] = item.base64;
            }
         });
         return updated;
      });

      // Kiểm tra dung lượng an toàn (vẫn làm sau khi nén xong)
      setImages(currentImages => {
          let totalLength = 0;
          currentImages.forEach(img => {
            if (img.startsWith('data:')) totalLength += img.length;
          });
          if (totalLength > 850000) {
            setErrorMessage('Tổng dung lượng ảnh vẫn quá lớn (sắp vượt 1MB). Vui lòng chọn ảnh nhẹ hơn.');
          } else {
            setSuccessMessage('Đã tối ưu ảnh thành công.');
          }
          return currentImages;
      });

    } catch (error: any) {
      setErrorMessage(error.message || 'Không thể tối ưu ảnh này, nhưng ảnh vẫn được giữ lại.');
    } finally {
      setIsUploadingImage(false);
      e.target.value = ''; // Reset input
    }
  };`;
  
  code = code.substring(0, startUploadIdx) + newFunction + code.substring(endUploadIdx);
  fs.writeFileSync('src/components/ProductFormModal.tsx', code);
  console.log("Updated handleImageUpload successfully.");
} else {
  console.log("Could not find boundaries for handleImageUpload.");
}

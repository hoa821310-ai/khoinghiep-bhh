const fs = require('fs');
let code = fs.readFileSync('src/components/ProductFormModal.tsx', 'utf8');

// The exact current implementation of handleImageUpload
const regex = /const handleImageUpload = async \[\s\S\]*?e\.target\.value = ''; \/\/ Reset input\n    }\n  };/s;

// We will replace it using a more robust regex just to be sure
const oldCodeStart = "const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {";
const oldCodeEnd = "e.target.value = ''; // Reset input\n    }\n  };";

const startIndex = code.indexOf(oldCodeStart);
const endIndex = code.indexOf(oldCodeEnd) + oldCodeEnd.length;

if (startIndex !== -1 && endIndex !== -1) {
  const newCode = `const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 5) {
      setErrorMessage('Chỉ được tải tối đa 5 ảnh cho mỗi sản phẩm.');
      e.target.value = '';
      return;
    }

    setIsUploadingImage(true);
    setErrorMessage('');
    const fileList = Array.from(files);

    try {
      const compressedImages = await Promise.all(
        fileList.map((file) => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
              const img = new Image();
              img.src = event.target?.result as string;
              img.onload = () => {
                const canvas = document.createElement('canvas');
                // Nén mạnh hơn để chắc chắn không vượt quá 1MB của Firestore
                const MAX_WIDTH = 500;
                const MAX_HEIGHT = 500;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                  if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                  }
                } else {
                  if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                  }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  // Đổ nền trắng (trường hợp ảnh PNG trong suốt bị đen khi chuyển sang JPEG)
                  ctx.fillStyle = '#FFFFFF';
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                  ctx.drawImage(img, 0, 0, width, height);
                  
                  // Chuyển sang JPEG, chất lượng 50%
                  const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
                  resolve(dataUrl);
                } else {
                  reject(new Error('Không thể tạo canvas.'));
                }
              };
              img.onerror = () => reject(new Error('Lỗi load ảnh vào trình duyệt.'));
            };
            reader.onerror = () => reject(new Error('Lỗi đọc file.'));
          });
        })
      );
      
      setImages(prev => [...prev, ...compressedImages]);
    } catch (error: any) {
      setErrorMessage(error.message || 'Lỗi xử lý ảnh.');
    } finally {
      setIsUploadingImage(false);
      e.target.value = ''; // Reset input
    }
  };`;
  
  code = code.substring(0, startIndex) + newCode + code.substring(endIndex);
  fs.writeFileSync('src/components/ProductFormModal.tsx', code);
  console.log("Updated handleImageUpload successfully");
} else {
  console.log("Could not find the function to replace.");
}

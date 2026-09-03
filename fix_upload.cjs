const fs = require('fs');

let code = fs.readFileSync('src/components/ProductFormModal.tsx', 'utf8');

const oldCode = `  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    const fileList = Array.from(files);
    let loadedCount = 0;

    fileList.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
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
            ctx.drawImage(img, 0, 0, width, height);
            // Nén ảnh xuống chuẩn JPEG chất lượng 70% để tiết kiệm dung lượng Firestore
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            setImages(prev => [...prev, dataUrl]);
          }
          
          loadedCount++;
          if (loadedCount >= fileList.length) {
            setIsUploadingImage(false);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = () => {
        setErrorMessage('Lỗi đọc file ảnh');
        loadedCount++;
        if (loadedCount >= fileList.length) {
          setIsUploadingImage(false);
        }
      }
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };`;

const newCode = `  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

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
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
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
                  ctx.drawImage(img, 0, 0, width, height);
                  // Compress to JPEG 70%
                  const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
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

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/components/ProductFormModal.tsx', code);

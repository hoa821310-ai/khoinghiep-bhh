const fs = require('fs');

let code = fs.readFileSync('src/components/ProductFormModal.tsx', 'utf8');

const oldCode = `  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    const fileList = Array.from(files);
    let loadedCount = 0;

    import('firebase/storage').then(({ ref, uploadBytes, getDownloadURL }) => {
      import('../firebase').then(({ storage }) => {
        fileList.forEach(async (file: File) => {
          try {
            const fileRef = ref(storage, \`products/\${Date.now()}_\${file.name}\`);
            const snapshot = await uploadBytes(fileRef, file);
            const url = await getDownloadURL(snapshot.ref);
            setImages(prev => [...prev, url]);
          } catch (error: any) {
            setErrorMessage('Lỗi tải ảnh lên: ' + error.message);
          } finally {
            loadedCount++;
            if (loadedCount >= fileList.length) {
              setIsUploadingImage(false);
            }
          }
        });
      });
    });

    e.target.value = '';
  };`;

const newCode = `  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

if (code.includes("import('firebase/storage')")) {
  code = code.replace(oldCode, newCode);
  fs.writeFileSync('src/components/ProductFormModal.tsx', code);
  console.log("Successfully reverted to Base64 with compression");
} else {
  console.log("Could not find the firebase storage block.");
}

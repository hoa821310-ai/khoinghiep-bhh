const fs = require('fs');
let code = fs.readFileSync('src/components/ProductFormModal.tsx', 'utf8');

// Replace the handleImageUpload function body
const oldHandleImageUpload = `  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    const fileList = Array.from(files);
    let loadedCount = 0;

    fileList.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const resultStr = event.target.result as string;
          setImages(prev => [...prev, resultStr]);
        }
        loadedCount++;
        if (loadedCount >= fileList.length) {
          setIsUploadingImage(false);
        }
      };
      reader.onerror = () => {
        setErrorMessage('Không thể đọc tệp ảnh. Vui lòng thử lại với định dạng khác.');
        loadedCount++;
        if (loadedCount >= fileList.length) {
          setIsUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input value so user can upload the same file again if desired
    e.target.value = '';
  };`;

const newHandleImageUpload = `  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

code = code.replace(oldHandleImageUpload, newHandleImageUpload);
fs.writeFileSync('src/components/ProductFormModal.tsx', code);

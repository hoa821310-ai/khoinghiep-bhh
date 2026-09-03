const fs = require('fs');
let code = fs.readFileSync('src/components/ProductFormModal.tsx', 'utf8');

const start = "const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {";
const endString = "e.target.value = ''; // Reset input\n  };";

const startIdx = code.indexOf(start);
const endIdx = code.indexOf(endString) + endString.length;

if (startIdx !== -1 && endIdx !== -1) {
  const newUpload = `const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("=== FILE UPLOAD STARTED ===");
    const files = e.target.files;
    if (!files || files.length === 0) {
      console.log("No files selected.");
      return;
    }

    if (images.length + files.length > 4) {
      setErrorMessage('Mỗi sản phẩm chỉ được tải tối đa 4 ảnh.');
      e.target.value = '';
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    
    const fileList = Array.from(files);
    console.log("Selected files:", fileList.map(f => f.name + ' - ' + f.size + ' bytes'));
    
    const newItems = fileList.map(file => {
       const preview = URL.createObjectURL(file);
       console.log("Generated Object URL:", preview);
       return { file, preview };
    });
    
    // 1. Thêm ảnh vào state để hiện Preview ngay lập tức
    console.log("Adding previews to state...");
    setImages(prev => {
       const updated = [...prev, ...newItems.map(item => item.preview)];
       console.log("New images array:", updated);
       return updated;
    });
    
    // 2. Đánh dấu trạng thái là processing
    setImageStatuses(prev => {
       const updated = { ...prev };
       newItems.forEach(item => {
          updated[item.preview] = { status: 'processing' };
       });
       return updated;
    });

    console.log("=== BYPASSING OPTIMIZATION FOR DEBUGGING ===");
    
    e.target.value = ''; // Reset input
  };`;
  
  code = code.substring(0, startIdx) + newUpload + code.substring(endIdx);
  fs.writeFileSync('src/components/ProductFormModal.tsx', code);
  console.log("Successfully replaced handleImageUpload with debug version.");
} else {
  console.log("Could not find start/end bounds.", startIdx, endIdx);
}

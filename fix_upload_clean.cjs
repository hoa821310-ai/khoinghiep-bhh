const fs = require('fs');
let code = fs.readFileSync('src/components/ProductFormModal.tsx', 'utf8');

const start = "const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {";
const endString = "e.target.value = ''; // Reset input\n  };";

const startIdx = code.indexOf(start);
const endIdx = code.indexOf(endString) + endString.length;

if (startIdx !== -1 && endIdx !== -1) {
  const newUpload = `const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("=== FILE UPLOAD EVENT TRIGGERED ===");
    const files = e.target.files;
    if (!files || files.length === 0) {
      console.log("No files");
      return;
    }

    const fileList = Array.from(files);
    console.log("Files:", fileList);
    
    // Tạo Object URL cho preview
    const previews = fileList.map(file => URL.createObjectURL(file));
    console.log("Previews generated:", previews);
    
    // Thêm ngay vào state
    setImages(prev => {
      const next = [...prev, ...previews];
      console.log("Setting new images state:", next);
      return next;
    });

    // Thêm trạng thái ảo (không xử lý gì để test render)
    setImageStatuses(prev => {
       const next = { ...prev };
       previews.forEach(p => { next[p] = { status: 'ready' }; });
       return next;
    });

    e.target.value = '';
  };`;
  
  code = code.substring(0, startIdx) + newUpload + code.substring(endIdx);
  fs.writeFileSync('src/components/ProductFormModal.tsx', code);
  console.log("Replaced with ultra-clean upload handler");
} else {
  console.log("Failed to find bounds for handleImageUpload");
}

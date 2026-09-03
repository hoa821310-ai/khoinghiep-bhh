const fs = require('fs');
let code = fs.readFileSync('src/components/ProductFormModal.tsx', 'utf8');

code = code.replace("Đang xử lý tải ảnh lên...", "Đang tối ưu ảnh...");

fs.writeFileSync('src/components/ProductFormModal.tsx', code);
console.log("Updated uploading text");

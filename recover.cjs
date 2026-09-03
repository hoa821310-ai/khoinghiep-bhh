const fs = require('fs');
const code = fs.readFileSync('src/components/ProductFormModal.tsx', 'utf8');

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

const parts = code.split(newSubmitCheck);
if (parts.length === 2) {
  const partA = parts[0];
  const partB = parts[1];
  
  // Find where partB starts in the original partA
  // partB starts with the code after the first `return;\n    }`
  // Let's find the first `return;\n    }` in partA.
  const returnStr = "return;\n    }";
  const splitIdx = partA.indexOf(returnStr) + returnStr.length;
  
  const originalCode = partA.substring(0, splitIdx) + partB;
  fs.writeFileSync('src/components/ProductFormModal.tsx', originalCode);
  console.log("Recovered original file!");
} else {
  console.log("Could not split by newSubmitCheck", parts.length);
}

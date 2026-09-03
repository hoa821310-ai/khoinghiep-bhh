const fs = require('fs');
let code = fs.readFileSync('src/components/ProductFormModal.tsx', 'utf8');

// Find the FIRST processImage
const firstProcessStart = code.indexOf("const processImage = (file: File): Promise<string> => {");
if (firstProcessStart !== -1) {
  // Find the NEXT processImage, which was inserted by my recent script
  const secondProcessStart = code.indexOf("const processImage = (file: File, previewUrl: string): Promise<string> => {");
  
  if (secondProcessStart !== -1 && secondProcessStart > firstProcessStart) {
    // Delete everything from firstProcessStart up to secondProcessStart
    code = code.substring(0, firstProcessStart) + code.substring(secondProcessStart);
    fs.writeFileSync('src/components/ProductFormModal.tsx', code);
    console.log("Removed duplicate processImage block");
  } else {
     console.log("Second processImage not found");
  }
}

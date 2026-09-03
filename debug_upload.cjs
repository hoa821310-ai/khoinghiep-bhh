const fs = require('fs');
let code = fs.readFileSync('src/components/ProductFormModal.tsx', 'utf8');

const start = "const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {";
const replacement = `const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("FILE INPUT TRIGGERED");
    const files = e.target.files;
    if (files) {
       console.log("Files:", files.length);
       for (let i = 0; i < files.length; i++) {
          console.log(files[i].name, files[i].type, files[i].size);
       }
    } else {
       console.log("No files found on event");
    }`;

if (code.includes(start)) {
   code = code.replace(start, replacement);
   fs.writeFileSync('src/components/ProductFormModal.tsx', code);
   console.log("Added debug logs to handleImageUpload");
} else {
   console.log("Failed to find handleImageUpload");
}

const fs = require('fs');
let code = fs.readFileSync('src/components/ProductFormModal.tsx', 'utf8');

const isSubmittingState = "const [isSubmitting, setIsSubmitting] = useState(false);";
if (!code.includes(isSubmittingState)) {
  code = code.replace("const [errorMessage, setErrorMessage] = useState('');", `const [errorMessage, setErrorMessage] = useState('');\n  ${isSubmittingState}`);
}

const submitButtonRegex = /<button\s+type="submit"\s+className="[^"]+"\s*>\s*\{productToEdit \? 'Lưu thay đổi' : 'Đăng sản phẩm độc bản'\}\s*<\/button>/s;
if (code.match(submitButtonRegex)) {
  const newSubmitBtn = `<button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-2xl bg-[#6C9A4A] hover:bg-[#405B32] disabled:bg-[#6C9A4A]/50 disabled:cursor-wait text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer active:scale-98"
              >
                {isSubmitting ? 'Đang đăng sản phẩm...' : (productToEdit ? 'Lưu thay đổi' : 'Đăng sản phẩm độc bản')}
              </button>`;
  code = code.replace(submitButtonRegex, newSubmitBtn);
}

fs.writeFileSync('src/components/ProductFormModal.tsx', code);
console.log("Updated isSubmitting");

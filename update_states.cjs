const fs = require('fs');
let code = fs.readFileSync('src/components/ProductFormModal.tsx', 'utf8');

const errorMessageState = "const [errorMessage, setErrorMessage] = useState('');";
if (code.includes(errorMessageState) && !code.includes("const [successMessage, setSuccessMessage]")) {
  code = code.replace(errorMessageState, `${errorMessageState}\n  const [successMessage, setSuccessMessage] = useState('');`);
}

const errorMessageUI = `{errorMessage && (
          <div className="mb-4 p-3 bg-[#F7B7C4]/30 border border-[#F7B7C4] rounded-2xl flex items-center gap-2 text-xs text-[#A03045] font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}`;

const successMessageUI = `{successMessage && (
          <div className="mb-4 p-3 bg-[#C7DCAE]/30 border border-[#6C9A4A] rounded-2xl flex items-center gap-2 text-xs text-[#405B32] font-bold">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}`;

if (code.includes(errorMessageUI) && !code.includes("successMessage &&")) {
  code = code.replace(errorMessageUI, `${errorMessageUI}\n        ${successMessageUI}`);
}

fs.writeFileSync('src/components/ProductFormModal.tsx', code);
console.log("Updated states and UI");

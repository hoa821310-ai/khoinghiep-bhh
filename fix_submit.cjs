const fs = require('fs');
let code = fs.readFileSync('src/components/ProductFormModal.tsx', 'utf8');

const submitStartIdx = code.indexOf("const handleSubmit = async (e: React.FormEvent) => {");
const submitEndString = "setErrorMessage('Lỗi khi lưu sản phẩm: ' + err.message);\n      }\n    }\n  };";
const submitEndIdx = code.indexOf(submitEndString) + submitEndString.length;

if (submitStartIdx !== -1 && submitEndIdx !== -1) {
  const newHandleSubmit = `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      setErrorMessage('Vui lòng tải lên ít nhất 1 ảnh.');
      return;
    }
    
    // Kiểm tra xem có ảnh nào chưa nén xong hoặc nén thất bại không (có link dạng blob:)
    if (images.some(img => img.startsWith('blob:'))) {
      setErrorMessage('Có ảnh chưa được xử lý xong hoặc bị lỗi định dạng. Vui lòng xóa ảnh bị lỗi và thử lại.');
      return;
    }

    if (selectedPeriods.length === 0) {
      setErrorMessage('Vui lòng chọn hoặc thêm ít nhất 1 khung giờ nhận hàng.');
      return;
    }

    let totalLength = 0;
    images.forEach(img => totalLength += img.length);
    if (totalLength > 900000) {
      setErrorMessage('Tổng dung lượng ảnh quá lớn. Vui lòng xóa bớt ảnh.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    const numPrice = parseInt(price.replace(/\\D/g, ''), 10);
    const primaryImg = images[0];

    const finalTimestamp = isImmediateSale ? serverTime : computedTimestamp;
    const finalVnTime = formatVietnamTime(finalTimestamp);
    
    const finalOpeningAt = isImmediateSale 
      ? 'Đang mở bán'
      : \`\${finalVnTime.dateStr} – \${finalVnTime.hourMinuteStr}\`;

    try {
      if (productToEdit) {
        await updateProduct(productToEdit.id, {
          name: name.trim(),
          price: numPrice,
          description: description.trim(),
          category,
          openingAt: finalOpeningAt,
          openSaleTimestamp: finalTimestamp,
          images,
          imageUrl: primaryImg,
          deliveryPeriods: selectedPeriods,
          deliveryPeriod: selectedPeriods[0]
        });
      } else {
        await addProduct({
          name: name.trim(),
          price: numPrice,
          description: description.trim(),
          category,
          openingAt: finalOpeningAt,
          openSaleTimestamp: finalTimestamp,
          images,
          imageUrl: primaryImg,
          deliveryPeriods: selectedPeriods,
          deliveryPeriod: selectedPeriods[0]
        });
      }
      setSuccessMessage('Đăng sản phẩm thành công.');
      setTimeout(() => {
        onClose();
        setIsSubmitting(false);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setIsSubmitting(false);
      if (err.message && err.message.includes('payload')) {
         setErrorMessage('Dung lượng ảnh quá lớn. Firestore từ chối lưu dữ liệu.');
      } else {
         setErrorMessage('Lỗi khi lưu sản phẩm: ' + err.message);
      }
    }
  };`;
  
  code = code.substring(0, submitStartIdx) + newHandleSubmit + code.substring(submitEndIdx);
  fs.writeFileSync('src/components/ProductFormModal.tsx', code);
  console.log("Updated handleSubmit successfully.");
} else {
  console.log("Could not find boundaries for handleSubmit.");
}

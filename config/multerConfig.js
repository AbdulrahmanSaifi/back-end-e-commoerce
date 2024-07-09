const multer = require('multer');

// إعداد خيارات التخزين
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // الحد الأقصى لحجم الملف 10MB
  },
  // fileFilter: (req, file, cb) => {
  //   // التحقق من نوع الملف هنا (مثال: الصور فقط)
  //   if (!file.mimetype.startsWith('image/')) {
  //     return cb(new Error('الملفات المسموح بها هي الصور فقط'), false);
  //   }
  //   cb(null, true);
  // }
  // تم ايقاف فلترة المنتجات لسبب ظهور بعض  المشاكل
});

module.exports = upload;

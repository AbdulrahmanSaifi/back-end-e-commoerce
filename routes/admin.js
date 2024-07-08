const express = require('express');
const router = express.Router();
const { addProduct,deletedProduct } = require('../controllers/adminControl');
const upload = require('../config/multerConfig');

router.get('/admin', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/product/add', upload.array('images', 5), addProduct); // دعم حتى 5 صور في الطلب الواحد
router.delete('/product/delete',deletedProduct)

module.exports = router;

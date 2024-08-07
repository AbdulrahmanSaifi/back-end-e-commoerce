const express = require('express');
const router = express.Router();
const { addProduct, deletedProduct, editProduct, editUser,deleteUser,getListUsers,getListProduct } = require('../controllers/adminControl');
const upload = require('../config/multerConfig');

router.get('/admin', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/product/get',getListProduct)

router.post('/product/add', upload.array('images', 5), addProduct); // دعم حتى 5 صور في الطلب الواحد

router.delete('/product/delete', deletedProduct)

router.put('/product/edit', upload.array('images', 5), editProduct)

router.get('/user/get',  getListUsers)

router.put('/user/edit', editUser)

router.delete('/user/delete' , deleteUser)


module.exports = router;

var express = require('express');
var router = express.Router();
const { createUser, loginUser, createAdmin, loginAdmin } = require('../controllers/auth')
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/user/register', createUser)
router.post('/user/login', loginUser)

router.post('/admin/register', createAdmin)
router.post('/admin/login', loginAdmin)



module.exports = router;

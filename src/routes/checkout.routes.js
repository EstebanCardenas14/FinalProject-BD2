const {Router} = require('express');
const router = Router()

const {create} = require('../controllers/checkout.controller');

router.post('/create/:carrito_id', create);

module.exports = router;

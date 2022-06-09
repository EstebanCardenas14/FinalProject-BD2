const {Router} = require('express');
const router = Router();

const {create,checkout} = require('../controller/carrito.controller');

router.post('/create', create);
router.post('/checkout', checkout);
module.exports = router;
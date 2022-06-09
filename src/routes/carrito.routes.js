const {Router} = require('express');
const router = Router();

const {create,addProducts,getCarrito,checkout} = require('../controller/carrito.controller');

router.post('/create', create);
router.post('/addProducts/:carrito_id', addProducts);
router.get('/getCarrito/:carrito_id', getCarrito);
router.post('/checkout/:carrito_id', checkout);
module.exports = router;
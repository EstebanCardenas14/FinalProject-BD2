const {Router} = require('express');
const router = Router();

const {create,deleteCarrito,addProduct,deleteProduct,updateCarrito,getCarrito} = require('../controllers/carrito.controller');

router.post('/create', create);
router.delete('/remove/:carrito_id', deleteCarrito);
router.post('/addProduct/:carrito_id', addProduct);
router.delete('/removeProduct/:carrito_id', deleteProduct);
router.put('/update/:carrito_id', updateCarrito);
router.get('/getCarrito/:carrito_id', getCarrito);

module.exports = router;
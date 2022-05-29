const {Router} = require('express');
const router = Router();

const {redisConnection,getAll,addToCarrito,getCarritoo} = require('../database/redis-connection');

router.get('/getAll', getAll);
router.post('/addToCarrito/:carrito_id', addToCarrito);
router.get('/getCarritoo/:carrito_id', getCarritoo);


module.exports = router;
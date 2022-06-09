const {Router} = require('express');
const router = Router();

const { uploadImg, create,  getProductById,  getAll,  addCategories, getProductsByCategory,productosProveedor} = require('../controller/producto.controller');

router.post('/img', uploadImg);
router.post('/create/:proveedor_id', create);
router.post('/addCategory/:producto_id', addCategories);
router.get('/category/:categoria_id', getProductsByCategory);
router.get('/getAll', getAll);
router.get('/getById/:id', getProductById);
router.get('/proveedor/:proveedor_id', productosProveedor);

module.exports = router;



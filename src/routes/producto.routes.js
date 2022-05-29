const {Router} = require('express');
const router = Router();

const {uploadImg, create,getAll,updateById,deleteById,getProductById, addCategories,getProductsByCategory,getProductByTitle} = require('../controllers/producto.controller');

router.post('/img', uploadImg);
router.post('/create/:proveedor_id', create);
router.post('/addCategory/:producto_id', addCategories);
router.get('/category/:categoria_id', getProductsByCategory);
router.get('/getAll', getAll);
router.get('/getByTitle/:title', getProductByTitle);
router.get('/getById/:id', getProductById);
router.delete('/remove/:id', deleteById);
router.put('/update/:id', updateById);

module.exports = router;



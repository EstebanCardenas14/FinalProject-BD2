const {Router} = require('express');
const router = Router();

const { create,getAll,deleteById,getById,updateById} = require('../controller/proveedor.controller');

router.post('/create', create);
router.get('/getAll', getAll);
router.get('/getById/:id', getById);
router.put('/update/:id', updateById);
router.delete('/remove/:id', deleteById);

module.exports = router;
 
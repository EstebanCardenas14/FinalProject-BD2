const {Router} = require('express');
const router = Router();
const { validarArchivo } = require('../middlewares');
const { create,getAll,update,deleteById,getById,uploadImg} = require('../controller/marca.controller');

router.post('/create', create);
router.get('/getAll', getAll);
router.get('/getById/:id', getById);
router.delete('/remove/:id', deleteById);
router.put('/update/:id', update);
router.post('/img', validarArchivo ,uploadImg);

module.exports = router;
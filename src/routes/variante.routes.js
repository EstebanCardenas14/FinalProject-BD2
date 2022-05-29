const {Router} = require('express');
const router = Router();

const { create,uploadImg,getById,getAll,update,deleteById,getVariant,getVariantes } = require('../controllers/variante.controller');

router.post('/create/:producto_id', create);
router.post('/img/:variante_id', uploadImg);
router.get('/getVariant/:variante_id', getVariant);
router.get('/getProducVariants/:producto_id', getVariantes);
router.get('/getById/:id', getById);
router.get('/getAll', getAll);
router.delete('/deleteById/:id', deleteById);
router.put('/update/:id', update);

module.exports = router;
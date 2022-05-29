const {Router} = require('express');
const router = Router();

const { create,getAll,updateById,deleteById,getById} = require('../controllers/comprador.controller');

router.post('/create', create);
router.get('/getAll', getAll);
router.get('/getById/:id', getById);
router.delete('/remove/:id', deleteById);
router.put('/update/:id', updateById);

module.exports = router;
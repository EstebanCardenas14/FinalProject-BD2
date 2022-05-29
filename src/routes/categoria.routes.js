const {Router} = require('express');
const router = Router()

const { create,getAll,update,deleteById,getById} = require('../controllers/categoria.controller');

router.post('/create', create);
router.get('/getAll', getAll);
router.get('/getById/:id', getById);
router.delete('/remove/:id', deleteById);
router.put('/update/:id', update);

module.exports = router;

const {Router} = require('express');
const router = Router();

const { create,getById,getAll,remove,update } = require('../controllers/rol.controller');

router.post('/create', create);
router.get('/getById/:id', getById);
router.get('/getAll', getAll);
router.delete('/remove/:id', remove);
router.put('/update/:id', update);

module.exports = router;
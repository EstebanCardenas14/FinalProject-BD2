const {Router} = require('express');
const router = Router();

const {create, update, remove, getAll} = require('../controllers/user.controller');

router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);
router.get('/', getAll);

module.exports = router;
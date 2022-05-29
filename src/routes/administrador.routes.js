const {Router} = require('express');
const router = Router();

const { create} = require('../controllers/administrador.controller');

router.post('/create', create);

module.exports = router;
 
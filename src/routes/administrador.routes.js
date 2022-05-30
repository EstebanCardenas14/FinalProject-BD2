const {Router} = require('express');
const router = Router();

const {create} = require('../controller/administrador.controller');

router.post('/create', create);

module.exports = router;
 
const {Router} = require('express');
const router = Router();

const { create} = require('../controller/comprador.controller');

router.post('/create', create);

module.exports = router;
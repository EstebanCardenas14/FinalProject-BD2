const validarArchivo = (req, res = response, next) => {

    if (!req.files || Object.keys(req.files).length === 0 || !req.files.archivo) {
        return res.status(400).json({
            ok: false,
            message: 'No se ha seleccionado ningún archivo'
        });
    }
    next();
}

module.exports = {
    validarArchivo
}
const {Schema, model} = require('mongoose');
const direccionSchema = new Schema({
    tipo_direccion: {
        type: String,
    },
    usuario_id : {
        type: String,
    },
    nombres : {
        type: String,
    },
    direccion : {
        type: String,
    },
    telefono : {
        type: String,
    },
    email : {
        type: String,
    }
});

direccionSchema.methods.toJSON = function () {
    const {__v, ...data } = this.toObject();
    return data;
}
module.exports = model('Direccion',direccionSchema);
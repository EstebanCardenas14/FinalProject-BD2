const {Schema, model} = require('mongoose');
const checkoutVendedorSchema = new Schema({
    proveedor_id: {
        type: Number,
    },
    proveedor : {
        type: String,
    },
    NIT : {
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
    },
    fecha_registro : {
        type: String
    },
    carrito_id : {
        type: Number,
    },
    productos_vendidos : [{
        producto_id : {
            type: Number,
        },
        variante_id : {
            type: Number,
        },
        comprador_id : {
            type: Number,
        },
        comprador : {
            type: String,
        },
        producto : {
            type: String,
        },
        variante : {
            type: String,
        },
        cantidad : {
            type: Number,
        },
        precio : {
            type: Number,
        },
        subtotal : {
            type: Number,
        }
    }],
    estado : {
        type: String,
    }
});

checkoutVendedorSchema.methods.toJSON = function () {
    const {__v, ...data } = this.toObject();
    return data;
}
module.exports = model('CheckoutVendedor',checkoutVendedorSchema);
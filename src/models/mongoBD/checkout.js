const {Schema, model} = require('mongoose');
const checkoutSchema = new Schema({
    usuario_id: {
        type: String,
    },
    comprador_id : {
        type: String,
    },
    comprador : {
        type: String,
    },
    proveedor_id : {
        type: String,
    },
    proveedor : {
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
        type: Date,
        default: Date.now
    },
    carrito_id : {
        type: Number,
    },
    productos : [{
        producto_id : {
            type: Number,
        },
        viriante_id : {
            type: Number,
        },
        proveedor_id : {
            type: Number,
        },
        proveedor : {
            type: String,
        },
        marca : {
            type: String,
        },
        producto : {
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
    tarjeta : {
        tipo : {
            type: String,
        },
        numero : {
            type: String,
        },
        nombre : {
            type: String,
        },
        expiracion : {
            type: String,
        },
        cvv : {
            type: String,
        }
    },
    total : {
        type: Number,
    }
});

checkoutSchema.methods.toJSON = function () {
    const {__v, ...data } = this.toObject();
    return data;
}
module.exports = model('Checkout',checkoutSchema);
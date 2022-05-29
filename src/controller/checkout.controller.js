const { request, response } = require('express');
const db = require('../database/postgres-connection');
const Checkout = require('../models/checkout');
const { validateUser, createUser } = require('../helpers/index');

const create = async (req = request, res = response) => {
    const { carrito_id } = req.params;
    const { id_documento, username, num_doc, nombres, apellidos, telefono, correo, clave, direccion, tarjeta_tipo, numero_tarjeta, nombre_tarjeta, expiracion, cvv } = req.body;

    try {

        //verify the existence of the buyer
        await validateUser('Comprador', id_documento, username, num_doc, telefono, correo);
        //create the buyer
        const user = await createUser('Comprador', id_documento, username, num_doc, nombres, apellidos, telefono, correo, clave);
        //associate the user to the buyer table
        await db.query(`INSERT INTO comprador(usuario_id, estado) VALUES (${user.usuario_id}, ${true})`);

        //verify the existence of the carrito
        const carrito = await db.query(`SELECT * FROM carrito WHERE carrito_id = '${carrito_id}'`);
        //verify that the carrito exists
        if (carrito.rows.length === 0) {
            return res.status(400).json({
                ok: false,
                message: 'Carrito no encontrado'
            });
        }

        const carrito_producto = await db.query(`SELECT * FROM carrito_detalle WHERE carrito_id = '${carrito_id}'`);
        let carrito_productos = [];
        for (let i  in carrito_producto.rows) {
            const producto = await db.query(`SELECT * FROM producto WHERE producto_id = '${carrito_producto.rows[i].producto_id}'`);
            const variante = await db.query(`SELECT * FROM variante WHERE variante_id = '${carrito_producto.rows[i].variante_id}'`);
            const marca = await db.query(`SELECT * FROM marca WHERE marca_id = '${producto.rows[0].marca_id}'`);
            const proveedor = await db.query(`SELECT * FROM proveedor WHERE proveedor_id = '${producto.rows[0].proveedor_id}'`);
            const usuario = await db.query(`SELECT * FROM usuario WHERE usuario_id = '${proveedor.rows[0].usuario_id}'`);

            let precio = variante.rows[0].precio * carrito_producto.rows[i].cantidad;

            const carrito_producto_create = {
                producto_id: carrito_producto.rows[i].producto_id,
                variante_id: carrito_producto.rows[i].variante_id,
                proveedor_id: producto.rows[0].proveedor_id,

                proveedor : usuario.rows[0].nombres + ' ' + usuario.rows[0].apellidos,
                marca : marca.rows[0].nombre,
                producto : producto.rows[0].titulo,
                cantidad : carrito_producto.rows[i].cantidad,
                precio : variante.rows[0].precio,
                subtotal : precio
            }
            carrito_productos.push(carrito_producto_create);
        }

        let total = 0;
        for (let i in carrito_productos) {
            total += carrito_productos[i].subtotal;
        }

        //create the checkout
        const newCheckout = await Checkout.create({
            usuario_id : user.usuario_id,
            usuario : user.nombres + ' ' + user.apellidos,
            tipo_documento : user.doc_id,
            documento : user.num_doc,
            direccion : direccion,
            telefono : telefono,
            email : user.correo,
            carrito_id : carrito_id,
            productos : carrito_productos,
            tarjeta : {
                tipo : tarjeta_tipo,
                numero : numero_tarjeta,
                nombre : nombre_tarjeta,
                expiracion : expiracion,
                cvv : cvv
            },
            total : total
        });

        //delete the carrito_detalle
        await db.query(`DELETE FROM carrito_detalle WHERE carrito_id = '${carrito_id}'`);

        return res.status(200).json({
            ok: true,
            message: 'Checkout creado',
            checkout: newCheckout
        });

    } catch (error) {
        return res.status(400).json({
            ok: false,
            message: error
        });
    }

}

module.exports = {
    create
}
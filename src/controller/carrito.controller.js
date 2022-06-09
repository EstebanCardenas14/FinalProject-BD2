const { request, response } = require('express');
const NeoCompra = require('../models/Neo4j/producto');
const neoCompra = new NeoCompra();
const db = require('../database/postgres-connection');
const CheckoutCliente = require('../models/checkoutCliente');
const CheckoutVendedor = require('../models/checkoutVendedor');
const moment = require('moment');

//create carrito of products
const create = async (req, res) => {
    const { comprador_id } = req.body;
    try {

        //verify if the buyer already exists
        const comprador = await db.query(`SELECT * FROM comprador WHERE comprador_id = '${comprador_id}'`);
        if (comprador.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'El comprador no existe'
            });
        }
        // 

        //create the date of the creation YYYY-MM-DD
        const fecha_creacion = new Date();
        const fecha_creacion_format = fecha_creacion.toISOString().slice(0, 10);

        //  create the carrito
        const carrito = await db.query(`INSERT INTO carrito (comprador_id, fecha, estado ) VALUES (${comprador_id},(to_date('${fecha_creacion_format}', 'YYYY-MM-DD')), ${true}) RETURNING *`);

        if (carrito.rowCount > 0) {
            return res.status(200).json({
                message: 'Carrito creado correctamente',
                carrito: carrito.rows[0]
            });
        }

        return res.status(400).json({
            message: 'Carrito no pudo ser creado',
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error en el servidor',
            error
        });
    }
}

//add product to carrito
const addProducts = async (req, res) => {
    const { carrito_id } = req.params;
    const { productos } = req.body;
    try {

        console.log(productos);
        console.log(carrito_id);
        //verify if the carrito exists
        const carrito = await db.query(`SELECT * FROM carrito WHERE carrito_id = ${carrito_id}`);
        if (carrito.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'El carrito no existe'
            });
        }

        let respuesta = [{ producto: '', cantidad: 0, precio: 0 }];
        for (let vari of productos) {
            console.log(vari);
            let { variante_id, cantidad } = vari;
            let variante_bd = await db.query(`SELECT * FROM variante WHERE variante_id = ${variante_id}`);
            //verificar si existe la variante 
            if (variante_bd.rowCount > 0) {
                const { descripcion, precio, stock, producto_id } = variante_bd.rows[0];
                //verificar si la cantidad esta disponible en el stock
                if (cantidad <= stock) {
                    respuesta.push({ producto: descripcion, cantidad: cantidad, precio: (precio * cantidad) });
                    //actualizar el stock
                    await db.query(`UPDATE variante SET stock = stock - ${cantidad} WHERE variante_id = ${variante_id}`);
                    //agregar el producto al carrito_detalle
                    await db.query(`INSERT INTO carrito_detalle (carrito_id, producto_id,variante_id, cantidad, estado) VALUES (${carrito_id},${producto_id},${variante_id},${cantidad},${true})`);
                }
            }
        }
        //eliminar el primer elemento del arreglo
        respuesta.shift();
        console.log('RESPUESTA -> ', respuesta);

        return res.status(200).json({
            ok: true,
            message: 'Productos agregado correctamente',
            respuesta
        });


    } catch (error) {
        res.status(500).json({
            message: 'Error en el servidor',
            error
        });
    }
}

//traer carrito
const getCarrito = async (req, res) => {
    const { carrito_id } = req.params;
    try {
        let productos = await getCarritoDetalle(carrito_id);
        let total = 0;
        for (let prod of productos) { total += prod.subtotal; }
        if (productos === 'Error en el servidor') {
            return res.status(500).json({
                ok: false,
                message: 'Error en el servidor'
            });
        } else if (productos === 'El carrito no existe') {
            return res.status(400).json({
                ok: false,
                message: 'El carrito no existe'
            });
        } else {
            return res.status(200).json({
                ok: true,
                message: 'Carrito encontrado',
                productos,
                total
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error en el servidor',
            error
        });
    }
}

const getCarritoDetalle = async (carrito_id) => {
    try {
        //verify if the carrito exists
        const carrito = await db.query(`SELECT * FROM carrito WHERE carrito_id = ${carrito_id}`);
        if (carrito.rowCount === 0) {
            return 'El carrito no existe';
        }
        //traer el carrito
        const carrito_detalle = await db.query(`SELECT * FROM carrito_detalle WHERE carrito_id = ${carrito_id}`);
        //Traer las variantes
        let productos = [{ producto_id: 0, variante_id: 0, proveedor_id: 0, proveedor: '', marca: '', producto: '', variante: '', cantidad: '', precio: 0, subtotal: 0 }];
        for (let carrito_detalle_variante of carrito_detalle.rows) {
            let producto = await db.query(`SELECT * FROM producto WHERE producto_id = ${carrito_detalle_variante.producto_id}`);
            let marca = await db.query(`SELECT * FROM marca WHERE marca_id = ${producto.rows[0].marca_id}`);
            let variante = await db.query(`SELECT * FROM variante WHERE variante_id = ${carrito_detalle_variante.variante_id}`);
            let proveedor = await db.query(`SELECT * FROM proveedor WHERE proveedor_id = ${producto.rows[0].proveedor_id}`);
            let usuario = await db.query(`SELECT * FROM usuario WHERE usuario_id = ${proveedor.rows[0].usuario_id}`);
            productos.push({
                producto_id: producto.rows[0].producto_id,
                variante_id: variante.rows[0].variante_id,
                proveedor_id: proveedor.rows[0].proveedor_id,
                proveedor: usuario.rows[0].nombres + ' ' + usuario.rows[0].apellidos,
                marca: marca.rows[0].nombre,
                producto: producto.rows[0].titulo,
                variante: variante.rows[0].descripcion,
                cantidad: carrito_detalle_variante.cantidad,
                precio: variante.rows[0].precio,
                subtotal: (variante.rows[0].precio * carrito_detalle_variante.cantidad)
            });
        }
        productos.shift();

        return productos;


    } catch (error) {
        return 'Error en el servidor';
    }
}

//checkout carrito
const checkout = async (req, res) => {
    try {
        const { carrito_id } = req.params;

        const { direccion, tarjeta } = req.body;

        //verify if the carrito exists
        const carrito = await db.query(`SELECT * FROM carrito WHERE carrito_id = ${carrito_id}`);

        const comprador = await db.query(`SELECT * FROM comprador WHERE comprador_id = ${carrito.rows[0].comprador_id}`);

        const usuario = await db.query(`SELECT * FROM usuario WHERE usuario_id = ${comprador.rows[0].usuario_id}`);

        const doc = await db.query(`SELECT * FROM documento WHERE id_documento = ${usuario.rows[0].doc_id}`);

        let producto = await getCarritoDetalle(carrito_id);

        let total = 0;
        for (let prod of producto) { total += prod.subtotal; }

        //crear el checkout del comprador
        const check = await CheckoutCliente.create({
            usuario_id: usuario.rows[0].usuario_id,
            usuario: usuario.rows[0].nombres + ' ' + usuario.rows[0].apellidos,
            tipo_documento: doc.rows[0].tipo_documento,
            documento: usuario.rows[0].num_doc,
            direccion: direccion,
            telefono: usuario.rows[0].telefono,
            email: usuario.rows[0].correo,
            fecha_registro: moment().format('YYYY-MM-DD HH:mm:ss'),
            carrito_id: carrito_id,
            productos: producto,
            tarjeta: {
                tipo: tarjeta.tipo,
                numero: tarjeta.numero,
                expiracion: tarjeta.expiracion,
                cvv: tarjeta.cvv
            },
            total: total,
            estado: 'Pendiente de Confirmar Envio'
        });
        //crear el checkout del proveedor
        //let productos = [{ producto_id: 0, variante_id: 0, proveedor_id: 0, proveedor: '', marca: '', producto: '', variante: '', cantidad: '', precio: 0, subtotal: 0 }];
        let productosVendidos = [{ proveedor_id: 0, proveedor: '', NIT: '', direccion: '', telefono: '', email: '', fecha_registro: '', carrito_id: 0, productos_vendidos: [{ producto_id: 0, variante_id: 0, comprador_id: 0, comprador: '', producto: '', variante: '', cantidad: '', precio: '', subtotal: '' }] }];

        for (let prod of producto) {
            let proveedor = await db.query(`SELECT * FROM proveedor WHERE proveedor_id = ${prod.proveedor_id}`);
            let prov_user = await db.query(`SELECT * FROM usuario WHERE usuario_id = ${proveedor.rows[0].usuario_id}`);
            if (productosVendidos.length === 0) {
                productosVendidos.push({
                    proveedor_id: prod.proveedor_id,
                    proveedor: prod.proveedor,
                    NIT: prov_user.rows[0].num_doc,
                    direccion: 'Calle & #87b-53',
                    telefono: prov_user.rows[0].telefono,
                    email: prov_user.rows[0].correo,
                    fecha_registro: moment().format('YYYY-MM-DD HH:mm:ss'),
                    carrito_id: carrito_id,
                    productos_vendidos: [{
                        producto_id: prod.producto_id,
                        variante_id: prod.variante_id,
                        comprador_id: comprador.rows[0].comprador_id,
                        comprador: usuario.rows[0].nombres + ' ' + usuario.rows[0].apellidos,
                        producto: prod.producto,
                        variante: prod.variante,
                        cantidad: prod.cantidad,
                        precio: prod.precio,
                        subtotal: prod.subtotal
                    }]
                });
            } else {
                let existe = false;
                for (let prodVendido of productosVendidos) {
                    if (prodVendido.proveedor_id === proveedor.rows[0].proveedor_id) {
                        existe = true;
                        prodVendido.productos_vendidos.push({
                            producto_id: prod.producto_id,
                            variante_id: prod.variante_id,
                            comprador_id: comprador.rows[0].comprador_id,
                            comprador: usuario.rows[0].nombres + ' ' + usuario.rows[0].apellidos,
                            producto: prod.producto,
                            variante: prod.variante,
                            cantidad: prod.cantidad,
                            precio: prod.precio,
                            subtotal: prod.subtotal
                        });
                    }
                }
                if (!existe) {
                    productosVendidos.push({
                        proveedor_id: prod.proveedor_id,
                        proveedor: prod.proveedor,
                        NIT: prov_user.rows[0].num_doc,
                        direccion: 'Calle & #87b-53',
                        telefono: prov_user.rows[0].telefono,
                        email: prov_user.rows[0].correo,
                        fecha_registro: moment().format('YYYY-MM-DD HH:mm:ss'),
                        carrito_id: carrito_id,
                        productos_vendidos: [{
                            producto_id: prod.producto_id,
                            variante_id: prod.variante_id,
                            comprador_id: comprador.rows[0].comprador_id,
                            comprador: usuario.rows[0].nombres + ' ' + usuario.rows[0].apellidos,
                            producto: prod.producto,
                            variante: prod.variante,
                            cantidad: prod.cantidad,
                            precio: prod.precio,
                            subtotal: prod.subtotal
                        }]
                    });
                }

            }
        }
        //eliminar el primer dato del arreglo
        productosVendidos.shift();

        for (let prodVendido of productosVendidos) {
            CheckoutVendedor.create({
                proveedor_id: prodVendido.proveedor_id,
                proveedor: prodVendido.proveedor,
                NIT: prodVendido.NIT,
                direccion: prodVendido.direccion,
                telefono: prodVendido.telefono,
                email: prodVendido.email,
                fecha_registro: prodVendido.fecha_registro,
                carrito_id: prodVendido.carrito_id,
                productos_vendidos: prodVendido.productos_vendidos,
                estado : 'Pendiente de Confirmar Envio'
            });
        }

        //crear la relacion en neo4j
        let neo = [{producto_id : '', comprador_id : ''}];
        for (let prod of producto) {
            neo.push({
                producto_id: prod.producto_id,
                comprador_id: comprador.rows[0].comprador_id
            });
        }

        neo.shift();
        for (let prod of neo) {
            neoCompra.buyProducto(prod);
         }

        return res.status(200).json({
            ok: true,
            message: 'Orden Creada',
            check
        });

    } catch (error) {
        console.log('error'.red, error);
        res.status(500).json({
            message: 'Error en el servidor',
            error
        });
    }
}

module.exports = {
    create,
    addProducts,
    getCarrito,
    checkout,
}
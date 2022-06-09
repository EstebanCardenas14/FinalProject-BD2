const { request, response } = require('express');
const db = require('../database/postgres-connection');

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
const checkout = async (req, res) => {
    const { carrito_id } = req.params;
    const { productos } = req.body;
    try {

        //verify if the carrito exists
        const carrito = await db.query(`SELECT * FROM carrito WHERE carrito_id = '${carrito_id}'`);
        if (carrito.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'El carrito no existe'
            });
        }
     
        //verify if the variante has stock
        const variant = await verifyQuantity(variante_id, cantidad);
        console.log('CANTIDAD DISPONIBLE DE LA VARIANTE -> '.america,variant);

        let respuesta = [{producto : '', cantidad : 0, precio : 0}];
        for(let vari of productos){
            let { variante_id, cantidad } = vari;
            let variante_bd = await db.query(`SELECT * FROM variante WHERE variante_id = '${variante_id}'`);
            //verificar si existe la variante 
            if(variante_bd.rowCount > 0){
                const {descripcion, precio, stock, producto_id } = variante_bd.rows[0];
                //verificar si la cantidad esta disponible en el stock
                if(cantidad <= stock){
                    respuesta.push({producto : descripcion, cantidad : cantidad, precio : (precio * cantidad)});
                    //actualizar el stock
                    await db.query(`UPDATE variante SET stock = stock - ${cantidad} WHERE variante_id = '${variante_id}'`);
                    //agregar el producto al carrito_detalle
                    await db.query(`INSERT INTO carrito_detalle (carrito_id, producto_id,variante_id, cantidad, estado) VALUES (${carrito_id},${producto_id},${variante_id},${cantidad},${true})`);
                }
            }
        }
        //eliminar el primer elemento del arreglo
        respuesta.shift();
        console.log('RESPUESTA -> ',respuesta);

        


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


module.exports = {
    create,
    checkout,
}
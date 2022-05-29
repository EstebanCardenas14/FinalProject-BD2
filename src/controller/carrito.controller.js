const { request, response } = require('express');
const db = require('../database/postgres-connection');
const { verifyQuantity, resetProduct } = require('../helpers/index');

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

//delete carrito of products
const deleteCarrito = async (req, res) => {
    const { carrito_id } = req.params;
    try {

        //verify if the carrito exists
        const carrito = await db.query(`SELECT * FROM carrito WHERE carrito_id = '${carrito_id}'`);
        if (carrito.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'El carrito no existe'
            });
        }

        //verify if the carrito is empty
        const carrito_detalle = await db.query(`SELECT * FROM carrito_detalle WHERE carrito_id = '${carrito_id}'`);
        if (carrito_detalle.rowCount > 0) {
            for (let index in carrito_detalle.rows) {
                const carrito_producto = carrito_detalle.rows[index];
                const { variante_id, cantidad } = carrito_producto;
                resetProduct(variante_id, cantidad);
            }
            //delete the carrito_detalle
            await db.query(`DELETE FROM carrito_detalle WHERE carrito_id = '${carrito_id}'`);
        }



        //delete the carrito
     //   await db.query(`DELETE FROM carrito WHERE carrito_id = '${carrito_id}'`);


        return res.status(200).json({
            ok: false,
            message: 'Carrito eliminado correctamente'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error en el servidor',
            error
        });
    }
}

//add product to carrito
const addProduct = async (req, res) => {
    const { carrito_id } = req.params;
    const { variante_id, cantidad } = req.body;
    try {

        //verify if the carrito exists
        const carrito = await db.query(`SELECT * FROM carrito WHERE carrito_id = '${carrito_id}'`);
        if (carrito.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'El carrito no existe'
            });
        }
       
        //verify if the variante exists
        const variante = await db.query(`SELECT * FROM variante WHERE variante_id = '${variante_id}'`);
        if (variante.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'La variante no existe'
            });
        }
       
        //verify if the product exists
        const producto = await db.query(`SELECT * FROM producto WHERE producto_id = '${variante.rows[0].producto_id}'`);
        if (producto.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'El producto no existe'
            });
        }
      
        //verify if the product and variante is in the carrito 
        const carrito_producto = await db.query(`SELECT * FROM carrito_detalle WHERE carrito_id = '${carrito_id}' AND producto_id = '${variante.rows[0].producto_id}' AND variante_id = '${variante_id}'`);
        if (carrito_producto.rowCount > 0) {
            return res.status(400).json({
                ok: false,
                message: 'El producto ya existe en el carrito'
            });
        }
      
        //verify if the variante has stock
        const variant = await verifyQuantity(variante_id, cantidad);
      

        //  create the carrito_producto
        const carrito_producto_create = await db.query(`INSERT INTO carrito_detalle (carrito_id, producto_id, variante_id, cantidad, estado) VALUES (${carrito_id}, ${variante.rows[0].producto_id}, ${variante_id}, ${cantidad}, ${true}) RETURNING *`);

        console.log('crea carrito',carrito_producto_create.rows[0]);
        if (carrito_producto_create.rowCount > 0) {
            return res.status(200).json({
                message: 'Producto agregado correctamente',
                carrito_producto: carrito_producto_create.rows[0]
            });
        }

        return res.status(400).json({
            message: 'Producto no pudo ser agregado',
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error en el servidor',
            error
        });
    }
}

//delete variant of carrito
const deleteProduct = async (req, res) => {
    const { carrito_id } = req.params;
    const { variante_id } = req.body;
    try {

        //verify if the carrito exists
        const carrito = await db.query(`SELECT * FROM carrito WHERE carrito_id = '${carrito_id}'`);
        if (carrito.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'El carrito no existe'
            });
        }

        //verify if the variante exists
        const variante = await db.query(`SELECT * FROM variante WHERE variante_id = '${variante_id}'`);

        if (variante.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'La variante no existe'
            });
        }

        //verify if the product and variante is in the carrito
        const carrito_producto = await db.query(`SELECT * FROM carrito_detalle WHERE carrito_id = '${carrito_id}' AND variante_id = '${variante_id}'`);
        if (carrito_producto.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'El producto no existe en el carrito'
            });
        }
     
      
       console.log( resetProduct(variante_id,carrito_producto.rows[0].cantidad));
   
        //delete the carrito_detalle
        await db.query(`DELETE FROM carrito_detalle WHERE carrito_id = '${carrito_id}' AND variante_id = '${variante_id}'`);

        return res.status(200).json({
            ok: false,
            message: 'Producto eliminado correctamente'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error en el servidor',
            error
        });
    }
}

//update the carrito details
const updateCarrito = async (req, res) => {
    const { carrito_id } = req.params;
    const { variante_id, cantidad } = req.body;
    try {

        //verify if the carrito exists
        const carrito = await db.query(`SELECT * FROM carrito WHERE carrito_id = '${carrito_id}'`);
        if (carrito.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'El carrito no existe'
            });
        }
        const variant = verifyQuantity(variante_id, cantidad);
        console.log(variant);

        return res.status(200).json({
            ok: false,
            message: 'Producto editado correctamente',
            producto: variant,
            stock_restante: sustract
        });


    } catch (error) {
        res.status(500).json({
            message: 'Error en el servidor',
            error
        });
    }
}

//get the carrito details
const getCarrito = async (req, res) => {
    const { carrito_id } = req.params;
    try {
        //verify if the carrito exists
        const carrito = await db.query(`SELECT * FROM carrito WHERE carrito_id = '${carrito_id}'`);
        if (carrito.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'El carrito no existe'
            });
        }
        console.log(carrito.rows[0]);
        //get the carrito details
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
                carrito_id: carrito_producto.rows[i].carrito_id,
                carrito_detalle_id: carrito_producto.rows[i].carrito_det_id,
                producto_id: carrito_producto.rows[i].producto_id,
                variante_id: carrito_producto.rows[i].variante_id,

                imagen : producto.rows[0].imagen,
                titulo : producto.rows[0].titulo,
                proveedor : usuario.rows[0].nombres + ' ' + usuario.rows[0].apellidos,
                marca : marca.rows[0].nombre,
                cantidad: carrito_producto.rows[i].cantidad,
                precio: precio,
                
            }
            carrito_productos.push(carrito_producto_create);
        }

        let total = 0;
        for (let i in carrito_productos) {
            total += carrito_productos[i].precio;
        }
        return res.status(200).json({
            ok: true,
            message: 'Carrito encontrado',
            carrito: carrito_productos,
            total : total
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
    deleteCarrito,
    addProduct,
    deleteProduct,
    updateCarrito,
    getCarrito

}
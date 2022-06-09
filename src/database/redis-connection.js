const redis = require("ioredis");
const colors = require("colors");
const { set } = require("mongoose");
const { request, response } = require('express');
const axios = require('axios');
const db = require('../database/postgres-connection');
const {promisify} = require('util');
const {addProduct, deleteProduct,getCarrito} = require('../controllers/carrito.controller');
const res = require("express/lib/response");


const redisClient = new redis({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
    db: process.env.REDIS_DB
});

const get_async =promisify(redisClient.get).bind(redisClient);
const set_async =promisify(redisClient.set).bind(redisClient);

const redisConnection = async() => {
    try {
        await redisClient.connect();
        console.log('Data base redis: \x1b[32m%s\x1b[0m'.bold, 'online'.underline.yellow.bold);
        return redisClient;
    } catch (error) {
        console.log(error);
        throw new Error('Error a la hora de iniciar la base de datos'.underline.red.bold);
    }
}

    const getAll = async(req = request, res = response) => {

        try {
            //tiempo de expiracion de la cache de 10 minutos    
            const ttl = 600;

           const reply = await get_async('productos');
              if(reply){
                    return res.status(200).json({
                        ok: true,
                        message: 'Productos obtenidos con exito de la cache',
                        productos: JSON.parse(reply)
                    });

                }else{
                    const productos = await db.query(`SELECT * FROM producto`);
                    if (productos.rowCount === 0) {
                        return res.status(400).json({
                            ok: false,
                            message: 'No hay productos'
                        });
                    }  
                    
                    let products=[];
                    for(let index in productos.rows){
                        const product = productos.rows[index];
                        const marca = await db.query(`SELECT * FROM marca WHERE marca_id = ${productos.rows[index].marca_id}`);
                        const proveedor = await db.query(`SELECT * FROM proveedor WHERE proveedor_id = ${productos.rows[index].proveedor_id}`);
                        const variante = await db.query(`SELECT * FROM variante WHERE producto_id = ${productos.rows[index].producto_id}`);
                        const usuario = await db.query(`SELECT * FROM usuario WHERE usuario_id = ${proveedor.rows[0].usuario_id}`);
                       
                       
                       

                        products.push({
                            producto_id: product.producto_id,
                            Image: product.imagen,
                            Titulo: product.titulo,
                            marca: marca.rows[0].nombre,
                            marca_imagen: marca.rows[0].imagen,
                            proveedor: proveedor.rows[0].proveedor_id,
                            proveedor_nombre: usuario.rows[0].nombres,
                            Precio: variante.rows[0].precio,
                            
                            
                           

                        });

                    }

                    
                    await set_async('productos', JSON.stringify(products), 'EX', ttl);
                    return res.status(200).json({
                        ok: true,
                        message: 'Productos obtenidos con exito de la base de datos',
                        //mostrar los productos
                        productos: products
                    });
                    
                }
        } catch (error) {
            console.log(error);
            return res.status(400).json({
                ok: false,
                message: 'Error en el servidor',
                error
            });
        }
         
    }

    //agregar producto al carrito y a redis
    const addToCarrito = async(req = request, res = response) => {
        try {
            const {variante_id,cantidad} = req.body;
            const {carrito_id} = req.params;
            const ttl = 3600;
            const reply = await get_async(`carrito_${carrito_id}`);
            if(reply){
                const carrito = JSON.parse(reply);
                const producto = await db.query(`SELECT * FROM variante WHERE variante_id = ${variante_id}`);
                const producto_id = producto.rows[0].producto_id;
                const producto_nombre = producto.rows[0].titulo;
                const producto_imagen = producto.rows[0].imagen;
                const Cantidad = cantidad;
                const producto_precio = producto.rows[0].precio; 
                const producto_variante_id = variante_id;
                const producto_variante_nombre = producto.rows[0].nombre;

                const producto_variante = {
                    producto_id,
                    producto_nombre,
                    producto_imagen,
                    producto_precio,
                    Cantidad,
                    producto_variante_id,
                    producto_variante_nombre
                }
                
                carrito.push(producto_variante);
                await set_async(`carrito_${carrito_id}`, JSON.stringify(carrito), 'EX', ttl);
                return res.status(200).json({
                    ok: true,
                    message: 'Producto agregado al carrito',
                    carrito: carrito
                });
            }else{
                const producto = await db.query(`SELECT * FROM variante WHERE variante_id = ${variante_id}`);
                const producto_id = producto.rows[0].producto_id;
                const producto_nombre = producto.rows[0].titulo;
                const producto_imagen = producto.rows[0].imagen;
                const producto_precio = producto.rows[0].precio;
                const Cantidad = cantidad;
                const producto_variante_id = variante_id;
                const producto_variante_nombre = producto.rows[0].nombre;
                
                const producto_variante = {
                    producto_id,
                    producto_nombre,
                    producto_imagen,
                    producto_precio,
                    Cantidad,
                    producto_variante_id,
                    producto_variante_nombre
                }
                const carrito = [];
                carrito.push(producto_variante);
                await set_async(`carrito_${carrito_id}`, JSON.stringify(carrito), 'EX', ttl);
                return res.status(200).json({
                    ok: true,
                    message: 'Producto agregado al carrito con exito ',   
                    carrito: carrito
                });
            }
        } catch (error) {
            console.log(error);
            return res.status(400).json({
                ok: false,
                message: 'Error en el servidor',
                error
            });
        }
    }

    //obtener carrito de redis con informacion personalizada
    const getCarritoo = async(req = request, res = response) => {
        try {
            const {carrito_id} = req.params;
            const ttl = 3600;
            const reply = await get_async(`carrito_${carrito_id}`);
            if(reply){
                const carrito = JSON.parse(reply);
                let products=[];
                for(let index in carrito){

                    const product = carrito[index];
                    const producto = await db.query(`SELECT * FROM variante WHERE variante_id = ${carrito[index].variante_id}`);
                    const marca = await db.query(`SELECT * FROM marca WHERE marca_id = ${producto.rows[0].marca_id}`);
                    const proveedor = await db.query(`SELECT * FROM proveedor WHERE proveedor_id = ${producto.rows[0].proveedor_id}`);
                    const usuario = await db.query(`SELECT * FROM usuario WHERE usuario_id = ${proveedor.rows[0].usuario_id}`);

                    
                    const producto_variante = {
                        producto_id : producto.rows[0].producto_id,
                        producto_nombre: producto.rows[0].titulo,
                        producto_imagen: producto.rows[0].imagen,
                        producto_precio: producto.rows[0].precio,
                        producto_cantidad: product.Cantidad,
                        proveedor_nombre: usuario.rows[0].nombres,
                        marca_nombre: marca.rows[0].nombre
                    }
                  
                    products.push(producto_variante);
                   
                }
                return res.status(200).json({
                    ok: true,
                    message: 'Carrito obtenido con exito',
                    carrito: products
                });
            }else{
                return res.status(200).json({
                    ok: true,
                    message: 'Carrito vacio',
                    carrito: []
                });
            }
        } catch (error) {
            console.log(error);
            return res.status(400).json({
                ok: false,
                message: 'Error en el servidor',
                error
            });
        }
    }
    
    module.exports = {
        redisConnection,
        getAll,
        addToCarrito,
        getCarritoo
    }
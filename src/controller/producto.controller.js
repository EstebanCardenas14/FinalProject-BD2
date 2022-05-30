const { request, response } = require('express');
const db = require('../database/postgres-connection');
const { uploadFile, deleteFile } = require('../helpers');
const redis = require('../database/redis-connection');
const axios = require('axios');
const { Client } = require('redis-om');


const uploadImg = async (req = request, res = response) => {
    try {
        const path = await uploadFile(req.files.archivo, ['png', 'jpg', 'jpeg'], 'producto/');
        const pathRoute = `${process.env.ROUTE_IMG}/storage/producto/` + path;
        //console.log(pathRoute);

        res.status(200).json({
            ok: true,
            message: 'Imagen subida con exito',
            pathRoute
        });

    }
    catch (error) {
        //If there is an error return the error
        return res.status(500).json({
            ok: false,
            message: 'Error al actualizar la imagen de la marca',
            error
        });
    }
}

const create = async (req = request, res = response) => {
    const { proveedor_id } = req.params;
    const { marca_id, imagen, titulo, descripcion } = req.body;
    try {
    console.log(req.id_rol);
        //validate the existence of the provider
        const proveedor = await db.query(`SELECT * FROM proveedor WHERE proveedor_id = ${proveedor_id}`);
        if (proveedor.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'El proveedor no existe'
            });
        }

        //validate the brand of marca
        const marca = await db.query(`SELECT * FROM marca WHERE marca_id = ${marca_id}`);
        if (marca.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'La marca no existe'
            });
        }

        //create the product
        const createProduct = await db.query(`INSERT INTO producto (marca_id,proveedor_id, imagen, titulo, descripcion,estado) VALUES (${marca_id}, ${proveedor_id}, '${imagen}', '${titulo}', '${descripcion}',${true}) RETURNING *`);
        if (createProduct.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'El producto no se pudo crear'
            });
        }

        return res.status(200).json({
            ok: true,
            message: 'Producto creado',
            producto: createProduct.rows[0]
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            message: 'Error en el servidor',
            error
        });

    }

}

const getProductById = async (req = request, res = response) => {
    try {
        const { id } = req.params;
        //verify the existence of the product
        const product = await db.query(`SELECT * FROM producto WHERE producto_id = ${id}`);
        if (product.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'El producto no existe'
            });
        }

        let producto = [];
        const variante = await db.query(`SELECT * FROM variante WHERE producto_id = ${product.rows[0].producto_id}`);
        const proveedor = await db.query(`SELECT * FROM proveedor WHERE proveedor_id = ${product.rows[0].proveedor_id}`);
        const usuario = await db.query(`SELECT * FROM usuario WHERE usuario_id = ${proveedor.rows[0].usuario_id}`);
        const marca = await db.query(`SELECT * FROM marca WHERE marca_id = ${product.rows[0].marca_id}`);

        producto.push({
              producto_id : product.rows[0].producto_id,
              variante_id : variante.rows[0].variante_id,
              marca : marca.rows[0].nombre,
              proveedor : usuario.rows[0].nombres + ' ' + usuario.rows[0].apellidos,
              imagen : product.rows[0].imagen,
              titulo : product.rows[0].titulo,
              descripcion_1 : product.rows[0].descripcion,
              descripcion_2 : variante.rows[0].descripcion,
              caracteristicas : variante.rows[0].caracteristicas,
              precio : variante.rows[0].precio,
              stock : variante.rows[0].stock
        });


        return res.status(200).json({
            ok: true,
            message: 'Producto encontrado',
            producto: producto
        });

    } catch (error) {

        return res.status(400).json({
            ok: false,
            message: 'Error en el servidor',
            error
        });
    }
}

const getAll = async (req = request, res = response) => {
    try {
        const prod = await db.query(`SELECT * FROM producto`);
        if (prod.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'No hay productos'
            });
        }

        let productos = [];
        for (let index in prod.rows) {
            const product = await db.query(`SELECT * FROM producto WHERE producto_id = ${prod.rows[index].producto_id}`);
            const variante = await db.query(`SELECT * FROM variante WHERE producto_id = ${prod.rows[index].producto_id}`);
            const proveedor = await db.query(`SELECT * FROM proveedor WHERE proveedor_id = ${prod.rows[index].proveedor_id}`);
            const usuario = await db.query(`SELECT * FROM usuario WHERE usuario_id = ${proveedor.rows[0].usuario_id}`);
            const marca = await db.query(`SELECT * FROM marca WHERE marca_id = ${product.rows[0].marca_id}`);

            productos.push({
              producto_id : product.rows[0].producto_id,
              variante_id : variante.rows[0].variante_id,
              marca : marca.rows[0].nombre,
              proveedor : usuario.rows[0].nombres + ' ' + usuario.rows[0].apellidos,
              imagen : product.rows[0].imagen,
              titulo : product.rows[0].titulo,
              descripcion_1 : product.rows[0].descripcion,
              descripcion_2 : variante.rows[0].descripcion,
              caracteristicas : variante.rows[0].caracteristicas,
              precio : variante.rows[0].precio,
              stock : variante.rows[0].stock
            });
        }

        if (productos.length === 0) {
            return res.status(400).json({
                ok: false,
                message: 'No hay productos'
            });
        }

        return res.status(200).json({
            ok: true,
            message: 'Productos encontrados',
            productos: productos
        });

    } catch (error) {
        return res.status(400).json({
            ok: false,
            message: 'Error en el servidor',
            error
        });
    }

}

const getProductByTitle = async (req = request, res = response) => {
    try {
        const { title } = req.params;
        const productos = await db.query(`SELECT * FROM producto WHERE titulo LIKE '%${title}%'`);
        if (productos.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'No hay productos'
            });
        }

        let productos_encontrados = [];
        for (let index in productos.rows) {
            const product = await db.query(`SELECT * FROM producto WHERE producto_id = ${productos.rows[index].producto_id}`);
            const variante = await db.query(`SELECT * FROM variante WHERE producto_id = ${productos.rows[index].producto_id}`);
            const proveedor = await db.query(`SELECT * FROM proveedor WHERE proveedor_id = ${productos.rows[index].proveedor_id}`);
            const usuario = await db.query(`SELECT * FROM usuario WHERE usuario_id = ${proveedor.rows[0].usuario_id}`);
            const marca = await db.query(`SELECT * FROM marca WHERE marca_id = ${product.rows[0].marca_id}`);

            productos_encontrados.push({
                producto_id : product.rows[0].producto_id,
                variante_id : variante.rows[0].variante_id,
                marca : marca.rows[0].nombre,
                proveedor : usuario.rows[0].nombres + ' ' + usuario.rows[0].apellidos,
                imagen : product.rows[0].imagen,
                titulo : product.rows[0].titulo,
                descripcion_1 : product.rows[0].descripcion,
                descripcion_2 : variante.rows[0].descripcion,
                caracteristicas : variante.rows[0].caracteristicas,
                precio : variante.rows[0].precio,
                stock : variante.rows[0].stock
            });
        }

       

        return res.status(200).json({
            ok: true,
            message: 'Productos encontrados',
            productos: productos_encontrados
        });

    } catch (error) {
        return res.status(400).json({
            ok: false,
            message: 'Error en el servidor',
            error
        });
    }
}

const updateById = async (req = request, res = response) => {
    const { id } = req.params;
    const { marca_id, imagen, titulo, descripcion } = req.body;
    try {

        //verify the existence of the product
        const product = await db.query(`SELECT * FROM producto WHERE producto_id = ${id}`);
        if (product.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'El producto no existe'
            });
        }

        //validate the brand of marca
        const marca = await db.query(`SELECT * FROM marca WHERE marca_id = ${marca_id}`);
        if (marca.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'La marca no existe'
            });
        }

        //validate the title of product
        if (titulo.length === 0) {
            return res.status(400).json({
                ok: false,
                message: 'El titulo no puede estar vacio'
            });
        }

        //validate the description of product
        if (descripcion.length === 0) {
            return res.status(400).json({
                ok: false,
                message: 'La descripcion no puede estar vacia'
            });
        }

        // Limpiar imágenes previas
        if (product.rows[0].imagen) {
            // Hay que borrar la imagen del servidor
            const path = product.rows[0].imagen.split('/');

            await deleteFile(path[5], 'producto/');
        }

        //update the product
        const updateProduct = await db.query(`UPDATE producto SET marca_id = ${marca_id}, imagen = '${imagen}', titulo = '${titulo}', descripcion = '${descripcion}' WHERE producto_id = ${id} RETURNING *`);


        return res.status(200).json({
            ok: true,
            message: 'Producto actualizado',
            producto: updateProduct.rows[0]
        });
    } catch (error) {
        return res.status(400).json({
            ok: false,
            message: 'Error en el servidor',
            error
        });
    }

}

const deleteById = async (req = request, res = response) => {
    const { id } = req.params;
    try {
        //verify the existence of the product
        const product = await db.query(`SELECT * FROM producto WHERE producto_id = ${id}`);
        if (product.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'El producto no existe'
            });
        }

        //delete the product
        const deleteProduct = await db.query(`DELETE FROM producto WHERE producto_id = ${id}`);

        return res.status(200).json({
            ok: true,
            message: 'Producto eliminado'
        });
    } catch (error) {
        return res.status(400).json({
            ok: false,
            message: 'Error en el servidor',
            error
        });
    }
}

const addCategories = async (req = request, res = response) => {
    const { producto_id } = req.params;
    const { categoria_id } = req.body;
    try {
        //verify the existence of the product
        const product = await db.query(`SELECT * FROM producto WHERE producto_id = ${producto_id}`);
        if (product.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'El producto no existe'
            });
        }

        //verify the existence of the category
        const categoria = await db.query(`SELECT * FROM categoria WHERE categoria_id = ${categoria_id}`);
        if (categoria.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: `'La categoria no existe'`
            });
        }

        //Verify if the product is already in the category
        const productInCategory = await db.query(`SELECT * FROM producto_categoria WHERE producto_id = ${producto_id} AND categoria_id = ${categoria_id}`);
        if (productInCategory.rowCount !== 0) {
            return res.status(400).json({
                ok: false,
                message: 'El producto ya esta asociado a la categoria'
            });
        }

        //add the category
        const addCategory = await db.query(`INSERT INTO producto_categoria (producto_id, categoria_id) VALUES (${producto_id}, ${categoria_id}) RETURNING *`);
        if (addCategory.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'La categoria no se pudo agregar'
            });
        }

        return res.status(200).json({
            ok: true,
            message: `La categoria ${categoria.rows[0].nombre} se agrego correctamente al producto : ${product.rows[0].titulo}`

        });
    } catch (error) {
        return res.status(400).json({
            ok: false,
            message: 'Error en el servidor',
            error
        });
    }
}

const getProductsByCategory = async (req = request, res = response) => {
    const { categoria_id } = req.params;
    try {
        //verify the existence of the category
        const categoria = await db.query(`SELECT * FROM categoria WHERE categoria_id = ${categoria_id}`);
        if (categoria.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'La categoria no existe'
            });
        }

        //get the products
        const cat_prod = await db.query(`SELECT * FROM producto_categoria WHERE categoria_id = ${categoria_id}`);
        if (cat_prod.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'No hay productos en esta categoria'
            });
        }

        let productos = [];
        for (let index in cat_prod.rows) {
            const product = await db.query(`SELECT * FROM producto WHERE producto_id = ${cat_prod.rows[index].producto_id}`);
            const variante = await db.query(`SELECT * FROM variante WHERE producto_id = ${cat_prod.rows[index].producto_id}`);
            const proveedor = await db.query(`SELECT * FROM proveedor WHERE proveedor_id = ${product.rows[0].proveedor_id}`);
             const usuario = await db.query(`SELECT * FROM usuario WHERE usuario_id = ${proveedor.rows[0].usuario_id}`);
            const marca = await db.query(`SELECT * FROM marca WHERE marca_id = ${product.rows[0].marca_id}`);

            productos.push({
              producto_id : product.rows[0].producto_id,
              variante_id : variante.rows[0].variante_id,
              marca : marca.rows[0].nombre,
              proveedor : usuario.rows[0].nombres + ' ' + usuario.rows[0].apellidos,
              imagen : product.rows[0].imagen,
              titulo : product.rows[0].titulo,
              descripcion_1 : product.rows[0].descripcion,
              descripcion_2 : variante.rows[0].descripcion,
              caracteristicas : variante.rows[0].caracteristicas,
              precio : variante.rows[0].precio,
              stock : variante.rows[0].stock
            });
        }

        if (productos.length === 0) {
            return res.status(400).json({
                ok: false,
                message: 'Error al obtener los productos'
            });
        }

        return res.status(200).json({
            ok: true,
            message: 'Productos obtenidos',
            productos
        });
    } catch (error) {
        return res.status(400).json({
            ok: false,
            message: 'Error en el servidor',
            error
        });
    }
}

module.exports = {
    uploadImg,
    create,
    getProductById,
    getAll,
    updateById,
    deleteById,
    addCategories,
    getProductsByCategory,
    getProductByTitle
}
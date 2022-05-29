const { request, response } = require('express');
const db = require('../database/postgres-connection');

//create product
const createProduct = async (marca_id,proveedor_id,titulo,precio,caracteristicas,descripcion, req = request, res = response) => {
    try{

        return new Promise(async (resolve, reject) => {
            //create product
            await db.query(`INSERT INTO producto (marca_id,proveedor_id,titulo,precio,caracteristicas,descripcion) VALUES ('${marca_id}','${proveedor_id}','${titulo}','${precio}','${caracteristicas}','${descripcion}');`);
            //verify the existence of the product
            const product =  await db.query(`SELECT * FROM producto WHERE titulo = '${titulo}'`);
            if (product.rowCount === 0) {
                return reject('Error al crear el producto');
            }          
    }
    );
}catch(error){
    return res.status(400).json({
        ok: false,
        type: 'Error en el servidor'
    });
}
};

module.exports = { createProduct };
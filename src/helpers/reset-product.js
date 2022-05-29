const { request, response } = require('express');
const db = require('../database/postgres-connection');


//returns the stock quantity from the cart detail to the variant
const resetProduct = async (variante_id, cantidad, req = request, res = response) => {

    try {
        return new Promise(async (resolve, reject) => {
         
            //verify if the product variant exists
            const variante = await db.query(`SELECT * FROM variante WHERE variante_id = '${variante_id}'`);
            if (variante.rowCount === 0) {
                return reject('La variante no existe');
            }
            //update the stock quantity
            const update = await db.query(`UPDATE variante SET stock = stock + ${cantidad} WHERE variante_id = '${variante_id}' RETURNING *`);
            if (update.rowCount === 0) {
                return reject('No se pudo actualizar el stock');
            }
            
            return resolve(update.rows[0]);
            
        });
    } catch (error) {
        return res.status(400).json({
            ok: false,
            type: 'Error en el servidor'
        });
    }
};

module.exports = { resetProduct };
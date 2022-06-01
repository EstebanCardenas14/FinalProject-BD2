const neo4j = require('neo4j-driver');
const color = require('colors');
require('dotenv').config()
let session;

class Categoria {

    constructor() {
        try {
            const {
                NEO4J_URI,
                NEO4J_USER,
                NEO4J_PASSWORD,
                database,
            } = process.env
            const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
            session = driver.session({ database });
            //console.log(color.blue('Connected to neo4j'));
        } catch (error) {
            console.log(color.red('Error in neo4j connection'));
        }
    }

    createCategoria(categoria) {
        //create a new product
        const create = async () => {
            try {
                console.log('Categoria ->',categoria);
                //create the product
                const cate = await session.run(`CREATE (u:Categoria {a_nombre : '${categoria.nombre}', categoria_id: '${categoria.categoria_id}'}) return u`);
                console.log(color.green('Categoria creada'));
                return cate.records[0].get('u').properties;
            } catch (error) {
                return 'Error in create product'
            }
        };
        return create();
    }

    addCategoria(prod_cat) {
        //create a new product
        const addProd = async () => {
            try {
                //validate if the product exists
                const producto = await session.run(`MATCH (u:Producto {producto_id : '${prod_cat.producto_id}'} ) return u limit 1`)
                if (producto.records.length === 0) {
                    return 'Producto no existe'
                }
                //validate if the category exists
                const categoria = await session.run(`MATCH (u:Categoria {categoria_id : '${prod_cat.categoria_id}'} ) return u limit 1`);
                if (categoria.records.length === 0) {
                    return 'Categoria no existe'
                }
                //create the relationship between the producto and category
                await session.run(`MATCH (u:Producto {producto_id : '${prod_cat.producto_id}'}), (p:Categoria {categoria_id : '${prod_cat.categoria_id}'}) CREATE (u)-[:Producto_Categoria]->(p) return u,p`);
                return 'Relacion creada'
            } catch (error) {
                return 'Error in create product'
            }
        };
        return addProd();
    };

}

module.exports = Categoria;
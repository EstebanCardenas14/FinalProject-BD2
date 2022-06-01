const neo4j = require('neo4j-driver');
const color = require('colors');
require('dotenv').config()
let session;

class Producto {

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

    createProducto(producto) {
        //create a new product
        const create = async () => {
            try {
                //validate if the seller exists
                const proveedor = await session.run(`MATCH (u:Proveedor {proveedor_id : '${producto.proveedor_id}'} ) return u limit 1`)
                if (proveedor.records.length === 0) {
                    return 'Proveedor no existe'
                }
                //create the product
                const prod = await session.run(`CREATE (u:Producto {titulo : '${producto.titulo}', marca: '${producto.marca}', producto_id: '${producto.producto_id}', proveedor_id: '${producto.proveedor_id}'}) return u`);
                //create the relationship between the producto and the seller
                await session.run(`MATCH (u:Proveedor {proveedor_id : '${producto.proveedor_id}'}), (p:Producto {producto_id : '${producto.producto_id}'}) CREATE (u)-[:Proveedor_Producto]->(p) return u,p`);
                console.log(color.green('Relacion creada'));
                return prod.records[0].get('u').properties;
            } catch (error) {
                return 'Error in create product'
            }
        };
        return create();
    }

    buyProducto(producto) {
        //buy a product
        const buy = async () => {
            try {
                //verify if the product exists
                const result = await session.run(`MATCH (u:Product {_id : '${id_product}'} ) return u limit 1`)
                if (result.records.length === 0) {
                    return 'Product not found'
                }
                //verify if the buyer exists
                const result2 = await session.run(`MATCH (u:Buyer {_id : '${id_buyer}'} ) return u limit 1`)
                if (result2.records.length === 0) {
                    return 'Buyer not found'
                }
                //create the relationship between the producto and the buyer
                await session.run(`MATCH (u:Buyer {_id : '${id_buyer}'}), (v:Product {_id : '${id_product}'}) CREATE (u)-[:BUY]->(v)`);
                console.log(color.green('Relationship created'));
                return await findById(id_product)
            } catch (error) {
                return 'Error in buy product'
            }
        };
        return buy(producto, producto.seller_id);
    }

    recommendProducto(producto) {
        //recommend products to a buyer
        const recommend = async (id_product, id_buyer, qualification) => {
            try {
                //verify if the product exists
                const result = await session.run(`MATCH (u:Product {_id : '${id_product}'} ) return u limit 1`)
                if (result.records.length === 0) {
                    return 'Product not found'
                }
                //verify if the buyer exists
                const result2 = await session.run(`MATCH (u:Buyer {_id : '${id_buyer}'} ) return u limit 1`)
                if (result2.records.length === 0) {
                    return 'Buyer not found'
                }
                //create the relationship between the producto and the buyer
                await session.run(`MATCH (u:Buyer {_id : '${id_buyer}'}), (v:Product {_id : '${id_product}'}) CREATE (u)-[:RECOMMEND {qualification: ${qualification}}]->(v)`);
                console.log(color.green('Relationship created'));
                return await findById(id_product)
            } catch (error) {
                return error
            }
        }
    }

    top5Producto() {
        //Top 5 of the best-selling products with the average of their ratings
        const top5 = async () => {
            try {
                //MATCH (a:Comprador)-[r:RECOMIENDA]->(b:Producto) RETURN b.nombre AS nombre, AVG(r.calificacion) AS promedio ORDER BY promedio DESC LIMIT 5
                const result = await session.run(`MATCH (a:Buyer)-[r:RECOMMEND]->(b:Product) RETURN b.name AS name, AVG(r.qualification) AS prom ORDER BY prom DESC LIMIT 5`);
                //organize the result
                let top5 = [];
                for (let prod in result.records) {
                    top5.push({ name: result.records[prod]._fields[0], prom: result.records[prod]._fields[1] })
                }
                //return the top 5, only the object products
                return top5;
            } catch (error) {
                return 'Error in top5'
            }
        }
    }

    findProductos() {
        //get all products
        const findAll = async () => {
            try {
                const result = await session.run(`Match (u:Product) return u`)
                //validate if the producto exists
                if (result.records.length === 0) {
                    return { error: 'No products found' }
                } else {
                    return result.records.map(i => i.get('u').properties)
                }
            } catch (error) {
                return 'Error in findAll conection'
            }
        }
    }


}

module.exports = Producto;
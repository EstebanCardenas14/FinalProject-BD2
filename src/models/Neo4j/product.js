const neo4j = require('neo4j-driver');
const color = require('colors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()
let session;
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
//create a new product
const create = async (product, id_seller) => {
    try {
        const unique_id = uuidv4();
        //validate if the producto already exists
        const result = await session.run(`MATCH (u:Product {name : '${product.name}', category : '${product.category}'}) return u`);
        if (result.records.length > 0) {
            return 'Producto already exists'
        }
        //validate if the seller exists
        const result2 = await session.run(`MATCH (u:Seller {_id : '${id_seller}'} ) return u limit 1`)
        if (result2.records.length === 0) {
            return 'Seller not found'
        }
        //create the product
        await session.run(`CREATE (u:Product {_id : '${unique_id}', name: '${product.name}', category: '${product.category}', price: '${product.price}'}) return u`);
        console.log(color.green('Product created'));
        //create the relationship between the producto and the seller
        await session.run(`MATCH (u:Seller {_id : '${id_seller}'}), (p:Product {_id : '${unique_id}'}) CREATE (u)-[:SELLS]->(p) return u,p`);
        console.log(color.green('Relationship created'));
        return await findById(unique_id)
    } catch (error) {
        return 'Error in create product'
    }
};
//buy a product
const buy = async (id_product, id_buyer) => {
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
}
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
//product suggestion
const suggestion = async (buyer_name, product_name) => {
    try {
        const result = await session.run(`
        MATCH (P1:Product {name : '${product_name}'})-[B1:BOUGHT_BY]->(b:Buyer WHERE b.name <>  '${buyer_name}')<-[B2:BOUGHT_BY]-(P2:Product WHERE P2.name <> '${product_name}')<-[r:RECOMMEND]-(b) RETURN  0.4*COUNT(B2) + AVG(r.qualification) as ranking_suggestion, P2.name as name_products LIMIT 3
        `);
        console.log(color.green('Suggestion'));
        return result.records;
    } catch (error) {
        return error
    }
}
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
//get a product by id
const findById = async (id) => {
    try {
        const result = await session.run(`MATCH (u:Product {_id : '${id}'} ) return u limit 1`)
        //validate if the producto exists
        if (result.records.length === 0) {
            return { error: 'Product not found' }
        } else {
            return result.records[0].get('u').properties
        }
    } catch (error) {
        return 'Error in findById conection'
    }
}
//export the functions
const update = async (id, product) => {
    try {
        const result = await session.run(`MATCH (u:Product {_id : '${id}'} ) SET u += {name: '${product.name}', category: '${product.category}', price: '${product.price}'} return u`)
        //validate if the producto exists
        if (result.records.length === 0) {
            return { error: 'Product not found' }
        } else {
            return result.records[0].get('u').properties
        }
    } catch (error) {
        return 'Error in update conection'
    }
}
//delete a product
const deleteById = async (id) => {
    try {
        const result = await session.run(`MATCH (u:Product {_id : '${id}'} ) DETACH DELETE u`)
        //validate if the producto exists
        if (result.records.length === 0) {
            return { error: 'Product not found' }
        }
        console.log(color.green('Product deleted'));
        return 'Product deleted'
    } catch (error) {
        return 'Error in delete conection'
    }
}
module.exports = {
    create,
    buy,
    recommend,
    top5,
    suggestion,
    findAll,
    findById,
    update,
    deleteById
};
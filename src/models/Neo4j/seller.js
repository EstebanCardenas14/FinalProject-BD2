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

//find all sellers
const findAll = async () => {
    try {
        const result = await session.run(`Match (u:Seller) return u`)
        //validate if the seller exists
        if (result.records.length === 0) {
            return { error: 'No sellers found' }
        } else {
            return result.records.map(i => i.get('u').properties)
        }
    } catch (error) {
        return 'Error in findAll conection'
    }
}
//find a seller by id
const findById = async (id) => {
    try {
        const result = await session.run(`MATCH (u:Seller {_id : '${id}'} ) return u limit 1`)
        //validate if the seller exists
        if (result.records.length === 0) {
            return { error: 'Seller not found' }
        } else {
            return result.records[0].get('u').properties
        }
    } catch (error) {
        return 'Error in findById conection'
    }
}
//create a new seller
const create = async (seller) => {
    try {
        const unique_id = uuidv4();
        //validate if the seller already exists
        const result = await session.run(`MATCH (u:Seller {doc_number : '${seller.doc_number}'}) return u`);
        if (result.records.length > 0) {
            return 'Seller already exists'
        }
        //create the seller
        await session.run(`CREATE (u:Seller {_id : '${unique_id}', name: '${seller.name}', doc_type: '${seller.doc_type}', doc_number: '${seller.doc_number}'} ) return u`);
        return await findById(unique_id)
    } catch (error) {
        return 'Error in create conection'
    }
}
//update a seller
const findByIdAndUpdate = async (id, seller) => {
    try {
        const result = await session.run(`MATCH (u:Seller {_id : '${id}'}) SET u.name= '${seller.name}', doc_type: '${seller.doc_type}', doc_number: '${seller.doc_number}' return u`)
        return result.records[0].get('u').properties
    } catch (error) {
        return 'Error in findByIdAndUpdate conection'
    }
}
//delete a seller
const findByIdAndDelete = async (id) => {
    try {
        await session.run(`MATCH (u:Seller {_id : '${id}'}) DELETE u`)
        return await findAll()
    } catch (error) {
        return 'Error in findByIdAndDelete conection'
    }
}

module.exports = {
    findAll,
    findById,
    create,
    findByIdAndUpdate,
    findByIdAndDelete
};

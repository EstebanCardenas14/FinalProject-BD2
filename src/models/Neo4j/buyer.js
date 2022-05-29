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
//    console.log(color.blue('Connected to neo4j'));
} catch (error) {
    console.log(color.red('Error in neo4j connection'));
}

//find all buyers
const findAll = async () => {
    const result = await session.run(`Match (u:Buyer) return u`)
    return result.records.map(i => i.get('u').properties)
};
//find a buyer by id
const findById = async (id) => {
    try {
        const result = await session.run(`MATCH (u:Buyer {_id : '${id}'} ) return u limit 1`)
        return result.records[0].get('u').properties
    } catch (error) {
        return 'Error in findById conection'
    }
};
//create a new buyer
const create = async (buyer) => {
    try {
        const unique_id = uuidv4();
        //validate if the buyer already exists
        const result = await session.run(`MATCH (u:Buyer {doc_number : '${buyer.doc_number}'}) return u`);
        if (result.records.length > 0) {
            return 'Buyer already exists'
        }
        //create the buyer
        await session.run(`CREATE (u:Buyer {_id : '${unique_id}', name: '${buyer.name}', doc_type: '${buyer.doc_type}', doc_number: '${buyer.doc_number}'} ) return u`);
        return await findById(unique_id)
    } catch (error) {
        return 'Error in create conection'
    }
};
//update a buyer
const findByIdAndUpdate = async (id, buyer) => {
    try {
        const result = await session.run(`MATCH (u:Buyer {_id : '${id}'}) SET u.name= '${buyer.name}', doc_type: '${buyer.doc_type}', doc_number: '${buyer.doc_number}' return u`)
        return result.records[0].get('u').properties
    } catch (error) {
        return 'Error in findByIdAndUpdate conection'
    }
};
//delete a buyer
const findByIdAndDelete = async (id) => {
    try {
        await session.run(`MATCH (u:Buyer {_id : '${id}'}) DELETE u`)
        return await findAll()
    } catch (error) {
        return 'Error in findByIdAndDelete conection'
    }
};
//find a buyer by doc_number
const findOne = async (doc_number) => {
    try {
        const result = await session.run(`MATCH (u:Buyer {doc_number : '${doc_number}'}) return u`)
        return result.records[0].get('u').properties
    } catch (error) {
        return 'Error in findOne conection'
    }
};

module.exports = {
    findAll,
    findById,
    create,
    findByIdAndUpdate,
    findByIdAndDelete,
    findOne
};

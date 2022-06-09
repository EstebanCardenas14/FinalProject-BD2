const neo4j = require('neo4j-driver');
const color = require('colors');
require('dotenv').config()
let session;

class Proveedor {
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
            console.log(color.blue('Connected to neo4j'.rainbow));
        } catch (error) {
            console.log(color.red('Error in neo4j connection'));
        }
    }
    //create a new seller
    createProv(proveedor) {
        const create = async () => {
            try {
                //validate if the seller already exists
                const result = await session.run(`MATCH (u:Proveedor {num_doc : '${proveedor.num_doc}'}) return u`);
                if (result.records.length > 0) {
                    return 'Proveedor ya existe'
                }
                //create the seller
                const prov = await session.run(`CREATE (u:Proveedor {proveedor_id : '${proveedor.proveedor_id}', nombres: '${proveedor.nombres}', apellidos: '${proveedor.apellidos}', num_doc: '${proveedor.num_doc}'} ) return u`);
                return prov.records[0].get('u').properties;

            } catch (error) {
                return 'Error in create conection'.red
            }
        }
        return create();
    }

    //find all sellers
    findAllProv() {
        const findAll = async () => {
            try {
                console.log('Connected to neo4j...'.yellow)
                const result = await session.run(`Match (u:Proveedor) return u`)
                //validate if the seller exists
                if (result.records.length === 0) {
                    return { error: 'No se encontraron proveedores' }
                } else {
                    return result.records.map(i => i.get('u').properties)
                }
            } catch (error) {
                return 'Error in findAll conection'
            }
        }
    }
    //find a seller by id
    findByIdProv(id) {
        const findById = async (num_doc) => {
            try {
                const result = await session.run(`MATCH (u:Proveedor {num_doc : '${num_doc}'} ) return u limit 1`)
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
    }

    //update a seller
    updateProv(id, seller) {
        const findByIdAndUpdate = async () => {
            try {
                const result = await session.run(`MATCH (u:Seller {_id : '${id}'}) SET u.name= '${seller.name}', doc_type: '${seller.doc_type}', doc_number: '${seller.doc_number}' return u`)
                return result.records[0].get('u').properties
            } catch (error) {
                return 'Error in findByIdAndUpdate conection'
            }
        }
    }
    //delete a seller
    deleteProv(id) {
        const findByIdAndDelete = async () => {
            try {
                await session.run(`MATCH (u:Seller {_id : '${id}'}) DELETE u`)
                return await findAll()
            } catch (error) {
                return 'Error in findByIdAndDelete conection'
            }
        }
    }
}

module.exports = Proveedor;

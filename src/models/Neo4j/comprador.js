const neo4j = require('neo4j-driver');
const color = require('colors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()
let session;

class Comprador{
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

    //crear el nuevo comprador
    createComprador(comprador){
        const create = async () => {
            try {
                //validate if the seller already exists
                const result = await session.run(`MATCH (u:Comprador {num_doc : '${comprador.num_doc}'}) return u`);
                if (result.records.length > 0) {
                    return 'Comprador ya existe'
                }
                //create the seller
                const comp = await session.run(`CREATE (u:Comprador {comprador_id : '${comprador.comprador_id}', nombres: '${comprador.nombres}', apellidos: '${comprador.apellidos}', num_doc: '${comprador.num_doc}'} ) return u`);
                return comp.records[0].get('u').properties;

            } catch (error) {
                return 'Error in create conection'.red
            }
        }
        return create();
    }
    
}




//----------------------------------------------------------------------------------------------------------------------

module.exports = Comprador;
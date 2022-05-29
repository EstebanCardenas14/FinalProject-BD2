const buyer = require('./Neo4j/buyer');
const seller = require('./Neo4j/seller');
const product = require('./Neo4j/product');
const checkout = require('./mongoBD/checkout');

module.exports = {
    ...buyer,
    ...seller,
    ...product,
    ...checkout
}
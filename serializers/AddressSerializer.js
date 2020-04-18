class AddressSerializer {
    client;

    constructor(mysqlClient) {
        this.client = mysqlClient
    }

    async create(address) {
        const addressQuery = `INSERT INTO addresses (street, number, complement, neighborhood, reference_unit) VALUES ('${address.street}', '${address.number}', '${address.complement}', '${address.neighborhood}', '${address.reference_unit}')`
        const resultAddress = await this.client.query(addressQuery)
        return resultAddress.insertId
    }

}

module.exports = AddressSerializer
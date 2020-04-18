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

    async update(cpf, address) {
        const addressIDQuery = `SELECT address_ID AS value FROM pacients WHERE cpf = '${cpf}'`
                const address_ID_result = await this.client.query(addressIDQuery)
                const address_ID = address_ID_result[0].value
                if (address.street) await this.updateAddress(address_ID, "street", address.street)
                if (address.number) await this.updateAddress(address_ID, "number", address.number)
                if (address.complement) await this.updateAddress(address_ID, "complement", address.complement)
                if (address.neighborhood) await this.updateAddress(address_ID, "neighborhood", address.neighborhood)
                if (address.reference_unit) await this.updateAddress(address_ID, "reference_unit", address.reference_unit)
    }

    async updateAddress(addressID, columnName, value) {
        const query = `UPDATE addresses SET ${columnName}='${value}' WHERE address_ID='${addressID}'`
        await this.client.query(query)
    }

}

module.exports = AddressSerializer
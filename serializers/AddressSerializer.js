class AddressSerializer {
    client;

    constructor(mysqlClient) {
        this.client = mysqlClient
    }

    async create(address) {
        const addressQuery = `INSERT INTO addresses (street, number, complement, neighborhood, reference_unit) VALUES (?, ?, ?, ?, ?)`
        const values = [address.street, address.number, address.complement, address.neighborhood, address.reference_unit]
        const resultAddress = await this.client.query(addressQuery, values)
        return resultAddress.insertId
    }

    async update(cpf, address) {
        const addressIDQuery = `SELECT address_ID AS value FROM pacients WHERE cpf = ?`
        const value = [cpf]
        const address_ID_result = await this.client.query(addressIDQuery, value)
        const address_ID = address_ID_result[0].value
        if (address.street) await this.updateAddress(address_ID, "street", address.street)
        if (address.number) await this.updateAddress(address_ID, "number", address.number)
        if (address.complement) await this.updateAddress(address_ID, "complement", address.complement)
        if (address.neighborhood) await this.updateAddress(address_ID, "neighborhood", address.neighborhood)
        if (address.reference_unit) await this.updateAddress(address_ID, "reference_unit", address.reference_unit)
    }

    async updateAddress(addressID, columnName, value) {
        const query = `UPDATE addresses SET ?=? WHERE address_ID=?`
        const values = [columnName, value, addressID]
        await this.client.query(query, values)
    }

    async find(address_ID) {
        const addressQuery = `SELECT street, number, complement, neighborhood, reference_unit FROM addresses WHERE address_ID = ?`
        const value = [address_ID]
        const address = await this.client.query(addressQuery, value)
        if (!address.length) return {status: 500}

        return address[0]
    }

}

module.exports = AddressSerializer
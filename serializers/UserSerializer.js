MysqlClient = require("../database/MysqlClient")

class UserSerializer {
    client;

    constructor(mysqlClient) {
        this.client = mysqlClient
    }

    async create(user) {
        var httpCode = 201
        var queryValue = `INSERT INTO users (username, password) VALUES ('${user.username}', '${user.password}')`
        
        try {
            await this.client.query(queryValue)
            return httpCode
        } catch(err) {
            if (err.code && err.errno) {
                if (err.code == 'ER_DUP_ENTRY' || err.errno == 1062) {
                    httpCode = 409
                } else {
                    httpCode = 500
                }
            }

            return httpCode
        }
    }
}

module.exports = UserSerializer
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

    async authenticate(user) {
        const httpCode = 500
        var queryValue = `SELECT * FROM users WHERE username = '${user.username}'`

        try {
            await this.client.query(queryValue).then(result => {
                if (Array.isArray(result)) {
                    if (result[0] && result[0].password) {
                        httpCode = result[0].password === user.password ? 200 : 401
                    } else {
                        httpCode = 404
                    }
                }
    
                console.log(JSON.stringify(result))
                return httpCode
            }).catch(err => {throw err})
        } catch (error) {
            console.log("Eror during query: " + JSON.stringify(error))
            return httpCode
        }
    }
}

module.exports = UserSerializer
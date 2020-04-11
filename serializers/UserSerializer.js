MysqlClient = require("../database/MysqlClient")

class UserSerializer {
    client;

    constructor(mysqlClient) {
        this.client = mysqlClient
    }

    create(user) {
        console.log(`Creating new user: ${user.username}`)
        var httpCode = 201
        var queryValue = `INSERT INTO users (username, password) VALUES ('${user.username}', '${user.password}')`
        this.client.query(queryValue).then(result => {
            console.log(JSON.stringify(result))
            return httpCode
        }).catch(err => {
            console.log(JSON.stringify(err))
            if (err.code && err.errno) {
                if (err.code == 'ER_DUP_ENTRY' || err.errno == 1062) {
                    httpCode = 409
                } else {
                    httpCode = 500
                }
            }

            return httpCode
        })
    }
}

module.exports = UserSerializer
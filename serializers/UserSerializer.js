MysqlClient = require("../database/MysqlClient")

class UserSerializer {
    client;

    constructor(mysqlClient) {
        this.client = mysqlClient
    }

    create(user) {
        var httpCode = 201
        var queryValue = `INSERT INTO users (username, password) VALUES ('${user.username}', '${user.password}')`
        this.client.query(queryValue).then(result => {
            console.log("Worked! " + JSON.stringify(result))
            return httpCode
        }).catch(err => {
            console.log("Error: "+ JSON.stringify(err))
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
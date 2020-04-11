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
        return this.client.query(queryValue, function(err, result) {
            if(err) {
                console.log(JSON.stringify(err))
                if (result.code && result.errno) {
                    if (result.code == 'ER_DUP_ENTRY' || result.errno == 1062) {
                        httpCode = 409
                    } else {
                        httpCode = 500
                    }
                }
            }
            console.log(JSON.stringify(httpCode))
            return httpCode
        })
    }
}

module.exports = UserSerializer
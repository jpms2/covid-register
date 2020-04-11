MysqlClient = require("../database/MysqlClient")

class UserSerializer {
    client;

    constructor(mysqlClient) {
        this.client = mysqlClient
    }

    create(user) {
        console.log(`Creating new user: ${user.username}`)

        return this.client.query(`INSERT INTO users (username, password) VALUES ('${user.username}', '${user.password}')`, function(error, rows){
            if (error) {
                console.log("Received error from mysql")
                if (error.code == 'ER_DUP_ENTRY' || error.errno == 1062) {
                    return 409
                } else {
                    return 500
                }
            }

            console.log("Query succeeded")
            return 201
        })
    }
}

module.exports = UserSerializer
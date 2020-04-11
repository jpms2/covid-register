MysqlClient = require("../database/MysqlClient")

class UserSerializer {
    client;

    constructor(mysqlClient) {
        this.client = mysqlClient
    }

    create(user) {
        console.log(`Creating user ${user.username}`)

        if (!this.client.isConnected()) {
            throw new Error("Failed to create user, could not establish connection to database")
        }

        this.client.query(`INSERT INTO users (username, password) VALUES ('${user.username}', '${user.password}')`, function(error, rows){
            if (error) {
                if (error.code == 'ER_DUP_ENTRY' || error.errno == 1062) {
                    return 409
                } else {
                    return 500
                }
            }

            return 201
        })
    }
}

module.exports = UserSerializer
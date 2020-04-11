MysqlClient = require("../database/MysqlClient")

class UserSerializer {
    client;

    constructor(mysqlClient) {
        this.client = mysqlClient
    }

    create(user) {
        if (!this.client.isConnected()) {
            throw new Error("Failed to create user, could not establish connection to database")
        }

        this.client.query(`INSERT INTO user (username, password) VALUES (${user.username}, ${user.password})` function(error, rows){
            if (error) {
                if (error.code == 'ER_DUP_ENTRY' || error.errno == 1062) {
                    throw new UsernameAlreadyRegisteredError("Username is taken")
                } else {
                    throw new InternalError("Internal error")
                }
            }

            return rows
        })
    }
}

module.exports = UserSerializer
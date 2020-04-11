MysqlClient = require("../database/MysqlClient")

class UserSerializer {
    client;

    constructor(mysqlClient) {
        this.client = mysqlClient
    }

    create(user) {
        console.log(`Creating new user: ${user.username}`)
        var httpCode = 201

       result = this.client.query(`INSERT INTO users (username, password) VALUES ('${user.username}', '${user.password}')`)
       if (result instanceof Error) {
           console.log("Received error from mysql")
           if (error.code == 'ER_DUP_ENTRY' || error.errno == 1062) {
               httpCode = 409
           } else {
               httpCode = 500
           }
        }
        
        return httpCode
    }
}

module.exports = UserSerializer
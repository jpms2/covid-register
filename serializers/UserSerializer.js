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
        this.client.query(queryValue)
          .then(rows => {
            console.log(JSON.stringify(rows))
            console.log(`request passed with: ${httpCode}`)  
            return httpCode
          })
          .catch(err => {
            console.log(JSON.stringify(err))
            if (err.code == 'ER_DUP_ENTRY' || err.errno == 1062) {
                httpCode = 409
            } else {
                httpCode = 500
            }

            console.log(`Failed request with: ${httpCode}`)
            return httpCode
        })
    }
}

module.exports = UserSerializer
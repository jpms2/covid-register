UserSerializer = require("../serializers/UserSerializer")
MysqlClient = require("../database/MysqlClient")

class UserController{
    userSerializer;

    constructor(mysqlClient) {
        this.userSerializer = new UserSerializer(mysqlClient)
    }

    create(user) {
        let httpCode = await this.userSerializer.create(user)
        console.log(`Creation finished with code ${httpCode}`)
        return httpCode
    }
}

module.exports = UserController
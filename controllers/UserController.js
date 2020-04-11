UserSerializer = require("../serializers/UserSerializer")
MysqlClient = require("../database/MysqlClient")

class UserController{
    userSerializer;

    constructor(mysqlClient) {
        this.userSerializer = new UserSerializer(mysqlClient)
    }

    async create(user) {
         const httpCode = await this.userSerializer.create(user)
            var message
            switch (httpCode) {
                case 500 :
                    message = "Internal error"
                    break;
                case 409 :
                    message = "Username is already taken"
                    break;
                case 201 :
                    message = "OK"
                    break;
            }
            return {message : message, statusCode: httpCode}
    }
}

module.exports = UserController
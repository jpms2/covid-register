PacientSerializer = require("../serializers/PacientSerializer")
MysqlClient = require("../database/MysqlClient")

class PacientController{
    pacientSerializer;

    constructor(mysqlClient) {
        this.pacientSerializer = new PacientSerializer(mysqlClient)
    }

    async create(user, pacient) {
         const httpCode = await this.pacientSerializer.create(user.username, pacient)
            var message
            switch (httpCode) {
                case 500 :
                    message = "Internal error"
                    break;
                case 409 :
                    message = "This CPF is already registered"
                    break;
                case 201 :
                    message = "OK"
                    break;
            }
            return {message : message, statusCode: httpCode}
    }
}

module.exports = PacientController
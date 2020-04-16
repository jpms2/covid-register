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

    async update(pacient) {
        const httpCode = await this.pacientSerializer.create(pacient)
        switch (httpCode) {
            case 500 :
                message = "Internal error"
                break;
            case 409 :
                message = "No pacient found with this CPF"
                break;
            case 201 :
                message = "OK"
                break;
        }

        return {message: message, statusCode: httpCode}
    }

    async find(cpf) {
        const pacient = await this.pacientSerializer.find(cpf)
        return pacient
    }

    async list(list) {
        const pacients = await this.pacientSerializer.list(list)
        return pacients
    }
}

module.exports = PacientController
ReportSerializer = require("../serializers/ReportSerializer")
MysqlClient = require("../database/MysqlClient")

class ReportController{
    reportSerializer;

    constructor(mysqlClient) {
        this.reportSerializer = new ReportSerializer(mysqlClient)
    }

    async create(body) {
        const httpCode = await this.reportSerializer.createSubsequent(body.cpf, body.report)
           var message
           switch (httpCode) {
               case 500 :
                   message = "Internal error"
                   break;
               case 409 :
                   message = "There is no pacient with this cpf"
                   break;
               case 201 :
                   message = "OK"
                   break;
           }
           return {message : message, statusCode: httpCode}
   }
}

module.exports = ReportController
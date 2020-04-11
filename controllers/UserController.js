UserSerializer = require("../serializers/UserSerializer")
MysqlClient = require("../database/MysqlClient")

class UserController{
    userSerializer;

    constructor(mysqlClient) {
        this.userSerializer = new UserSerializer(mysqlClient)
    }

    create(user) {
         this.userSerializer.create(user, function(httpCode) {
            console.log(JSON.stringify(httpCode))
            var message
            switch (httpCode) {
                case 500 :
                    message = "Internal error"
                case 409 :
                    message = "Username is already taken"
                case 201 :
                    message = "OK"    
            }
            return {message : message, statusCode: httpCode}
         })
    }
}

module.exports = UserController
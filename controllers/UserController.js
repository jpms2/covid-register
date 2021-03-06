UserSerializer = require("../serializers/UserSerializer")
bcrypt = require('bcrypt');
MysqlClient = require("../database/MysqlClient")

class UserController{
    userSerializer;

    constructor(mysqlClient) {
        this.userSerializer = new UserSerializer(mysqlClient)
    }

    async create(user) {
        const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS, 10))
        const hash = await bcrypt.hash(user.password, salt)

         const httpCode = await this.userSerializer.create({username: user.username, password: hash})
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

    async authenticate(user) {
        var result = await this.userSerializer.authenticate(user)
        
        if (result.hash) {
            const authenticated = await bcrypt.compare(user.password, result.hash)
            result.httpCode = authenticated ? 200 : 401
        }

        var message
        switch (result.httpCode) {
            case 404: 
                message = "User not found"
                break
            case 401:
                message = "Wrong password"
                break
            case 200:
                message = "OK"
                break
            case 500 :
                message = "Internal error"
                break;
        }

        return{message : message, statusCode: result.httpCode}
    }
}

module.exports = UserController
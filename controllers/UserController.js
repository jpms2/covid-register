UserSerializer = require("../serializers/UserSerializer")
MysqlClient = require("../database/MysqlClient")
UserBuilder = require("../builders/UserBuilder")

class UserController{
    userSerializer;
    userBuilder;

    constructor(mysqlClient) {
        this.userSerializer = new UserSerializer(mysqlClient)
        this.userBuilder = new UserBuilder()
    }

    create(body) {
        user = userBuilder.build(req.body)
        this.userSerializer.create(user)
    }
}

module.exports = UserController
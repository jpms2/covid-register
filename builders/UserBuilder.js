User = require("../models/User")

class UserBuilder {
    constructor(){}

    build(body) {
        return new User(body.user.username, body.user.password)
    }
}

module.exports = UserBuilder
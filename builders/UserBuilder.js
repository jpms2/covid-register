User = require("../models/User")

class UserBuilder {
    constructor(){}

    build(body) {
        return new User(body.username, body.password)
    }
}

module.exports = UserBuilder
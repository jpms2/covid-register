require('dotenv').config()

var express = require("express");
var cors = require("cors")
var app = express();
app.use(express.json());
app.use(cors())

var UserController = require("./controllers/UserController")
var MysqlClient = require("./database/MysqlClient")

var port = process.argv.slice(2)[0];

if (isNaN(port)) {
    throw new Error("Please provide a port for the application")
}

mysqlClient = new MysqlClient();
mysqlClient.connect()
userController = new UserController(mysqlClient)

app.post("/create/user", (req, res, next) => {
    userController.create(req.body.user).then(message => {
        res.status(message.statusCode).send(message)
    })
});

app.listen(port, () => {
 console.log("Server running on port " + port);
});